const session = require('express-session');
const pgSimple = require('connect-pg-simple');
const { Pool } = require('pg');
const config = require('./index');

const pgSession = pgSimple(session);

// Pool dedicado para o gerenciador de sessões
const pool = new Pool({
  connectionString: config.databaseUrl || undefined,
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database
});

const sessionMiddleware = session({
  store: new pgSession({
    pool: pool,
    tableName: 'app_sessoes',
    createTableIfMissing: false // Tabela já criada via Prisma Migration
  }),
  name: 'cac_session_id',
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000, // 8 horas conforme o FSD (Seção 15)
    httpOnly: true,             // Proteção contra leitura por scripts (XSS)
    sameSite: 'lax',            // Proteção contra CSRF
    secure: config.env === 'production' // Apenas HTTPS em produção
  }
});

module.exports = {
  sessionMiddleware,
  sessionPool: pool
};
