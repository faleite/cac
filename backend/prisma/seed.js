require('../src/config');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed do banco de dados CAC Atividades...');

  // Salt rounds para hash bcrypt conforme especificado no FSD
  const SALT_ROUNDS = 10;

  // 1. Criar Administrador Padrão
  const adminSenhaHash = await bcrypt.hash('Admin@CAC2026!', SALT_ROUNDS);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@cacatividades.pt' },
    update: {
      primeiroNome: 'Administrador',
      ultimoNome: 'CAC',
      numeroSc: 'SC-0001',
      telemovel: '+351910000000',
      senhaHash: adminSenhaHash,
      perfil: 'administrador',
      ativo: true
    },
    create: {
      primeiroNome: 'Administrador',
      ultimoNome: 'CAC',
      numeroSc: 'SC-0001',
      telemovel: '+351910000000',
      email: 'admin@cacatividades.pt',
      senhaHash: adminSenhaHash,
      perfil: 'administrador',
      ativo: true,
      perfilConfiguracao: {
        create: {
          matriculaPadrao: '00-AA-00',
          giroPadrao: '2800'
        }
      }
    }
  });

  // Garantir que a configuração do perfil do admin existe
  await prisma.perfilConfiguracao.upsert({
    where: { usuarioId: admin.id },
    update: {
      matriculaPadrao: '00-AA-00',
      giroPadrao: '2800'
    },
    create: {
      usuarioId: admin.id,
      matriculaPadrao: '00-AA-00',
      giroPadrao: '2800'
    }
  });

  console.log(`✓ Administrador criado/atualizado: ${admin.email} (SC: ${admin.numeroSc})`);

  // 2. Criar Operador Padrão (Estafeta Homologação)
  const operadorSenhaHash = await bcrypt.hash('Operador@CAC2026!', SALT_ROUNDS);
  const operador = await prisma.usuario.upsert({
    where: { email: 'fabricio@cacatividades.pt' },
    update: {
      primeiroNome: 'Fabrício',
      ultimoNome: 'Leite',
      numeroSc: 'SC-2825',
      telemovel: '+351912345678',
      senhaHash: operadorSenhaHash,
      perfil: 'operador',
      ativo: true
    },
    create: {
      primeiroNome: 'Fabrício',
      ultimoNome: 'Leite',
      numeroSc: 'SC-2825',
      telemovel: '+351912345678',
      email: 'fabricio@cacatividades.pt',
      senhaHash: operadorSenhaHash,
      perfil: 'operador',
      ativo: true,
      perfilConfiguracao: {
        create: {
          matriculaPadrao: 'BI-04-NH',
          giroPadrao: '2825H'
        }
      }
    }
  });

  // Garantir que a configuração do perfil do operador existe
  await prisma.perfilConfiguracao.upsert({
    where: { usuarioId: operador.id },
    update: {
      matriculaPadrao: 'BI-04-NH',
      giroPadrao: '2825H'
    },
    create: {
      usuarioId: operador.id,
      matriculaPadrao: 'BI-04-NH',
      giroPadrao: '2825H'
    }
  });

  console.log(`✓ Operador criado/atualizado: ${operador.email} (SC: ${operador.numeroSc})`);
  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
