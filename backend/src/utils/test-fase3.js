require('../config');
const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');
const authController = require('../controllers/AuthController');
const perfilController = require('../controllers/PerfilController');

async function runTests() {
  console.log('====================================================');
  console.log('Iniciando Validação Automatizada da FASE 3');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // Helpers para simular requisições e respostas Express
  function mockReq(body = {}, session = {}, params = {}, query = {}, headers = {}) {
    return {
      body,
      session,
      params,
      query,
      headers,
      protocol: 'http',
      get: (h) => (h.toLowerCase() === 'host' ? 'localhost:3000' : headers[h])
    };
  }

  function mockRes() {
    const res = {
      statusCode: 200,
      body: null,
      cookies: {},
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.body = data;
        return this;
      },
      clearCookie: function(name) {
        this.cookies[name] = null;
        return this;
      }
    };
    return res;
  }

  try {
    const testSC = `SC_TEST_${Date.now().toString().slice(-4)}`;
    const testEmail = `test_${Date.now()}@cacatividades.pt`;
    const testSenha = 'SenhaSegura123!';

    // 1. Teste de Auto-Registo de Colaborador
    console.log('\n--- 1. Teste de Auto-Registo ---');

    // 1.1 Validação de rejeição de múltiplos nomes em primeiro_nome e ultimo_nome
    const reqMultiploPrimeiro = mockReq({
      primeiro_nome: 'João Pedro',
      ultimo_nome: 'Silva',
      numero_sc: 'SC_TMP1',
      telemovel: '912345678',
      email: 'tmp1@cac.pt',
      senha: testSenha,
      confirmar_senha: testSenha,
      aceitou_termos: true
    });
    const resMultiploPrimeiro = mockRes();
    await authController.registo(reqMultiploPrimeiro, resMultiploPrimeiro);
    assert(resMultiploPrimeiro.statusCode === 400, 'Registo deve rejeitar primeiro_nome com mais de uma palavra (HTTP 400)');

    const reqMultiploUltimo = mockReq({
      primeiro_nome: 'João',
      ultimo_nome: 'Silva Costa',
      numero_sc: 'SC_TMP2',
      telemovel: '912345678',
      email: 'tmp2@cac.pt',
      senha: testSenha,
      confirmar_senha: testSenha,
      aceitou_termos: true
    });
    const resMultiploUltimo = mockRes();
    await authController.registo(reqMultiploUltimo, resMultiploUltimo);
    assert(resMultiploUltimo.statusCode === 400, 'Registo deve rejeitar ultimo_nome com mais de uma palavra (HTTP 400)');

    const regReq = mockReq({
      primeiro_nome: 'Operador',
      ultimo_nome: 'Tres',
      numero_sc: testSC,
      telemovel: '912345678',
      email: testEmail,
      senha: testSenha,
      confirmar_senha: testSenha,
      aceitou_termos: true,
      perfil: 'administrador' // Tentativa de injeção de perfil para testar auto-elevação
    });
    const regRes = mockRes();
    await authController.registo(regReq, regRes);

    assert(regRes.statusCode === 201, `Status code de registro deve ser 201 (Recebido: ${regRes.statusCode})`);
    assert(regRes.body.status === 'sucesso', 'Corpo da resposta deve indicar sucesso');
    assert(regReq.session.usuario && regReq.session.usuario.id, 'Sessão deve ser iniciada com usuário');

    // Verificar se a auto-elevação foi BLOQUEADA no banco
    const userCriado = await prisma.usuario.findFirst({
      where: { numeroSc: testSC.toUpperCase() },
      include: { perfilConfiguracao: true }
    });
    assert(userCriado !== null, 'Usuário deve existir no banco de dados');
    assert(userCriado.perfil === 'operador', `Perfil DEVE ser 'operador' ignorando injeção (Perfil no banco: ${userCriado.perfil})`);
    assert(userCriado.perfilConfiguracao !== null, 'PerfilConfiguracao deve ter sido criado automaticamente');

    // 2. Teste de Login com Número SC
    console.log('\n--- 2. Teste de Login com SC ---');
    const loginScReq = mockReq({ identificador: testSC, senha: testSenha });
    const loginScRes = mockRes();
    await authController.login(loginScReq, loginScRes);

    assert(loginScRes.statusCode === 200, `Login com SC deve retornar 200 (Recebido: ${loginScRes.statusCode})`);
    assert(loginScRes.body.usuario.numeroSc === testSC.toUpperCase(), 'Sessão deve conter SC correto');

    // 3. Teste de Login com E-mail
    console.log('\n--- 3. Teste de Login com E-mail ---');
    const loginEmailReq = mockReq({ identificador: testEmail, senha: testSenha });
    const loginEmailRes = mockRes();
    await authController.login(loginEmailReq, loginEmailRes);

    assert(loginEmailRes.statusCode === 200, `Login com E-mail deve retornar 200 (Recebido: ${loginEmailRes.statusCode})`);

    // 4. Teste de Falha de Login com Senha Incorreta
    console.log('\n--- 4. Teste de Credenciais Inválidas ---');
    const loginFailReq = mockReq({ identificador: testEmail, senha: 'senha_errada' });
    const loginFailRes = mockRes();
    await authController.login(loginFailReq, loginFailRes);

    assert(loginFailRes.statusCode === 401, `Login incorreto deve retornar 401 (Recebido: ${loginFailRes.statusCode})`);
    assert(loginFailRes.body.mensagem === 'Credenciais de acesso incorretas. Tente novamente.', 'Mensagem genérica para prevenir enumeração');

    // 5. Teste de Consulta de Sessão (/me)
    console.log('\n--- 5. Teste de Obtenção da Sessão (/me) ---');
    const meReq = mockReq({}, { usuario: { id: userCriado.id.toString(), perfil: 'operador' } });
    const meRes = mockRes();
    await authController.me(meReq, meRes);

    assert(meRes.statusCode === 200, `Endpoint /me deve retornar 200 (Recebido: ${meRes.statusCode})`);
    assert(meRes.body.usuario.email === testEmail.toLowerCase(), 'Dados do usuário retornados corretamente');

    // 6. Teste de Atualização de Perfil e Preferências
    console.log('\n--- 6. Teste de Atualização de Perfil & Preferências ---');

    // 6.1 Rejeição de múltiplos nomes na edição de perfil
    const perfInvalidoReq = mockReq({
      primeiro_nome: 'Operador Teste',
      ultimo_nome: 'Modificado'
    }, { usuario: { id: userCriado.id.toString(), perfil: 'operador' } });
    const perfInvalidoRes = mockRes();
    await perfilController.atualizarPerfil(perfInvalidoReq, perfInvalidoRes);
    assert(perfInvalidoRes.statusCode === 400, 'Atualização de perfil deve rejeitar primeiro_nome com mais de uma palavra (HTTP 400)');

    const perfReq = mockReq({
      primeiro_nome: 'Operador',
      ultimo_nome: 'Modificado',
      telemovel: '987654321',
      matricula_padrao: 'AA-00-BB',
      giro_padrao: '3000H'
    }, { usuario: { id: userCriado.id.toString(), perfil: 'operador' } });
    const perfRes = mockRes();
    await perfilController.atualizarPerfil(perfReq, perfRes);

    assert(perfRes.statusCode === 200, `Atualização de perfil deve retornar 200 (Recebido: ${perfRes.statusCode})`);

    const perfAtualizado = await prisma.perfilConfiguracao.findUnique({
      where: { usuarioId: userCriado.id }
    });
    assert(perfAtualizado.matriculaPadrao === 'AA-00-BB', 'Matrícula padrão atualizada no banco');
    assert(perfAtualizado.giroPadrao === '3000H', 'Giro padrão atualizado no banco');

    // 7. Teste de Recuperação de Palavra-passe
    console.log('\n--- 7. Teste de Recuperação de Senha ---');
    const recReq = mockReq({ email: testEmail });
    const recRes = mockRes();
    await authController.recuperarSenha(recReq, recRes);

    assert(recRes.statusCode === 200, `Pedido de recuperação deve retornar 200 (Recebido: ${recRes.statusCode})`);

    const userComToken = await prisma.usuario.findUnique({
      where: { id: userCriado.id }
    });
    assert(userComToken.tokenRecuperacao !== null, 'Token de recuperação gerado no banco');
    assert(userComToken.tokenExpiracao > new Date(), 'Expiração do token configurada no futuro (1 hora)');

    // 8. Teste de Redefinição de Senha com o Token
    console.log('\n--- 8. Teste de Redefinição de Senha ---');
    const novaSenhaTeste = 'NovaSenha456!';
    const redefReq = mockReq({
      token: userComToken.tokenRecuperacao,
      nova_senha: novaSenhaTeste,
      confirmar_senha: novaSenhaTeste
    });
    const redefRes = mockRes();
    await authController.redefinirSenha(redefReq, redefRes);

    assert(redefRes.statusCode === 200, `Redefinição de senha deve retornar 200 (Recebido: ${redefRes.statusCode})`);

    // Validar login com a nova senha
    const loginNovoReq = mockReq({ identificador: testEmail, senha: novaSenhaTeste });
    const loginNovoRes = mockRes();
    await authController.login(loginNovoReq, loginNovoRes);
    assert(loginNovoRes.statusCode === 200, 'Login com a NOVA senha deve funcionar');

    // 9. Teste de Limpeza de Dados de Teste
    await prisma.perfilConfiguracao.deleteMany({ where: { usuarioId: userCriado.id } });
    await prisma.usuario.delete({ where: { id: userCriado.id } });

    console.log('\n====================================================');
    console.log(`Resultado: ${passed} passaram, ${failed} falharam.`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (error) {
    console.error('Erro crítico no teste:', error);
    process.exit(1);
  }
}

runTests();
