/**
 * CAC Atividades - Suíte de Testes Automatizados da Fase 5
 * Testes de Formatação da Mensagem Oficial do WhatsApp e Endpoint /whatsapp-preview
 */

const assert = require('assert');
const prisma = require('../database/prisma');
const {
  formatarDataPostal,
  formatarIncidenciaValor,
  gerarMensagemWhatsapp
} = require('./formatters');
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

/**
 * 1. Testes Unitários de Formatação de Texto
 */
function testarUnitariosFormatters() {
  console.log('--- 1. TESTES UNITÁRIOS: FORMATTERS WHATSAPP ---');

  // Data Postal
  const data1 = formatarDataPostal('2026-08-10');
  assert.strictEqual(data1, '10/08/2026', 'Data 2026-08-10 deve ser 10/08/2026');
  console.log('  ✅ [PASSOU] Formatação de Data Postal validada: 10/08/2026');

  // Valores de Incidência ( > 0 -> *N*, 0/null -> ** )
  assert.strictEqual(formatarIncidenciaValor(1), '*1*');
  assert.strictEqual(formatarIncidenciaValor(3), '*3*');
  assert.strictEqual(formatarIncidenciaValor(0), '**');
  assert.strictEqual(formatarIncidenciaValor(null), '**');
  assert.strictEqual(formatarIncidenciaValor(undefined), '**');
  console.log('  ✅ [PASSOU] Formatação de Valores de Incidência validada (*N* vs **)');

  // Estrutura Completa do Modelo Oficial
  const mockRegisto = {
    dataRegisto: new Date('2026-08-10T00:00:00.000Z'),
    matriculaDia: 'BI-04-NH',
    kmInicial: 73136,
    kmFinal: 73207,
    giroDia: '2825H',
    qtdObjetos: 159,
    qtdRecolhas: 1,
    qtdAvisados: 1,
    qtdRetornos: 3,
    qtdEndInsuficiente: 0,
    qtdRecusados: 0,
    qtdDescMorada: 1,
    usuario: {
      nomeCompleto: 'Fabricio Leite'
    }
  };

  const msg = gerarMensagemWhatsapp(mockRegisto);
  
  assert(msg.includes('*_10/08/2026_*'), 'Deve conter data em itálico/negrito');
  assert(msg.includes('*Início*'), 'Deve conter seção *Início*');
  assert(msg.includes('*Final*'), 'Deve conter seção *Final*');
  assert(msg.includes('Nome: *Fabricio Leite*'), 'Deve conter Nome formatado');
  assert(msg.includes('Matrícula: *BI-04-NH*'), 'Deve conter Matrícula');
  assert(msg.includes('Km iniciais: *73136*'), 'Deve conter Km iniciais');
  assert(msg.includes('Km Finais: *73207*'), 'Deve conter Km Finais');
  assert(msg.includes('Qtd Objectos: *159*'), 'Deve conter Qtd Objectos');
  assert(msg.includes('Qtd Avisados: *1*'), 'Qtd Avisados deve ser *1*');
  assert(msg.includes('Qtd Retornos: *3*'), 'Qtd Retornos deve ser *3*');
  assert(msg.includes('Qtd End. Insuf.: **'), 'Qtd End. Insuf. zero deve ser **');
  assert(msg.includes('Qtd Recusados: **'), 'Qtd Recusados zero deve ser **');
  assert(msg.includes('Qtd desc morada.: *1*'), 'Qtd desc morada deve ser *1*');

  console.log('  ✅ [PASSOU] Estrutura da Mensagem alinhada com modelo oficial CTT');
}

/**
 * 2. Testes de Integração com Banco de Dados e Controller
 */
async function testarControllerWhatsapp() {
  console.log('\n--- 2. TESTES DE INTEGRAÇÃO DO ENDPOINT WHATSAPP-PREVIEW ---');

  // Obter operador de teste
  let userOp1 = await prisma.usuario.findFirst({ where: { perfil: 'operador' } });
  let userOp2 = await prisma.usuario.findFirst({ where: { perfil: 'operador', NOT: { id: userOp1 ? userOp1.id : 0 } } });
  let userAdmin = await prisma.usuario.findFirst({ where: { perfil: 'administrador' } });

  if (!userOp1) {
    userOp1 = await prisma.usuario.create({
      data: {
        nomeCompleto: 'Operador Teste F5',
        numeroSc: 'SC9995',
        email: 'op.fase5@cacatividades.pt',
        senhaHash: '$2b$10$w8c5c7d0e1f2g3h4i5j6k7l8m9n0',
        perfil: 'operador'
      }
    });
  }

  if (!userOp2) {
    userOp2 = await prisma.usuario.create({
      data: {
        nomeCompleto: 'Outro Operador F5',
        numeroSc: 'SC9996',
        email: 'op2.fase5@cacatividades.pt',
        senhaHash: '$2b$10$w8c5c7d0e1f2g3h4i5j6k7l8m9n0',
        perfil: 'operador'
      }
    });
  }

  if (!userAdmin) {
    userAdmin = await prisma.usuario.create({
      data: {
        nomeCompleto: 'Admin Teste F5',
        numeroSc: 'SC9997',
        email: 'admin.fase5@cacatividades.pt',
        senhaHash: '$2b$10$w8c5c7d0e1f2g3h4i5j6k7l8m9n0',
        perfil: 'administrador'
      }
    });
  }

  // Criar registo de turno fechado para userOp1
  const registoTeste = await prisma.registoDiario.create({
    data: {
      usuarioId: userOp1.id,
      dataRegisto: new Date('2026-08-10T00:00:00.000Z'),
      status: 'fechado',
      matriculaDia: 'AA-00-XX',

      kmInicial: 10000,
      kmFinal: 10100,
      giroDia: '1000A',
      qtdObjetos: 100,
      qtdRecolhas: 5,
      qtdAvisados: 2,
      qtdRetornos: 1,
      qtdEndInsuficiente: 0,
      qtdRecusados: 0,
      qtdDescMorada: 0,
      kmPercorridos: 100,
      qtdEntregues: 97,
      taxaEficiencia: 97.14
    }
  });

  const registoIdStr = registoTeste.id.toString();

  // Teste A: Dono do registo (userOp1) consulta o whatsapp-preview
  const { req: reqOp1, res: resOp1 } = createMockReqRes(
    { id: userOp1.id.toString(), perfil: 'operador' },
    {},
    {},
    { id: registoIdStr }
  );
  await RegistoDiarioController.obterWhatsappPreview(reqOp1, resOp1);
  assert.strictEqual(resOp1.getStatusCode(), 200, 'Dono do registo deve ter status 200');
  const dataOp1 = resOp1.getData();
  assert.strictEqual(dataOp1.status, 'sucesso');
  assert(dataOp1.dados.textoMensagem.includes('*_10/08/2026_*'));
  assert(dataOp1.dados.textoMensagem.includes('Km iniciais: *10000*'));
  assert(dataOp1.dados.whatsappUrl.startsWith('https://wa.me/?text='));
  console.log('  ✅ [PASSOU] Dono do registo obtém pré-visualização e URL com sucesso');

  // Teste B: Outro operador (userOp2) tenta acessar o registo de userOp1 -> 403 Bloqueado
  const { req: reqOp2, res: resOp2 } = createMockReqRes(
    { id: userOp2.id.toString(), perfil: 'operador' },
    {},
    {},
    { id: registoIdStr }
  );
  await RegistoDiarioController.obterWhatsappPreview(reqOp2, resOp2);
  assert.strictEqual(resOp2.getStatusCode(), 403, 'Acesso por outro operador deve ser bloqueado com 403');
  console.log('  ✅ [PASSOU] RBAC bloqueia operador que tenta visualizar relatório de terceiro (403)');

  // Teste C: Administrador acessa registo de userOp1 -> 200 Permitido
  const { req: reqAdmin, res: resAdmin } = createMockReqRes(
    { id: userAdmin.id.toString(), perfil: 'administrador' },
    {},
    {},
    { id: registoIdStr }
  );
  await RegistoDiarioController.obterWhatsappPreview(reqAdmin, resAdmin);
  assert.strictEqual(resAdmin.getStatusCode(), 200, 'Administrador deve poder visualizar com 200');
  console.log('  ✅ [PASSOU] RBAC permite que administrador visualize relatórios para suporte');

  // Limpeza
  await prisma.registoDiario.delete({ where: { id: registoTeste.id } });
  console.log('  ✅ [PASSOU] Dados de teste limpos com sucesso');
}

async function executarTodos() {
  try {
    testarUnitariosFormatters();
    await testarControllerWhatsapp();
    console.log('\n===============================================================');
    console.log(' RESULTADO FINAL DA FASE 5: TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('===============================================================\n');
  } catch (err) {
    console.error('\n❌ [FALHA NOS TESTES DA FASE 5]', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

executarTodos();
