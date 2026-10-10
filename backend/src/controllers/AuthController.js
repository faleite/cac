const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');
const config = require('../config');
const { enviarEmailRecuperacao } = require('../utils/mailer');
const { logErro, logSeguranca } = require('../utils/logger');

const SALT_ROUNDS = 10;

class AuthController {
  /**
   * Auto-registo de colaborador
   * Atribui obrigatoriamente perfil 'operador' (prevenção de auto-elevação)
   */
  async registo(req, res) {
    try {
      const { primeiro_nome, ultimo_nome, nome_completo, numero_sc, telemovel, email, senha, confirmar_senha, aceitou_termos, matricula_padrao, giro_padrao } = req.body;

      // Suporte a primeiro_nome + ultimo_nome, com fallback inteligente para nome_completo
      let pNome = primeiro_nome ? primeiro_nome.trim() : '';
      let uNome = ultimo_nome ? ultimo_nome.trim() : '';
      if (!pNome && nome_completo) {
        const partes = nome_completo.trim().split(/\s+/);
        pNome = partes[0] || '';
        uNome = partes.slice(1).join(' ') || '';
      }

      // Validação de consentimento livre e informado (RGPD)
      if (aceitou_termos !== true && aceitou_termos !== 'true') {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'É obrigatório ler e aceitar os Termos de Uso e a Política de Privacidade em conformidade com o RGPD.'
        });
      }

      // Validação de campos obrigatórios
      if (!pNome || !uNome || !numero_sc || !telemovel || !email || !senha) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Todos os campos são de preenchimento obrigatório.'
        });
      }

      // Validação estrita: apenas um único nome em cada campo (sem espaços nem números)
      const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$/;
      if (/\s/.test(pNome) || !nomeRegex.test(pNome)) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'O primeiro nome deve conter apenas um único nome (sem espaços ou números).'
        });
      }

      if (/\s/.test(uNome) || !nomeRegex.test(uNome)) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'O último nome deve conter apenas um único nome (sem espaços ou números).'
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'A palavra-passe deve conter no mínimo 6 caracteres.'
        });
      }

      if (confirmar_senha && senha !== confirmar_senha) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'A confirmação de palavra-passe não coincide.'
        });
      }

      const emailFormatado = email.trim().toLowerCase();
      const scFormatado = numero_sc.trim().toUpperCase();

      // Verificar duplicidade de SC ou Email
      const usuarioExistente = await prisma.usuario.findFirst({
        where: {
          OR: [
            { email: emailFormatado },
            { numeroSc: scFormatado }
          ]
        }
      });

      if (usuarioExistente) {
        return res.status(409).json({
          status: 'erro',
          mensagem: 'O Número SC ou E-mail já se encontra registado na plataforma.'
        });
      }

      // Hash seguro da senha
      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

      // Criação transacional do Usuário e seu PerfilConfiguracao
      const novoUsuario = await prisma.$transaction(async (tx) => {
        const agora = new Date();
        const usuario = await tx.usuario.create({
          data: {
            primeiroNome: pNome,
            ultimoNome: uNome,
            numeroSc: scFormatado,
            telemovel: telemovel.trim(),
            email: emailFormatado,
            senhaHash: senhaHash,
            perfil: 'operador', // Perfil fixo e imutável no auto-registo
            ativo: true,
            termosAceitosEm: agora,
            termosVersao: '1.0'
          }
        });

        // Sanitização de matrícula e giro padrão opcionais
        const mPadrao = matricula_padrao && typeof matricula_padrao === 'string' && matricula_padrao.trim() ? matricula_padrao.trim().toUpperCase() : null;
        const gPadrao = giro_padrao && typeof giro_padrao === 'string' && giro_padrao.trim() ? giro_padrao.trim().toUpperCase() : null;

        await tx.perfilConfiguracao.create({
          data: {
            usuarioId: usuario.id,
            matriculaPadrao: mPadrao,
            giroPadrao: gPadrao
          }
        });

        return usuario;
      });

      // Estabelecer sessão do usuário recém-criado
      req.session.usuario = {
        id: novoUsuario.id.toString(),
        nome: `${novoUsuario.primeiroNome} ${novoUsuario.ultimoNome}`.trim(),
        primeiroNome: novoUsuario.primeiroNome,
        ultimoNome: novoUsuario.ultimoNome,
        numeroSc: novoUsuario.numeroSc,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil
      };

      return res.status(201).json({
        status: 'sucesso',
        mensagem: 'Conta de colaborador criada com sucesso.',
        usuario: req.session.usuario
      });

    } catch (error) {
      logErro('AUTH_REGISTO', 'Erro no processamento de auto-registo', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro interno ao processar o registo. Tente novamente mais tarde.'
      });
    }
  }

  /**
   * Login via Número de Colaborador (SC) ou E-mail
   */
  async login(req, res) {
    try {
      const { identificador, senha } = req.body;

      if (!identificador || !senha) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Por favor introduza o seu Número SC/E-mail e a Palavra-passe.'
        });
      }

      const idFormatado = identificador.trim();

      // Busca flexível por SC ou E-mail
      const usuario = await prisma.usuario.findFirst({
        where: {
          AND: [
            { ativo: true },
            {
              OR: [
                { email: idFormatado.toLowerCase() },
                { numeroSc: idFormatado.toUpperCase() }
              ]
            }
          ]
        },
        include: {
          perfilConfiguracao: true
        }
      });

      // Mensagem genérica para prevenir enumeração de contas
      if (!usuario) {
        logSeguranca('LOGIN_FALHOU', {
          identificador: idFormatado,
          motivo: 'Utilizador não encontrado ou inativo',
          ip: req.ip || req.connection?.remoteAddress
        });
        return res.status(401).json({
          status: 'erro',
          mensagem: 'Credenciais de acesso incorretas. Tente novamente.'
        });
      }

      // Verificação da senha
      const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
      if (!senhaValida) {
        logSeguranca('LOGIN_FALHOU', {
          usuarioId: usuario.id.toString(),
          identificador: idFormatado,
          motivo: 'Palavra-passe inválida',
          ip: req.ip || req.connection?.remoteAddress
        });
        return res.status(401).json({
          status: 'erro',
          mensagem: 'Credenciais de acesso incorretas. Tente novamente.'
        });
      }

      // Estabelecer sessão ativa
      req.session.usuario = {
        id: usuario.id.toString(),
        nome: `${usuario.primeiroNome} ${usuario.ultimoNome}`.trim(),
        primeiroNome: usuario.primeiroNome,
        ultimoNome: usuario.ultimoNome,
        numeroSc: usuario.numeroSc,
        email: usuario.email,
        perfil: usuario.perfil
      };

      return res.json({
        status: 'sucesso',
        mensagem: 'Sessão iniciada com sucesso.',
        usuario: req.session.usuario
      });

    } catch (error) {
      logErro('AUTH_LOGIN', 'Erro no processamento de login', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao processar o início de sessão.'
      });
    }
  }

  /**
   * Encerramento de sessão (Logout)
   */
  async logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('[ERRO LOGOUT]', err);
        return res.status(500).json({
          status: 'erro',
          mensagem: 'Erro ao encerrar a sessão.'
        });
      }

      res.clearCookie('cac_session_id');
      return res.json({
        status: 'sucesso',
        mensagem: 'Sessão terminada com sucesso.'
      });
    });
  }

  /**
   * Consulta dos dados da sessão ativa
   */
  async me(req, res) {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({
        status: 'erro',
        autenticado: false,
        mensagem: 'Nenhuma sessão ativa encontrada.'
      });
    }

    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: BigInt(req.session.usuario.id) },
        include: { perfilConfiguracao: true }
      });

      if (!usuario || !usuario.ativo) {
        req.session.destroy(() => {});
        res.clearCookie('cac_session_id');
        return res.status(401).json({
          status: 'erro',
          autenticado: false,
          mensagem: 'Utilizador inativo ou não encontrado.'
        });
      }

      return res.json({
        status: 'sucesso',
        autenticado: true,
        usuario: {
          id: usuario.id.toString(),
          nome: `${usuario.primeiroNome} ${usuario.ultimoNome}`.trim(),
          primeiroNome: usuario.primeiroNome,
          ultimoNome: usuario.ultimoNome,
          numeroSc: usuario.numeroSc,
          telemovel: usuario.telemovel,
          email: usuario.email,
          perfil: usuario.perfil,
          matriculaPadrao: usuario.perfilConfiguracao?.matriculaPadrao || '',
          giroPadrao: usuario.perfilConfiguracao?.giroPadrao || '',
          termosAceitosEm: usuario.termosAceitosEm ? usuario.termosAceitosEm.toISOString() : null,
          termosVersao: usuario.termosVersao || null
        }
      });
    } catch (error) {
      logErro('AUTH_ME', 'Falha ao consultar dados da sessão', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Falha ao consultar dados da sessão.'
      });
    }
  }

  /**
   * Solicitar e-mail de recuperação de palavra-passe
   */
  async recuperarSenha(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Por favor indique o seu endereço de e-mail.'
        });
      }

      const emailFormatado = email.trim().toLowerCase();

      const usuario = await prisma.usuario.findFirst({
        where: {
          email: emailFormatado,
          ativo: true
        }
      });

      // Se existir, gera token de 1 hora e envia e-mail
      if (usuario) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiracao = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await prisma.usuario.update({
          where: { id: usuario.id },
          data: {
            tokenRecuperacao: token,
            tokenExpiracao: expiracao
          }
        });

        logSeguranca('RECUPERACAO_SENHA_SOLICITADA', {
          usuarioId: usuario.id.toString(),
          email: usuario.email,
          ip: req.ip || req.connection?.remoteAddress
        });

        // Montar a URL base da requisição (prioriza APP_URL do .env)
        const hostBaseUrl = config.appUrl || `${req.protocol}://${req.get('host')}`;

        const nomeUsuario = `${usuario.primeiroNome} ${usuario.ultimoNome}`.trim();
        const resultadoEnvio = await enviarEmailRecuperacao(usuario.email, nomeUsuario, token, hostBaseUrl);
        if (!resultadoEnvio.sucesso) {
          logErro('AUTH_RECOVERY_EMAIL', `Falha no disparo do e-mail de recuperação: ${resultadoEnvio.erro}`);
        }
      }

      // Resposta genérica para evitar enumeração de utilizadores (FSD Seção 12.3)
      return res.json({
        status: 'sucesso',
        mensagem: 'Se o e-mail existir na nossa base de dados, receberá as instruções em breve.'
      });

    } catch (error) {
      logErro('AUTH_RECUPERAR_SENHA', 'Erro ao processar pedido de recuperação', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao processar o pedido de recuperação.'
      });
    }
  }

  /**
   * Redefinir palavra-passe usando token
   */
  async redefinirSenha(req, res) {
    try {
      const { token, nova_senha, confirmar_senha } = req.body;

      if (!token || !nova_senha) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Token de validação e nova palavra-passe são obrigatórios.'
        });
      }

      if (nova_senha.length < 6) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'A nova palavra-passe deve conter pelo menos 6 caracteres.'
        });
      }

      if (confirmar_senha && nova_senha !== confirmar_senha) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'A confirmação da palavra-passe não coincide.'
        });
      }

      // Buscar usuário com o token válido e dentro do prazo
      const usuario = await prisma.usuario.findFirst({
        where: {
          tokenRecuperacao: token,
          tokenExpiracao: {
            gt: new Date()
          },
          ativo: true
        }
      });

      if (!usuario) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'O link de recuperação é inválido ou já expirou. Solicite um novo link.'
        });
      }

      // Hash da nova senha
      const novoHash = await bcrypt.hash(nova_senha, SALT_ROUNDS);

      // Atualizar senha e invalidar token
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          senhaHash: novoHash,
          tokenRecuperacao: null,
          tokenExpiracao: null
        }
      });

      logSeguranca('SENHA_REDEFINIDA_SUCESSO', {
        usuarioId: usuario.id.toString(),
        ip: req.ip || req.connection?.remoteAddress
      });

      return res.json({
        status: 'sucesso',
        mensagem: 'Palavra-passe redefinida com sucesso. Pode agora iniciar sessão.'
      });

    } catch (error) {
      logErro('AUTH_REDEFINIR_SENHA', 'Erro ao redefinir palavra-passe', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao redefinir a palavra-passe.'
      });
    }
  }
}

module.exports = new AuthController();
