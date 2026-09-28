/**
 * CAC Atividades - Utilitários de Cálculos e Validações Operacionais
 * Conforme especificações do docs/FSD.md (Seção 14)
 */

/**
 * Calcula o total de incidências (não entregues)
 * @param {Object} incidencias
 * @param {number} incidencias.qtdAvisados
 * @param {number} incidencias.qtdRetornos
 * @param {number} incidencias.qtdEndInsuficiente
 * @param {number} incidencias.qtdRecusados
 * @param {number} incidencias.qtdDescMorada
 * @returns {number} Soma total das incidências
 */
function somarIncidencias(incidencias = {}) {
  const avisados = Math.max(0, parseInt(incidencias.qtdAvisados || 0, 10));
  const retornos = Math.max(0, parseInt(incidencias.qtdRetornos || 0, 10));
  const endInsuf = Math.max(0, parseInt(incidencias.qtdEndInsuficiente || 0, 10));
  const recusados = Math.max(0, parseInt(incidencias.qtdRecusados || 0, 10));
  const descMorada = Math.max(0, parseInt(incidencias.qtdDescMorada || 0, 10));

  return avisados + retornos + endInsuf + recusados + descMorada;
}

/**
 * Calcula a quantidade de objetos entregues efetivos
 * Fórmula: Entregues = Qtd Objetos - Soma(Incidências)
 * @param {number} qtdObjetos Total de objetos atribuídos no turno
 * @param {number|Object} incidencias Soma das incidências ou objeto com os valores
 * @returns {number} Quantidade entregue efetiva (mínimo 0)
 */
function calcularEntregues(qtdObjetos, incidencias) {
  const totalObjetos = Math.max(0, parseInt(qtdObjetos || 0, 10));
  const totalIncidencias = typeof incidencias === 'number' 
    ? Math.max(0, incidencias) 
    : somarIncidencias(incidencias);

  return Math.max(0, totalObjetos - totalIncidencias);
}

/**
 * Calcula a Taxa de Eficiência em percentagem (%)
 * Fórmula: Eficiência = ((Entregues + Recolhas) / (Objetos + Recolhas)) * 100
 * Casos de divisão por zero resultam em 0.00%
 * @param {number} entregues Quantidade de objetos entregues efetivos
 * @param {number} recolhas Quantidade de recolhas efetuadas
 * @param {number} qtdObjetos Quantidade total de objetos
 * @returns {number} Taxa de eficiência com 2 casas decimais (ex: 95.50)
 */
function calcularEficiencia(entregues, recolhas, qtdObjetos) {
  const numEntregues = Math.max(0, parseInt(entregues || 0, 10));
  const numRecolhas = Math.max(0, parseInt(recolhas || 0, 10));
  const numObjetos = Math.max(0, parseInt(qtdObjetos || 0, 10));

  const denominador = numObjetos + numRecolhas;
  if (denominador <= 0) {
    return 0.00;
  }

  const taxa = ((numEntregues + numRecolhas) / denominador) * 100;
  return Number(Math.min(100, Math.max(0, taxa)).toFixed(2));
}

/**
 * Calcula a quantidade de quilômetros percorridos no turno
 * Fórmula: Km Percorridos = Km Final - Km Inicial
 * @param {number} kmInicial 
 * @param {number} kmFinal 
 * @returns {number} Km percorridos (mínimo 0)
 */
function calcularKmPercorridos(kmInicial, kmFinal) {
  const inicial = Math.max(0, parseInt(kmInicial || 0, 10));
  const final = Math.max(0, parseInt(kmFinal || 0, 10));

  if (final < inicial) {
    return 0;
  }

  return final - inicial;
}

/**
 * Valida a consistência matemática dos dados de fecho de turno
 * @param {Object} dados
 * @param {number} dados.kmInicial
 * @param {number} dados.kmFinal
 * @param {number} dados.qtdObjetos
 * @param {number} dados.qtdRecolhas
 * @param {number} dados.qtdAvisados
 * @param {number} dados.qtdRetornos
 * @param {number} dados.qtdEndInsuficiente
 * @param {number} dados.qtdRecusados
 * @param {number} dados.qtdDescMorada
 * @returns {{ valido: boolean, erros: string[] }}
 */
function validarDadosFecho(dados = {}) {
  const erros = [];
  const kmInicial = parseInt(dados.kmInicial, 10);
  const kmFinal = parseInt(dados.kmFinal, 10);
  const qtdObjetos = parseInt(dados.qtdObjetos, 10);
  const qtdRecolhas = parseInt(dados.qtdRecolhas || 0, 10);

  if (isNaN(kmInicial) || kmInicial < 0) {
    erros.push('O Km Inicial deve ser um número inteiro maior ou igual a zero.');
  }

  if (isNaN(kmFinal) || kmFinal < 0) {
    erros.push('O Km Final deve ser informado com um número inteiro válido.');
  } else if (!isNaN(kmInicial) && kmFinal <= kmInicial) {
    erros.push('O Km Final deve ser superior ao Km Inicial informado na abertura (o percurso de km não pode ser zero).');
  }

  if (isNaN(qtdObjetos) || qtdObjetos < 0) {
    erros.push('A Quantidade de Objetos deve ser um número inteiro maior ou igual a zero.');
  }

  if (isNaN(qtdRecolhas) || qtdRecolhas < 0) {
    erros.push('A Quantidade de Recolhas deve ser um número inteiro maior ou igual a zero.');
  }

  const somaInc = somarIncidencias(dados);
  if (!isNaN(qtdObjetos) && somaInc > qtdObjetos) {
    erros.push('A soma das incidências (não entregues) não pode ser maior do que a Quantidade Total de Objetos.');
  }

  return {
    valido: erros.length === 0,
    erros,
    somaIncidencias: somaInc
  };
}

module.exports = {
  somarIncidencias,
  calcularEntregues,
  calcularEficiencia,
  calcularKmPercorridos,
  validarDadosFecho
};
