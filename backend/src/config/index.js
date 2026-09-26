try {
  require('dotenv').config();
} catch (e) {
  // Em ambientes de container, as variáveis são injetadas diretamente via docker-compose
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET || 'dev_secret_cac_atividades_key_2026',
  databaseUrl: process.env.DATABASE_URL,
  db: {
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'devuser',
    password: process.env.POSTGRES_PASSWORD || 'devpassword',
    database: process.env.POSTGRES_DB || 'appdb'
  },
  email: {
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'no-reply@cacatividades.pt'
  }
};
