const path = require('path');
const fs = require('fs');

// Função para sincronizar variáveis a partir do .env com override ativo
function carregarDotenv() {
  try {
    const dotenv = require('dotenv');
    const envPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(__dirname, '../../.env'),
      path.resolve(__dirname, '../../../.env')
    ];

    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        dotenv.config({ path: p, override: true });
        break;
      }
    }
  } catch (e) {
    // Em ambientes sem dotenv ou com injeção externa
  }
}

// Carga inicial
carregarDotenv();

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
  carregarDotenv,
  get env() {
    return process.env.NODE_ENV || 'development';
  },
  get port() {
    return parseInt(process.env.PORT || '3000', 10);
  },
  get sessionSecret() {
    return process.env.SESSION_SECRET || 'dev_secret_cac_atividades_key_2026';
  },
  get databaseUrl() {
    return process.env.DATABASE_URL || defaultDbUrl;
  },
  db: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName
  },
  get appUrl() {
    carregarDotenv();
    return (process.env.APP_URL || '').trim();
  },
  get email() {
    carregarDotenv();
    return {
      host: (process.env.SMTP_HOST || 'smtp-relay.brevo.com').trim(),
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: (process.env.SMTP_USER || '').trim(),
      pass: (process.env.SMTP_PASS || '').trim(),
      from: (process.env.EMAIL_FROM || 'no-reply@cacatividades.pt').trim()
    };
  }
};
