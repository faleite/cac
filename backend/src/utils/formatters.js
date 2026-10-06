/**
 * CAC Atividades - Utilitário de Formatação de Mensagens do WhatsApp e Datas
 * Conforme especificações do docs/FSD.md (Seção 14) e docs/extras/cac-model.txt
 */

/**
 * Formata uma data no padrão DD/MM/YYYY
 * @param {string|Date} dataInput 
 * @returns {string}
 */
function formatarDataPostal(dataInput) {
  if (!dataInput) return '';
  let d;
  if (typeof dataInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dataInput.trim())) {
    const [ano, mes, dia] = dataInput.trim().split('T')[0].split('-').map(Number);
    d = new Date(Date.UTC(ano, mes - 1, dia));
  } else {
    d = new Date(dataInput);
  }
  if (isNaN(d.getTime())) return '';
  const diaStr = String(d.getUTCDate()).padStart(2, '0');
  const mesStr = String(d.getUTCMonth() + 1).padStart(2, '0');
  const anoStr = d.getUTCFullYear();
  return `${diaStr}/${mesStr}/${anoStr}`;
}

/**
 * Formata quantidade de incidência: *N* para qualquer valor >= 0 (*0* caso zero, nula ou indef)
 * @param {number|null|undefined} qtd 
 * @returns {string}
 */
function formatarIncidenciaValor(qtd) {
  const val = parseInt(qtd, 10);
  if (!isNaN(val) && val >= 0) {
    return `*${val}*`;
  }
  return '*0*';
}


/**
 * Gera a mensagem oficial do WhatsApp no formato exato da empresa
 * @param {Object} registo Objeto RegistoDiario do Prisma (com dados do utilizador)
 * @returns {string}
 */
function gerarMensagemWhatsapp(registo) {
  if (!registo) return '';

  const dataFormatada = formatarDataPostal(registo.dataRegisto);
  const nomeCompleto = (registo.usuario && registo.usuario.nomeCompleto) 
    ? registo.usuario.nomeCompleto.trim() 
    : (registo.nomeUsuario || '');

  const matricula = registo.matriculaDia || '';
  const kmInicial = registo.kmInicial !== undefined ? registo.kmInicial : '';
  const kmFinal = registo.kmFinal !== undefined && registo.kmFinal !== null ? registo.kmFinal : '';
  const giro = registo.giroDia || '';
  const qtdObjetos = registo.qtdObjetos !== undefined ? registo.qtdObjetos : 0;
  const qtdRecolhas = registo.qtdRecolhas !== undefined ? registo.qtdRecolhas : 0;

  const avisados = formatarIncidenciaValor(registo.qtdAvisados);
  const retornos = formatarIncidenciaValor(registo.qtdRetornos);
  const endInsuf = formatarIncidenciaValor(registo.qtdEndInsuficiente);
  const recusados = formatarIncidenciaValor(registo.qtdRecusados);
  const descMorada = formatarIncidenciaValor(registo.qtdDescMorada);

  const linhas = [
    `*Controlo Diário*`,
    `*_${dataFormatada}_*`,
    ``,
    `*Início*`,
    `Nome: *${nomeCompleto}*`,
    `Matrícula: *${matricula}*`,
    `Km iniciais: *${kmInicial}*`,
    `Giro: *${giro}*`,
    `Qtd Objectos: *${qtdObjetos}*`,
    `Qtd Recolhas: *${qtdRecolhas}*`,
    ``,
    `*Final*`,
    `Nome: *${nomeCompleto}*`,
    `Matrícula: *${matricula}*`,
    `Km Finais: *${kmFinal}*`,
    `Giro: *${giro}*`,
    `Qtd Objectos: *${qtdObjetos}*`,
    `Qtd Recolhas: *${qtdRecolhas}*`,
    `Qtd Avisados: ${avisados}`,
    `Qtd Retornos: ${retornos}`,
    `Qtd End. Insuf.: ${endInsuf}`,
    `Qtd Recusados: ${recusados}`,
    `Qtd desc morada.: ${descMorada}`
  ];

  return linhas.join('\n');
}

module.exports = {
  formatarDataPostal,
  formatarIncidenciaValor,
  gerarMensagemWhatsapp
};
