const fs = require('fs');
const path = require('path');

// Identificar caminho da pasta de logs
const pastaLogs = fs.existsSync('/app/logs')
  ? '/app/logs'
  : (fs.existsSync(path.resolve(__dirname, '../../../logs'))
    ? path.resolve(__dirname, '../../../logs')
    : path.resolve(process.cwd(), 'logs'));

if (!fs.existsSync(pastaLogs)) {
  try {
    fs.mkdirSync(pastaLogs, { recursive: true });
  } catch (e) {
    // Silencia se não for possível criar
  }
}

/**
 * Registra erro em logs/app-error.log
 */
function logErro(modulo, mensagem, erro = null) {
  const agora = new Date().toISOString();
  const detalheErro = erro ? (erro.stack || erro.message || JSON.stringify(erro)) : '';
  const linha = `[${agora}] [${modulo}] ${mensagem}${detalheErro ? ' | ' + detalheErro : ''}\n`;

  console.error(`[ERRO ${modulo}] ${mensagem}`, erro ? erro.message || erro : '');

  try {
    fs.appendFileSync(path.join(pastaLogs, 'app-error.log'), linha, 'utf8');
  } catch (e) {
    console.error('Falha ao escrever no log app-error.log:', e.message);
  }
}

/**
 * Registra evento de segurança em logs/security.log
 */
function logSeguranca(evento, detalhes = {}) {
  const agora = new Date().toISOString();
  const linha = `[${agora}] [SEGURANCA] ${evento} | ${JSON.stringify(detalhes)}\n`;

  console.warn(`[SEGURANÇA] ${evento}`, detalhes);

  try {
    fs.appendFileSync(path.join(pastaLogs, 'security.log'), linha, 'utf8');
  } catch (e) {
    console.error('Falha ao escrever no log security.log:', e.message);
  }
}

module.exports = {
  logErro,
  logSeguranca
};
