/**
 * Utilitário de Teste de Conexão e Disparo de E-mail via Brevo (SMTP)
 * 
 * Uso:
 *   1. Apenas verificar conexão com o servidor SMTP do Brevo:
 *      node src/utils/test-email.js
 * 
 *   2. Testar envio real de e-mail de recuperação para um endereço:
 *      node src/utils/test-email.js seu-email@dominio.com
 */

const crypto = require('crypto');
const config = require('../config');
const { verificarConexaoSMTP, enviarEmailRecuperacao } = require('./mailer');

async function testarEmail() {
  console.log('====================================================');
  console.log('  CAC Atividades - Diagnóstico de E-mail (Brevo)');
  console.log('====================================================\n');

  console.log('Parâmetros Atuais de Configuração:');
  console.log(`- Host SMTP:       ${config.email.host}`);
  console.log(`- Porta SMTP:      ${config.email.port}`);
  console.log(`- Usuário:         ${config.email.user ? config.email.user : '(não configurado - modo simulado)'}`);
  console.log(`- Senha:           ${config.email.pass ? '******** (definida)' : '(não configurada)'}`);
  console.log(`- Remetente:       ${config.email.from}`);
  console.log(`- URL Base (App):  ${config.appUrl || '(automática via Host)'}\n`);

  // 1. Testar verificação da conexão SMTP
  console.log('--- 1. Teste de Conexão com o Servidor SMTP ---');
  const statusConexao = await verificarConexaoSMTP();

  if (statusConexao.conectado) {
    console.log(`✅ [SUCESSO] ${statusConexao.mensagem}`);
  } else if (statusConexao.modoSimulado) {
    console.log(`ℹ️ [MODO SIMULADO] ${statusConexao.mensagem}`);
    console.log('   Para ativar o envio real via Brevo, preencha SMTP_USER e SMTP_PASS no arquivo .env.');
  } else {
    console.error(`❌ [FALHA DE CONEXÃO] ${statusConexao.mensagem}`);
    if (statusConexao.erro) {
      console.error(`   Detalhe do erro: ${statusConexao.erro}`);
    }
    if (statusConexao.orientacao) {
      console.log('\n🔍 [DIAGNÓSTICO E ORIENTAÇÃO]:');
      console.log(`   ${statusConexao.orientacao}`);
    }
  }

  // 2. Se foi passado um e-mail destinatário como argumento na linha de comando
  const destinatario = process.argv[2];

  if (destinatario && destinatario.includes('@')) {
    console.log(`\n--- 2. Teste de Disparo Real para: ${destinatario} ---`);
    const tokenSimulado = crypto.randomBytes(32).toString('hex');
    const nomeSimulado = 'Colaborador Teste';

    const resultado = await enviarEmailRecuperacao(
      destinatario,
      nomeSimulado,
      tokenSimulado,
      config.appUrl || 'http://localhost'
    );

    if (resultado.sucesso) {
      if (resultado.simulado) {
        console.log('✅ [DISPARO SIMULADO OK]');
        console.log(`   Link gerado: ${resultado.link}`);
      } else {
        console.log('✅ [E-MAIL ENVIADO COM SUCESSO VIA BREVO]');
        console.log(`   Message ID:  ${resultado.messageId}`);
        console.log(`   Link no e-mail: ${resultado.link}`);
      }
    } else {
      console.error('❌ [ERRO NO DISPARO]');
      console.error(`   Erro reportado: ${resultado.erro}`);
      if (resultado.orientacao) {
        console.log('\n🔍 [DIAGNÓSTICO E ORIENTAÇÃO]:');
        console.log(`   ${resultado.orientacao}`);
      }
      console.log(`   Link contingencial: ${resultado.link}`);
    }
  } else {
    console.log('\n💡 Dica: Para disparar um e-mail de teste real para a sua caixa de entrada, execute:');
    console.log('   node src/utils/test-email.js seu-email@exemplo.com');
  }

  console.log('\n====================================================\n');
}

testarEmail().catch((err) => {
  console.error('Erro inesperado no diagnóstico:', err);
  process.exit(1);
});
