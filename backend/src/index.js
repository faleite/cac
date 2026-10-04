const express = require('express');
const cors = require('cors');

const config = require('./config');
const { sessionMiddleware } = require('./config/session');
const { logErro } = require('./utils/logger');
const apiRoutes = require('./routes');

const app = express();
const PORT = config.port;

// Habilitar trust proxy para ambientes atrás de Nginx
app.set('trust proxy', 1);

// Cabeçalhos HTTP de Segurança
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de sessão persistente no PostgreSQL
app.use(sessionMiddleware);

// Rotas da API
app.use('/api', apiRoutes);

// Rota 404 para endpoints não encontrados na API
app.use('/api', (req, res) => {
  res.status(404).json({
    status: 'erro',
    mensagem: 'Recurso da API não encontrado.'
  });
});

// Middleware Global de Tratamento de Erros
app.use((err, req, res, next) => {
  logErro('EXPRESS_GLOBAL', `Erro não tratado na rota ${req.method} ${req.originalUrl}: ${err.message}`, err);
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({
    status: 'erro',
    mensagem: 'Ocorreu um erro interno no servidor.'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor CAC Atividades ouvindo na porta ${PORT} [Ambiente: ${config.env}]`);
});