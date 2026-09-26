const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');

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
          giroPadrao: usuario.perfilConfiguracao?.giroPadrao || ''
        }
      });
    } catch (error) {
      console.error('[ERRO OBTER PERFIL]', error);
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
      console.error('[ERRO ATUALIZAR PERFIL]', error);
      return res.status(500).json({
        status: 'erro',
        mensagem: 'Ocorreu um erro ao atualizar o perfil.'
      });
    }
  }
}

module.exports = new PerfilController();
