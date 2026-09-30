const path = require('path');
const fs = require('fs');

// Tentar carregar dotenv a partir da pasta local ou da raiz do projeto
try {
  const dotenv = require('dotenv');
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env')
  ];

  for (const p of envPaths) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      break;
    }
  }
} catch (e) {
  // Em ambientes de container, as variáveis são injetadas diretamente via docker-compose
}

const dbUser = process.env.POSTGRES_USER || process.env.DB_USER || 'devuser';
const dbPassword = process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD || 'devpassword';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbName = process.env.POSTGRES_DB || process.env.DB_NAME || 'appdb';

const defaultDbUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}?schema=public`;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = defaultDbUrl;
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET || 'dev_secret_cac_atividades_key_2026',
  databaseUrl: process.env.DATABASE_URL || defaultDbUrl,
  db: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName
  },
  appUrl: process.env.APP_URL || '',
  email: {
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'no-reply@cacatividades.pt'
  }
};
