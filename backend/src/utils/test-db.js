const prisma = require('../database/prisma');

async function testDatabase() {
  console.log('--- Iniciando Teste de Integridade do Modelo de Dados ---');

  // 1. Verificar busca de usuário com perfil
  const operador = await prisma.usuario.findUnique({
    where: { email: 'fabricio@cacatividades.pt' },
    include: { perfilConfiguracao: true }
  });

  if (!operador || !operador.perfilConfiguracao) {
    throw new Error('Falha ao carregar operador com perfil');
  }
  console.log(`✓ Usuário encontrado: ${operador.primeiroNome} ${operador.ultimoNome} (Matrícula Padrão: ${operador.perfilConfiguracao.matriculaPadrao})`);

  // 2. Testar criação de turno diário (Abertura)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Remover registro de hoje se já existir para manter o teste idempotente
  await prisma.auditoriaRegisto.deleteMany({
    where: { registoDiario: { usuarioId: operador.id, dataRegisto: hoje } }
  });
  await prisma.registoDiario.deleteMany({
    where: { usuarioId: operador.id, dataRegisto: hoje }
  });

  const novoTurno = await prisma.registoDiario.create({
    data: {
      usuarioId: operador.id,
      dataRegisto: hoje,
      status: 'aberto',
      kmInicial: 73136,
      matriculaDia: operador.perfilConfiguracao.matriculaPadrao,
      giroDia: operador.perfilConfiguracao.giroPadrao
    }
  });
  console.log(`✓ Turno aberto com ID: ${novoTurno.id} (Km Inicial: ${novoTurno.kmInicial})`);

  // 3. Testar atualização de turno (Fecho) e criação de Auditoria
  const valoresAntigos = {
    status: novoTurno.status,
    km_final: novoTurno.kmFinal,
    qtd_objetos: novoTurno.qtdObjetos
  };

  const turnoFechado = await prisma.registoDiario.update({
    where: { id: novoTurno.id },
    data: {
      status: 'fechado',
      kmFinal: 73207,
      qtdObjetos: 159,
      qtdRecolhas: 1,
      qtdAvisados: 1,
      qtdRetornos: 3,
      qtdEndInsuficiente: 0,
      qtdRecusados: 0,
      qtdDescMorada: 1,
      qtdEntregues: 154,
      taxaEficiencia: 96.88,
      kmPercorridos: 71,
      dataHoraFecho: new Date()
    }
  });

  const valoresNovos = {
    status: turnoFechado.status,
    km_final: turnoFechado.kmFinal,
    qtd_objetos: turnoFechado.qtdObjetos
  };

  const auditoria = await prisma.auditoriaRegisto.create({
    data: {
      registoDiarioId: turnoFechado.id,
      usuarioAlteracaoId: operador.id,
      valoresAntigos,
      valoresNovos,
      motivo: 'Fechamento de turno de homologação'
    }
  });
  console.log(`✓ Turno fechado e auditoria gerada com ID: ${auditoria.id}`);

  // 4. Testar criação de Log de Segurança
  const logSeguranca = await prisma.logSeguranca.create({
    data: {
      tipoEvento: 'TESTE_SISTEMA',
      usuarioId: operador.id,
      ipOrigem: '127.0.0.1',
      detalhes: 'Teste de integridade do modelo de dados executado com sucesso'
    }
  });
  console.log(`✓ Log de segurança gerado com ID: ${logSeguranca.id}`);

  // 5. Testar tabela de Sessão (app_sessoes)
  const sessionId = 'test-session-' + Date.now();
  const expireDate = new Date(Date.now() + 8 * 3600 * 1000);
  await prisma.appSessao.create({
    data: {
      sid: sessionId,
      sess: { cookie: { originalMaxAge: 28800000 }, usuario: { id: Number(operador.id) } },
      expire: expireDate
    }
  });
  console.log(`✓ Sessão teste criada na tabela app_sessoes: ${sessionId}`);

  // Limpeza dos dados temporários criados no teste
  await prisma.appSessao.delete({ where: { sid: sessionId } });
  await prisma.logSeguranca.delete({ where: { id: logSeguranca.id } });
  await prisma.auditoriaRegisto.delete({ where: { id: auditoria.id } });
  await prisma.registoDiario.delete({ where: { id: novoTurno.id } });
  console.log('✓ Limpeza de dados de teste concluída');

  console.log('--- Todos os testes do modelo de dados passaram com sucesso! ---');
}

testDatabase()
  .catch((err) => {
    console.error('Erro no teste de banco:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
