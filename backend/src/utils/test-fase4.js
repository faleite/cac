/**
 * CAC Atividades - Suíte de Testes Automatizados da Fase 4
 * Módulo Operador: Abertura, Fecho, Incidências, Validações Matemáticas e Auditoria JSONB
 */

const prisma = require('../database/prisma');
const {
  somarIncidencias,
  calcularEntregues,
  calcularEficiencia,
  calcularKmPercorridos,
  validarDadosFecho
} = require('./calculos');
const RegistoDiarioController = require('../controllers/RegistoDiarioController');

// Helper para criar mock de req/res
function createMockReqRes(sessionUser = {}, body = {}, query = {}, params = {}) {
  const req = {
    session: { usuario: sessionUser },
    body,
    query,
    params,
    ip: '127.0.0.1',
    connection: { remoteAddress: '127.0.0.1' }
  };

  let statusCode = 200;
  let responseData = null;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData
  };

  return { req, res };
}

async function runTests() {
  console.log('===============================================================');
  console.log(' INICIANDO SUÍTE DE TESTES DA FASE 4: MÓDULO OPERADOR & TURNOS ');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`  ✅ [PASSOU] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FALHOU] ${testName} ${extraInfo ? '-> ' + extraInfo : ''}`);
      failed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // GRUPO 1: Testes Unitários de Cálculos e Validações Matemáticas
    // -------------------------------------------------------------------------
    console.log('--- 1. Testes Unitários de Fórmulas e Regras (calculos.js) ---');

    // Teste 1.1: Somar Incidências
    const somaInc = somarIncidencias({
      qtdAvisados: 2,
      qtdRetornos: 3,
      qtdEndInsuficiente: 1,
      qtdRecusados: 0,
      qtdDescMorada: 4
    });
    assert(somaInc === 10, 'somarIncidencias deve somar as 5 incidências corretamente (2+3+1+0+4 = 10)', `Obteve: ${somaInc}`);

    // Teste 1.2: Calcular Entregues
    const entregues = calcularEntregues(150, somaInc);
    assert(entregues === 140, 'calcularEntregues deve subtrair incidências do total de objetos (150 - 10 = 140)', `Obteve: ${entregues}`);

    // Teste 1.3: Calcular Eficiência com Valores Normais
    // Fórmula: ((140 + 2) / (150 + 2)) * 100 = (142 / 152) * 100 = 93.42%
    const taxa = calcularEficiencia(140, 2, 150);
    assert(taxa === 93.42, 'calcularEficiencia deve calcular ((140+2)/(150+2))*100 = 93.42%', `Obteve: ${taxa}`);

    // Teste 1.4: Calcular Eficiência com Divisão por Zero
    const taxaZero = calcularEficiencia(0, 0, 0);
    assert(taxaZero === 0.00, 'calcularEficiencia com denominador 0 deve retornar 0.00%', `Obteve: ${taxaZero}`);

    // Teste 1.5: Calcular Km Percorridos
    const kmPerc = calcularKmPercorridos(73136, 73207);
    assert(kmPerc === 71, 'calcularKmPercorridos(73136, 73207) deve ser 71 km', `Obteve: ${kmPerc}`);

    // Teste 1.6: Validação Bloqueante Km Final < Km Inicial
    const valKmInvalido = validarDadosFecho({
      kmInicial: 73200,
      kmFinal: 73100,
      qtdObjetos: 100,
      qtdRecolhas: 0
    });
    assert(!valKmInvalido.valido && valKmInvalido.erros[0].includes('não pode ser inferior ao Km Inicial'),
      'validarDadosFecho deve bloquear quando Km Final < Km Inicial com mensagem exata');

    // Teste 1.7: Validação Bloqueante Incidências > Objetos
    const valIncInvalida = validarDadosFecho({
      kmInicial: 73000,
      kmFinal: 73050,
      qtdObjetos: 10,
      qtdAvisados: 8,
      qtdRetornos: 5 // soma = 13 > 10
    });
    assert(!valIncInvalida.valido && valIncInvalida.erros[0].includes('não pode ser maior do que a Quantidade Total de Objetos'),
      'validarDadosFecho deve bloquear quando Incidências > Objetos com mensagem exata');

    // -------------------------------------------------------------------------
    // GRUPO 2: Integração com Banco e RegistoDiarioController
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Testes de Integração e Registo Diário no PostgreSQL ---');

    // Obter ou criar operador de teste
    const scOperador = 'SC9994';
    const emailOperador = 'operador.fase4@cacatividades.pt';
    let userOp = await prisma.usuario.findUnique({ where: { numeroSc: scOperador } });

    if (!userOp) {
      userOp = await prisma.usuario.create({
        data: {
          nomeCompleto: 'Operador Teste Fase 4',
          numeroSc: scOperador,
          telemovel: '+351912999444',
          email: emailOperador,
          senhaHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
          perfil: 'operador',
          ativo: true,
          perfilConfiguracao: {
            create: {
              matriculaPadrao: '44-XX-88',
              giroPadrao: '9900H'
            }
          }
        }
      });
    }

    const sessionOperador = {
      id: userOp.id.toString(),
      numeroSc: userOp.numeroSc,
      nomeCompleto: userOp.nomeCompleto,
      email: userOp.email,
      perfil: 'operador'
    };

    // Limpar turnos antigos deste usuário para o teste
    await prisma.registoDiario.deleteMany({
      where: { usuarioId: userOp.id }
    });

    // Teste 2.1: Obter estado atual inicial (deve ser 'nenhum')
    const { req: reqEst1, res: resEst1 } = createMockReqRes(sessionOperador);
    await RegistoDiarioController.obterEstadoAtual(reqEst1, resEst1);
    const dataEst1 = resEst1.getData();
    assert(resEst1.getStatusCode() === 200 && dataEst1.dados.statusDia === 'nenhum',
      'obterEstadoAtual retorna statusDia = "nenhum" quando não há turno no dia');
    assert(dataEst1.dados.preferencias.matriculaPadrao === '44-XX-88',
      'obterEstadoAtual pré-carrega matriculaPadrao do perfil');

    // Teste 2.2: Abertura de Turno com Sucesso
    const { req: reqAb, res: resAb } = createMockReqRes(sessionOperador, {
      kmInicial: 50100,
      matriculaDia: '44-XX-88',
      giroDia: '9900H'
    });
    await RegistoDiarioController.abrirTurno(reqAb, resAb);
    const dataAb = resAb.getData();
    assert(resAb.getStatusCode() === 201 && dataAb.dados.status === 'aberto' && dataAb.dados.kmInicial === 50100,
      'abrirTurno cria turno com status "aberto" e Km Inicial correto');

    const turnoCriadoId = dataAb.dados.id;

    // Teste 2.3: Bloqueio de Abertura Duplicada no mesmo dia
    const { req: reqAbDup, res: resAbDup } = createMockReqRes(sessionOperador, {
      kmInicial: 50150,
      matriculaDia: '44-XX-88',
      giroDia: '9900H'
    });
    await RegistoDiarioController.abrirTurno(reqAbDup, resAbDup);
    assert(resAbDup.getStatusCode() === 400 && resAbDup.getData().mensagem.includes('Já existe um turno'),
      'abrirTurno rejeita abertura duplicada na mesma data para o mesmo operador');

    // Teste 2.4: Obter estado atual após abertura (deve ser 'aberto')
    const { req: reqEst2, res: resEst2 } = createMockReqRes(sessionOperador);
    await RegistoDiarioController.obterEstadoAtual(reqEst2, resEst2);
    const dataEst2 = resEst2.getData();
    assert(dataEst2.dados.statusDia === 'aberto' && dataEst2.dados.registoHoje.id === turnoCriadoId,
      'obterEstadoAtual identifica turno aberto de hoje');

    // Teste 2.5: Fecho com Km Final < Km Inicial (Bloqueado)
    const { req: reqFcInvalido, res: resFcInvalido } = createMockReqRes(sessionOperador, {
      registoId: turnoCriadoId,
      kmFinal: 50050, // menor que 50100
      qtdObjetos: 100
    });
    await RegistoDiarioController.fecharTurno(reqFcInvalido, resFcInvalido);
    assert(resFcInvalido.getStatusCode() === 400 && resFcInvalido.getData().mensagem.includes('não pode ser inferior ao Km Inicial'),
      'fecharTurno rejeita Km Final menor que Km Inicial');

    // Teste 2.6: Fecho com Incidências > Objetos (Bloqueado)
    const { req: reqFcIncInvalida, res: resFcIncInvalida } = createMockReqRes(sessionOperador, {
      registoId: turnoCriadoId,
      kmFinal: 50180,
      qtdObjetos: 20,
      qtdAvisados: 15,
      qtdRetornos: 10 // soma = 25 > 20
    });
    await RegistoDiarioController.fecharTurno(reqFcIncInvalida, resFcIncInvalida);
    assert(resFcIncInvalida.getStatusCode() === 400 && resFcIncInvalida.getData().mensagem.includes('não pode ser maior do que a Quantidade Total de Objetos'),
      'fecharTurno rejeita quando incidências > total de objetos');

    // Teste 2.7: Fecho com Sucesso e Cálculo de Métricas
    // Km: 50100 -> 50190 = 90 km
    // Objetos: 159, Recolhas: 1
    // Incidências: Avisados 1, Retornos 3, Morada Insuf 0, Recusados 0, Desc Morada 1 (Soma = 5)
    // Entregues: 159 - 5 = 154
    // Eficiência: ((154 + 1) / (159 + 1)) * 100 = (155 / 160) * 100 = 96.88%
    const { req: reqFcOk, res: resFcOk } = createMockReqRes(sessionOperador, {
      registoId: turnoCriadoId,
      kmFinal: 50190,
      qtdObjetos: 159,
      qtdRecolhas: 1,
      qtdAvisados: 1,
      qtdRetornos: 3,
      qtdEndInsuficiente: 0,
      qtdRecusados: 0,
      qtdDescMorada: 1
    });
    await RegistoDiarioController.fecharTurno(reqFcOk, resFcOk);
    const dataFcOk = resFcOk.getData();

    assert(resFcOk.getStatusCode() === 200 && dataFcOk.dados.status === 'fechado',
      'fecharTurno atualiza status para "fechado" com sucesso');
    assert(dataFcOk.dados.kmPercorridos === 90,
      'fecharTurno calcula kmPercorridos = 90 km', `Obteve: ${dataFcOk.dados.kmPercorridos}`);
    assert(dataFcOk.dados.qtdEntregues === 154,
      'fecharTurno calcula qtdEntregues = 154 objetos', `Obteve: ${dataFcOk.dados.qtdEntregues}`);
    assert(dataFcOk.dados.taxaEficiencia === '96.88',
      'fecharTurno calcula taxaEficiencia = 96.88%', `Obteve: ${dataFcOk.dados.taxaEficiencia}`);

    // -------------------------------------------------------------------------
    // GRUPO 3: Auditoria JSONB e Edição de Registos
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Testes de Edição com Trilha de Auditoria (JSONB) ---');

    // Teste 3.1: Edição sem motivo rejeitada
    const { req: reqEdSemMotivo, res: resEdSemMotivo } = createMockReqRes(sessionOperador, {
      kmFinal: 50200
    }, {}, { id: turnoCriadoId });
    await RegistoDiarioController.editarRegisto(reqEdSemMotivo, resEdSemMotivo);
    assert(resEdSemMotivo.getStatusCode() === 400 && resEdSemMotivo.getData().mensagem.includes('motivo da alteração é obrigatório'),
      'editarRegisto exige obrigatoriamente campo motivo');

    // Teste 3.2: Edição justificada com recálculo e auditoria JSONB
    const { req: reqEdOk, res: resEdOk } = createMockReqRes(sessionOperador, {
      motivo: 'Ajuste de Km Final corrigido pelo painel',
      kmFinal: 50210, // era 50190 -> novo kmPercorridos: 50210 - 50100 = 110
      qtdObjetos: 160
    }, {}, { id: turnoCriadoId });
    await RegistoDiarioController.editarRegisto(reqEdOk, resEdOk);
    const dataEdOk = resEdOk.getData();

    assert(resEdOk.getStatusCode() === 200 && dataEdOk.dados.kmFinal === 50210 && dataEdOk.dados.kmPercorridos === 110,
      'editarRegisto atualiza dados e recalcula kmPercorridos para 110');
    assert(Boolean(dataEdOk.auditoriaId),
      'editarRegisto gera ID de auditoria persistido');

    // Teste 3.3: Verificação dos dados em auditoria_registos no banco
    const auditoriaGravada = await prisma.auditoriaRegisto.findUnique({
      where: { id: BigInt(dataEdOk.auditoriaId) }
    });
    assert(auditoriaGravada && auditoriaGravada.motivo === 'Ajuste de Km Final corrigido pelo painel',
      'auditoria_registos grava o motivo da alteração com integridade');
    assert(auditoriaGravada.valoresAntigos.kmFinal === 50190 && auditoriaGravada.valoresNovos.kmFinal === 50210,
      'auditoria_registos armazena snapshots JSONB precisos de valoresAntigos e valoresNovos');

    // Teste 3.4: RBAC de Edição (Operador A não pode editar turno do Operador B)
    const sessionOutroOp = {
      id: '99999999',
      numeroSc: 'SC0000',
      nomeCompleto: 'Outro Operador',
      email: 'outro@cac.pt',
      perfil: 'operador'
    };
    const { req: reqEdRBAC, res: resEdRBAC } = createMockReqRes(sessionOutroOp, {
      motivo: 'Tentativa não autorizada',
      kmFinal: 50300
    }, {}, { id: turnoCriadoId });
    await RegistoDiarioController.editarRegisto(reqEdRBAC, resEdRBAC);
    assert(resEdRBAC.getStatusCode() === 403,
      'editarRegisto bloqueia operador que tenta alterar turno de outro colaborador com 403');

    // Teste 3.5: Listagem de Registos
    const { req: reqList, res: resList } = createMockReqRes(sessionOperador);
    await RegistoDiarioController.listarRegistos(reqList, resList);
    const dataList = resList.getData();
    assert(resList.getStatusCode() === 200 && dataList.dados.length >= 1,
      'listarRegistos retorna histórico do operador logado');

    console.log('\n===============================================================');
    console.log(` RESULTADO FINAL: ${passed} PASSARAM | ${failed} FALHARAM`);
    console.log('===============================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('[ERRO CRÍTICO NA EXECUÇÃO DOS TESTES]', error);
    process.exit(1);
  }
}

runTests();
