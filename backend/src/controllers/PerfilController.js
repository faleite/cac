const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');
const { logErro, logSeguranca } = require('../utils/logger');

const SALT_ROUNDS = 10;

class PerfilController {
  /**
   * Obter dados do perfil do usuário autenticado
   */
  async obterPerfil(req, res) {
    try {
      const usuarioId = BigInt(req.session.usuario.id);

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: { perfilConfiguracao: true }
      });

      if (!usuario) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Utilizador não encontrado.'
        });
      }

      return res.json({
        status: 'sucesso',
        dados: {
          id: usuario.id.toString(),
          nomeCompleto: usuario.nomeCompleto,
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
      logErro('PERFIL_OBTER', 'Erro ao consultar dados do perfil', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Erro ao consultar dados do perfil.'
      });
    }
  }

  /**
   * Atualizar dados cadastrais, preferências de veículo/giro e palavra-passe
   */
  async atualizarPerfil(req, res) {
    try {
      const usuarioId = BigInt(req.session.usuario.id);
      const {
        nome_completo,
        telemovel,
        matricula_padrao,
        giro_padrao,
        senha_atual,
        nova_senha,
        confirmar_nova_senha
      } = req.body;

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId }
      });

      if (!usuario) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Utilizador não encontrado.'
        });
      }

      const updateData = {};

      if (nome_completo && nome_completo.trim()) {
        updateData.nomeCompleto = nome_completo.trim();
      }

      if (telemovel && telemovel.trim()) {
        updateData.telemovel = telemovel.trim();
      }

      // Se solicitada troca de senha
      if (nova_senha) {
        if (nova_senha.length < 6) {
          return res.status(400).json({
            status: 'erro',
            mensagem: 'A nova palavra-passe deve ter pelo menos 6 caracteres.'
          });
        }

        if (confirmar_nova_senha && nova_senha !== confirmar_nova_senha) {
          return res.status(400).json({
            status: 'erro',
            mensagem: 'A confirmação da nova palavra-passe não coincide.'
          });
        }

        if (senha_atual) {
          const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senhaHash);
          if (!senhaCorreta) {
            logSeguranca('TROCA_SENHA_RECUSADA', {
              usuarioId: usuarioId.toString(),
              motivo: 'Palavra-passe atual incorreta',
              ip: req.ip || req.connection?.remoteAddress
            });
            return res.status(400).json({
              status: 'erro',
              mensagem: 'A palavra-passe atual indicada está incorreta.'
            });
          }
        }

        updateData.senhaHash = await bcrypt.hash(nova_senha, SALT_ROUNDS);
      }

      // Executar atualização de usuário e perfil de configuração
      const matriculaFormatada = matricula_padrao ? matricula_padrao.trim().toUpperCase() : null;
      const giroFormatado = giro_padrao ? giro_padrao.trim().toUpperCase() : null;

      await prisma.$transaction(async (tx) => {
        if (Object.keys(updateData).length > 0) {
          await tx.usuario.update({
            where: { id: usuarioId },
            data: updateData
          });
        }

        await tx.perfilConfiguracao.upsert({
          where: { usuarioId: usuarioId },
          update: {
            matriculaPadrao: matriculaFormatada,
            giroPadrao: giroFormatado
          },
          create: {
            usuarioId: usuarioId,
            matriculaPadrao: matriculaFormatada,
            giroPadrao: giroFormatado
          }
        });
      });

      // Atualizar dados da sessão caso o nome tenha mudado
      if (updateData.nomeCompleto) {
        req.session.usuario.nome = updateData.nomeCompleto;
      }

      return res.json({
        status: 'sucesso',
        mensagem: 'Perfil e preferências guardados com sucesso.'
      });

    } catch (error) {
      logErro('PERFIL_ATUALIZAR', 'Erro ao atualizar dados do perfil', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao atualizar o perfil.'
      });
    }
  }

  /**
   * Eliminar conta e todos os dados pessoais do colaborador (Direito ao Esquecimento - RGPD)
   * Remove de forma permanente: preferências, auditorias, turnos e usuário.
   */
  async eliminarConta(req, res) {
    try {
      const usuarioId = BigInt(req.session.usuario.id);
      const { senha } = req.body;

      if (!senha) {
        return res.status(400).json({
          status: 'erro',
          mensagem: 'Por favor, introduza a sua palavra-passe atual para confirmar a eliminação definitiva da conta.'
        });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId }
      });

      if (!usuario) {
        return res.status(404).json({
          status: 'erro',
          mensagem: 'Utilizador não encontrado.'
        });
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
      if (!senhaCorreta) {
        logSeguranca('ELIMINACAO_CONTA_RECUSADA', {
          usuarioId: usuarioId.toString(),
          motivo: 'Palavra-passe de confirmação incorreta',
          ip: req.ip || req.connection?.remoteAddress
        });
        return res.status(401).json({
          status: 'erro',
          mensagem: 'A palavra-passe indicada está incorreta. A conta não foi eliminada.'
        });
      }

      // Execução transacional para remoção definitiva de todos os dados do titular
      await prisma.$transaction(async (tx) => {
        // 1. Remover auditorias criadas por este usuário
        await tx.auditoriaRegisto.deleteMany({
          where: { usuarioAlteracaoId: usuarioId }
        });

        // 2. Remover auditorias filhas dos registos deste usuário
        await tx.auditoriaRegisto.deleteMany({
          where: {
            registoDiario: {
              usuarioId: usuarioId
            }
          }
        });

        // 3. Remover registos diários de turnos
        await tx.registoDiario.deleteMany({
          where: { usuarioId: usuarioId }
        });

        // 4. Remover perfil de configuração (preferências habituais)
        await tx.perfilConfiguracao.deleteMany({
          where: { usuarioId: usuarioId }
        });

        // 5. Anonimizar referências em logs de segurança (preserva auditoria de sistema desvinculada)
        await tx.logSeguranca.updateMany({
          where: { usuarioId: usuarioId },
          data: { usuarioId: null }
        });

        // 6. Eliminar o registro do usuário
        await tx.usuario.delete({
          where: { id: usuarioId }
        });
      });

      logSeguranca('CONTA_ELIMINADA_RGPD', {
        usuarioExcluidoId: usuarioId.toString(),
        ip: req.ip || req.connection?.remoteAddress
      });

      // Destruir sessão ativa e limpar cookies
      req.session.destroy((err) => {
        if (err) {
          logErro('PERFIL_DESTROY_SESSION', 'Erro ao destruir sessão após exclusão de conta RGPD', err);
        }
        res.clearCookie('cac_session_id');
        return res.json({
          status: 'sucesso',
          mensagem: 'A sua conta e todos os dados associados foram eliminados permanentemente em conformidade com o RGPD.'
        });
      });

    } catch (error) {
      logErro('PERFIL_ELIMINAR_CONTA', 'Erro ao processar eliminação de conta RGPD', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao processar a eliminação da conta.'
      });
    }
  }
}

module.exports = new PerfilController();
