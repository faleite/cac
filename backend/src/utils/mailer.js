const nodemailer = require('nodemailer');
const config = require('../config');

// Criar o transporter baseado nas variáveis de configuração
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  auth: (config.email.user && config.email.pass) ? {
    user: config.email.user,
    pass: config.email.pass
  } : undefined
});

/**
 * Envia e-mail de recuperação de senha
 * @param {string} destinatario - E-mail do usuário
 * @param {string} nome - Nome do usuário
 * @param {string} token - Token de recuperação único
 * @param {string} hostBaseUrl - URL base para montagem do link
 */
async function enviarEmailRecuperacao(destinatario, nome, token, hostBaseUrl = 'http://localhost') {
  const linkRecuperacao = `${hostBaseUrl}/redefinir-senha.html?token=${token}`;

  const mensagem = {
    from: `CAC Atividades <${config.email.from}>`,
    to: destinatario,
    subject: 'Recuperação de Palavra-passe - CAC Atividades',
    text: `Olá, ${nome}.\n\nRecebemos uma solicitação para redefinir a sua palavra-passe no sistema CAC Atividades.\n\nPara definir uma nova palavra-passe, aceda ao seguinte link (válido por 1 hora):\n${linkRecuperacao}\n\nSe não fez esta solicitação, pode ignorar esta mensagem em segurança.\n\nAtenciosamente,\nEquipa CAC Atividades`,
    html: `
      <div style="font-family: 'Inter', sans-serif, Arial; color: #1a1c1c; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2dfde; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #a8001c; margin: 0; font-size: 24px;">CAC Atividades</h1>
          <p style="color: #5f5e5e; font-size: 14px; margin-top: 4px;">Controlo de Atividades Correios</p>
        </div>
        <p style="font-size: 16px;">Olá, <strong>${nome}</strong>.</p>
        <p style="font-size: 16px; line-height: 1.5;">Recebemos uma solicitação para redefinir a sua palavra-passe de acesso.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${linkRecuperacao}" style="background-color: #a8001c; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Redefinir Palavra-passe</a>
        </div>
        <p style="font-size: 14px; color: #5f5e5e; line-height: 1.4;">Este link é válido por <strong>1 hora</strong>. Se não solicitou a alteração, nenhuma ação é necessária.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;">
        <p style="font-size: 12px; color: #888888; text-align: center;">CAC Atividades &bull; Mensagem automática do sistema</p>
      </div>
    `
  };

  try {
    if (config.email.user && config.email.pass) {
      await transporter.sendMail(mensagem);
    } else {
      console.log(`[MAILER SIMULADO] E-mail de recuperação para ${destinatario}. Link: ${linkRecuperacao}`);
    }
    return { sucesso: true, link: linkRecuperacao };
  } catch (error) {
    console.error(`[MAILER ERRO] Falha ao enviar e-mail para ${destinatario}:`, error.message);
    // Em caso de falha de envio SMTP, ainda retornamos link para fins de log seguro
    return { sucesso: false, erro: error.message, link: linkRecuperacao };
  }
}

module.exports = {
  transporter,
  enviarEmailRecuperacao
};
