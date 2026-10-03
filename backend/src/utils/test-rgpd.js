/**
 * Testes Automatizados - Conformidade RGPD
 * Validação de consentimento livre no auto-registo, carimbo de data/hora e Direito ao Esquecimento (exclusão de conta).
 */

const http = require('http');
const prisma = require('../database/prisma');

const BASE_URL = 'http://127.0.0.1:3000';

function requisicao(caminho, opcoes = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(caminho, BASE_URL);
    const headers = opcoes.headers || {};

    let payloadStr = '';
    if (opcoes.body) {
      payloadStr = JSON.stringify(opcoes.body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payloadStr);
    }

    const req = http.request(url, {
      method: opcoes.method || 'GET',
      headers: headers
    }, (res) => {
      let dados = '';
      res.on('data', chunk => dados += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(dados);
        } catch (e) {
          json = dados;
        }

        const cookies = res.headers['set-cookie'] || [];
        resolve({
          status: res.statusCode,
          headers: res.headers,
          cookies: cookies,
          data: json
        });
      });
    });

    req.on('error', reject);

    if (opcoes.body) {
      req.write(JSON.stringify(opcoes.body));
    }

    req.end();
  });
}

function extrairCookieSessao(cookies) {
  for (const c of cookies) {
    if (c.startsWith('cac_session_id=')) {
      return c.split(';')[0];
    }
  }
  return null;
}

let totalPassou = 0;
let totalFalhou = 0;

function assert(condicao, mensagem) {
  if (condicao) {
    console.log(`  ✅ [PASSOU] ${mensagem}`);
    totalPassou++;
  } else {
    console.error(`  ❌ [FALHOU] ${mensagem}`);
    totalFalhou++;
  }
}

async function executarTestesRGPD() {
  console.log('\n======================================================');
  console.log('🧪 INICIANDO SUÍTE DE TESTES RGPD (CAC Atividades)');
  console.log('======================================================\n');

  const scTeste = 'SCRGPD' + Math.floor(1000 + Math.random() * 9000);
  const emailTeste = `colaborador_${Date.now()}@correios.pt`;
  const senhaTeste = 'Rgpd@Segura123';

  // ---------------------------------------------------------------------------
  // Teste 1: Bloqueio de auto-registo sem consentimento explícito
  // ---------------------------------------------------------------------------
  console.log('🔹 Teste 1: Validação de recusa de auto-registo sem aceite dos termos');
  const resSemAceite = await requisicao('/api/auth/registo', {
    method: 'POST',
    body: {
      nome_completo: 'Operador Teste RGPD',
      numero_sc: scTeste,
      telemovel: '912345678',
      email: emailTeste,
      senha: senhaTeste,
      confirmar_senha: senhaTeste,
      aceitou_termos: false // Sem consentimento
    }
  });

  assert(resSemAceite.status === 400, 'Cadastro sem consentimento deve retornar HTTP 400');
  assert(resSemAceite.data && resSemAceite.data.status === 'erro', 'Payload de erro retornado corretamente');
  assert(resSemAceite.data.mensagem.includes('RGPD') || resSemAceite.data.mensagem.includes('Termos'), 'Mensagem explicativa sobre obrigatoriedade de termos RGPD');

  // ---------------------------------------------------------------------------
  // Teste 2: Sucesso no auto-registo com consentimento explícito
  // ---------------------------------------------------------------------------
  console.log('\n🔹 Teste 2: Auto-registo válido com consentimento ativo e gravação de data/hora');
  const resComAceite = await requisicao('/api/auth/registo', {
    method: 'POST',
    body: {
      nome_completo: 'Operador Teste RGPD',
      numero_sc: scTeste,
      telemovel: '912345678',
      email: emailTeste,
      senha: senhaTeste,
      confirmar_senha: senhaTeste,
      aceitou_termos: true // Consentimento ativo
    }
  });

  assert(resComAceite.status === 201, 'Cadastro com consentimento deve retornar HTTP 201');
  assert(resComAceite.data && resComAceite.data.usuario, 'Usuário criado e sessão estabelecida');

  const cookieSessao = extrairCookieSessao(resComAceite.cookies);
  assert(cookieSessao !== null, 'Cookie de sessão gerado com sucesso');

  // ---------------------------------------------------------------------------
  // Teste 3: Auditoria do carimbo de data/hora no banco de dados
  // ---------------------------------------------------------------------------
  console.log('\n🔹 Teste 3: Verificação do carimbo termosAceitosEm no PostgreSQL via Prisma');
  const usuarioDb = await prisma.usuario.findUnique({
    where: { numeroSc: scTeste }
  });

  assert(usuarioDb !== null, 'Usuário localizado no banco de dados');
  assert(usuarioDb.termosAceitosEm instanceof Date, 'Data/hora de aceite é uma instância Date válida');
  assert(usuarioDb.termosVersao === '1.0', 'Versão dos termos gravada como 1.0');

  // ---------------------------------------------------------------------------
  // Teste 4: Consulta no endpoint de Perfil retornando dados de consentimento
  // ---------------------------------------------------------------------------
  console.log('\n🔹 Teste 4: Endpoint GET /api/perfil retornando termosAceitosEm');
  const resPerfil = await requisicao('/api/perfil', {
    method: 'GET',
    headers: { Cookie: cookieSessao }
  });

  assert(resPerfil.status === 200, 'Consulta de perfil autenticada retornou HTTP 200');
  assert(resPerfil.data && resPerfil.data.dados.termosAceitosEm !== null, 'termosAceitosEm presente no payload de perfil');

  // ---------------------------------------------------------------------------
  // Teste 5: Criação de dados operacionais vinculados para teste de exclusão
  // ---------------------------------------------------------------------------
  console.log('\n🔹 Teste 5: Criação de preferências e turno diário para o usuário');
  await prisma.perfilConfiguracao.update({
    where: { usuarioId: usuarioDb.id },
    data: { matriculaPadrao: 'AA-01-BB', giroPadrao: '1234G' }
  });

  const turnoTeste = await prisma.registoDiario.create({
    data: {
      usuarioId: usuarioDb.id,
      dataRegisto: new Date('2026-10-02'),
      status: 'fechado',
      kmInicial: 100,
      kmFinal: 150,
      matriculaDia: 'AA-01-BB',
      giroDia: '1234G',
      qtdObjetos: 80,
      qtdEntregues: 75,
      qtdAvisados: 5,
      kmPercorridos: 50
    }
  });

  assert(turnoTeste.id !== null, 'Turno de teste criado no banco com sucesso');

  // ---------------------------------------------------------------------------
  // Teste 6: Tentativa de eliminação de conta com senha incorreta
  // ---------------------------------------------------------------------------
  console.log('\n🔹 Teste 6: Rejeição de eliminação de conta com senha incorreta');
  const resExclusaoSenhaErrada = await requisicao('/api/perfil/conta', {
    method: 'DELETE',
    headers: { Cookie: cookieSessao },
    body: { senha: 'SenhaIncorreta999' }
  });

  assert(resExclusaoSenhaErrada.status === 401, 'Eliminação com senha incorreta deve retornar HTTP 401');

  // ---------------------------------------------------------------------------
  // Teste 7: Execução bem-sucedida do Direito ao Esquecimento (DELETE /api/perfil/conta)
  // ---------------------------------------------------------------------------
  console.log('\n🔹 Teste 7: Direito ao Esquecimento com senha correta');
  const resExclusaoSucesso = await requisicao('/api/perfil/conta', {
    method: 'DELETE',
    headers: { Cookie: cookieSessao },
    body: { senha: senhaTeste }
  });

  assert(resExclusaoSucesso.status === 200, 'Eliminação com senha correta retornou HTTP 200');
  assert(resExclusaoSucesso.data && resExclusaoSucesso.data.status === 'sucesso', 'Mensagem de sucesso confirmada');

  // ---------------------------------------------------------------------------
  // Teste 8: Verificação de ausência de dados no banco após exclusão
  // ---------------------------------------------------------------------------
  console.log('\n🔹 Teste 8: Verificação de limpeza permanente no PostgreSQL');
  const usuarioDeletado = await prisma.usuario.findUnique({
    where: { id: usuarioDb.id }
  });
  const perfilDeletado = await prisma.perfilConfiguracao.findUnique({
    where: { usuarioId: usuarioDb.id }
  });
  const turnosDeletados = await prisma.registoDiario.findMany({
    where: { usuarioId: usuarioDb.id }
  });

  assert(usuarioDeletado === null, 'Registro de Usuário foi permanentemente apagado');
  assert(perfilDeletado === null, 'PerfilConfiguracao foi permanentemente apagado');
  assert(turnosDeletados.length === 0, 'Todos os registos de turnos foram permanentemente apagados');

  console.log('\n======================================================');
  console.log(`📊 RESULTADO DOS TESTES RGPD:`);
  console.log(`   Total de Testes: ${totalPassou + totalFalhou}`);
  console.log(`   ✅ Passaram: ${totalPassou}`);
  console.log(`   ❌ Falharam: ${totalFalhou}`);
  console.log('======================================================\n');

  if (totalFalhou > 0) {
    process.exit(1);
  }
}

executarTestesRGPD()
  .catch((err) => {
    console.error('Erro fatal na execução dos testes:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
