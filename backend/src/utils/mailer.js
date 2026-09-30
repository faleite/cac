const nodemailer = require('nodemailer');
const config = require('../config');

// Configuração otimizada para SMTP Brevo (porta 587 STARTTLS ou 465 SSL)
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: Number(config.email.port) === 465, // true para SSL na porta 465, false para 587 (STARTTLS)
  auth: (config.email.user && config.email.pass) ? {
    user: config.email.user,
    pass: config.email.pass
  } : undefined,
  connectionTimeout: 10000, // 10 segundos para timeout de conexão
  greetingTimeout: 10000,
  socketTimeout: 15000
});

/**
 * Testa a conexão com o servidor SMTP (Brevo)
 * @returns {Promise<{conectado: boolean, modoSimulado?: boolean, mensagem: string, erro?: string}>}
 */
async function verificarConexaoSMTP() {
  if (!config.email.user || !config.email.pass) {
    return {
      conectado: false,
      modoSimulado: true,
      mensagem: 'Credenciais SMTP ausentes no .env (modo simulado ativo).'
    };
  }

  try {
    await transporter.verify();
    return {
      conectado: true,
      modoSimulado: false,
      mensagem: `Conexão SMTP com Brevo (${config.email.host}:${config.email.port}) estabelecida com sucesso!`
    };
  } catch (error) {
    return {
      conectado: false,
      modoSimulado: false,
      erro: error.message,
      mensagem: `Falha ao conectar ao servidor SMTP (${config.email.host}:${config.email.port}): ${error.message}`
    };
  }
}

/**
 * Envia e-mail de recuperação de senha com token de 1 hora
 * @param {string} destinatario - E-mail do usuário
 * @param {string} nome - Nome do usuário
 * @param {string} token - Token de recuperação único
 * @param {string} hostBaseUrl - URL base para montagem do link
 * @returns {Promise<{sucesso: boolean, link: string, messageId?: string, simulado?: boolean, erro?: string}>}
 */
async function enviarEmailRecuperacao(destinatario, nome, token, hostBaseUrl = 'http://localhost') {
  const baseUrl = (config.appUrl || hostBaseUrl || 'http://localhost').replace(/\/$/, '');
  const linkRecuperacao = `${baseUrl}/redefinir-senha.html?token=${encodeURIComponent(token)}`;

  // Formatar remetente conforme padrão oficial
  const remetente = config.email.from.includes('<')
    ? config.email.from
    : `CAC Atividades <${config.email.from}>`;

  const mensagem = {
    from: remetente,
    to: destinatario,
    subject: 'Recuperação de Palavra-passe - CAC Atividades',
    text: `Olá, ${nome}.\n\nRecebemos uma solicitação para redefinir a sua palavra-passe no sistema CAC Atividades.\n\nPara definir uma nova palavra-passe, aceda ao seguinte link (válido por 1 hora):\n${linkRecuperacao}\n\nSe não fez esta solicitação, pode ignorar esta mensagem em segurança.\n\nAtenciosamente,\nEquipa CAC Atividades`,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1a1c1c; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2dfde; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #a8001c; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.01em;">CAC Atividades</h1>
          <p style="color: #5f5e5e; font-size: 14px; margin-top: 4px; margin-bottom: 0;">Controlo de Atividades Correios</p>
        </div>
        <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="font-size: 16px; margin-top: 0;">Olá, <strong>${nome}</strong>.</p>
          <p style="font-size: 15px; line-height: 1.5; color: #1a1c1c;">Recebemos uma solicitação para redefinir a sua palavra-passe de acesso à plataforma.</p>
          <p style="font-size: 15px; line-height: 1.5; color: #1a1c1c;">Clique no botão abaixo para definir uma nova palavra-passe:</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${linkRecuperacao}" style="background-color: #a8001c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; min-height: 48px; box-sizing: border-box; line-height: 20px;">Redefinir Palavra-passe</a>
          </div>
          <p style="font-size: 13px; color: #5f5e5e; line-height: 1.4; margin-bottom: 0;">
            Se o botão não funcionar, copie e cole o seguinte link no seu navegador:<br>
            <a href="${linkRecuperacao}" style="color: #a8001c; word-break: break-all; font-size: 12px;">${linkRecuperacao}</a>
          </p>
        </div>
        <p style="font-size: 13px; color: #5f5e5e; line-height: 1.4;">
          <strong>Atenção:</strong> Este link é válido por estritamente <strong>1 hora</strong> a partir do momento da solicitação. Caso você não tenha solicitado a alteração da palavra-passe, nenhuma ação é necessária e a sua conta permanece segura.
        </p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;">
        <p style="font-size: 12px; color: #888888; text-align: center; margin: 0;">
          CAC Atividades &bull; Mensagem automática do sistema &bull; Por favor, não responda a este e-mail
        </p>
      </div>
    `
  };

  try {
    if (config.email.user && config.email.pass) {
      const info = await transporter.sendMail(mensagem);
      console.log(`[MAILER] E-mail de recuperação enviado com sucesso via Brevo para ${destinatario} (MessageId: ${info.messageId})`);
      return { sucesso: true, messageId: info.messageId, link: linkRecuperacao };
    } else {
      console.log(`[MAILER SIMULADO] E-mail de recuperação para ${destinatario}. Link: ${linkRecuperacao}`);
      return { sucesso: true, simulado: true, link: linkRecuperacao };
    }
  } catch (error) {
    console.error(`[MAILER ERRO] Falha ao enviar e-mail via SMTP (${config.email.host}) para ${destinatario}:`, error.message);
    return { sucesso: false, erro: error.message, link: linkRecuperacao };
  }
}

module.exports = {
  transporter,
  verificarConexaoSMTP,
  enviarEmailRecuperacao
};
