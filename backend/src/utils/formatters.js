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
  let nomeCompleto = '';
  if (registo.usuario) {
    if (registo.usuario.primeiroNome || registo.usuario.ultimoNome) {
      nomeCompleto = `${registo.usuario.primeiroNome || ''} ${registo.usuario.ultimoNome || ''}`.trim();
    } else if (registo.usuario.nomeCompleto) {
      nomeCompleto = registo.usuario.nomeCompleto.trim();
    }
  } else if (registo.nomeUsuario) {
    nomeCompleto = registo.nomeUsuario.trim();
  }

  const matricula = registo.matriculaDia || '';
  const kmInicial = registo.kmInicial !== undefined ? registo.kmInicial : '';
  const kmFinal = registo.kmFinal !== undefined && registo.kmFinal !== null ? registo.kmFinal : '';
  const giro = registo.giroDia || '';
  const qtdObjetos = registo.qtdObjetos !== undefined ? registo.qtdObjetos : 0;
  const qtdRecolhas = registo.qtdRecolhas !== undefined ? parseInt(registo.qtdRecolhas, 10) : 0;

  const qtdAvisados = parseInt(registo.qtdAvisados || 0, 10);
  const qtdRetornos = parseInt(registo.qtdRetornos || 0, 10);
  const qtdEndInsuficiente = parseInt(registo.qtdEndInsuficiente || 0, 10);
  const qtdRecusados = parseInt(registo.qtdRecusados || 0, 10);
  const qtdDescMorada = parseInt(registo.qtdDescMorada || 0, 10);

  // Kms percorridos (usa campo existente ou calcula diferença)
  let kmPercorridos = registo.kmPercorridos;
  if (kmPercorridos === undefined || kmPercorridos === null) {
    if (kmFinal !== '' && kmInicial !== '') {
      kmPercorridos = Math.max(0, parseInt(kmFinal, 10) - parseInt(kmInicial, 10));
    } else {
      kmPercorridos = 0;
    }
  }

  // Quantidade de objetos entregues (usa campo existente ou calcula abatendo incidências)
  let qtdEntregues = registo.qtdEntregues;
  if (qtdEntregues === undefined || qtdEntregues === null) {
    const somaInc = qtdAvisados + qtdRetornos + qtdEndInsuficiente + qtdRecusados + qtdDescMorada;
    qtdEntregues = Math.max(0, parseInt(qtdObjetos, 10) - somaInc);
  } else {
    qtdEntregues = parseInt(qtdEntregues, 10);
  }

  // Seção Início
  const linhasInicio = [
    `*Início*`,
    `Nome: *${nomeCompleto}*`,
    `Matrícula: *${matricula}*`,
    `Km iniciais: *${kmInicial}*`,
    `Giro: *${giro}*`,
    `Qtd Objetos: *${qtdObjetos}*`
  ];
  if (qtdRecolhas > 0) {
    linhasInicio.push(`Qtd Pontos Recolhas: *${qtdRecolhas}*`);
  }

  // Seção Final
  const linhasFinal = [
    `*Final*`,
    `Nome: *${nomeCompleto}*`,
    `Matrícula: *${matricula}*`,
    `Km Finais: *${kmFinal}*`,
    `Giro: *${giro}*`,
    `Qtd Kms Percorridos: *${kmPercorridos}*`,
    `Qtd Objetos: *${qtdObjetos}*`
  ];
  if (qtdRecolhas > 0) {
    linhasFinal.push(`Qtd Pontos Recolhas: *${qtdRecolhas}*`);
  }
  if (qtdAvisados > 0) {
    linhasFinal.push(`Qtd Avisados: *${qtdAvisados}*`);
  }
  if (qtdRetornos > 0) {
    linhasFinal.push(`Qtd Retornos ao Centro: *${qtdRetornos}*`);
  }
  if (qtdEndInsuficiente > 0) {
    linhasFinal.push(`Qtd Endereço Insuf.: *${qtdEndInsuficiente}*`);
  }
  if (qtdRecusados > 0) {
    linhasFinal.push(`Qtd Recusados: *${qtdRecusados}*`);
  }
  if (qtdDescMorada > 0) {
    linhasFinal.push(`Qtd Desc. Morada: *${qtdDescMorada}*`);
  }
  linhasFinal.push(`_Qtd Objetos Entregues:_ *${qtdEntregues}*`);

  const linhas = [
    `*Controlo Diário*`,
    `*_${dataFormatada}_*`,
    ``,
    ...linhasInicio,
    ``,
    ...linhasFinal
  ];

  return linhas.join('\n');
}

module.exports = {
  formatarDataPostal,
  formatarIncidenciaValor,
  gerarMensagemWhatsapp
};
