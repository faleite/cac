const express = require('express');
const cors = require('cors');

const config = require('./config');
const { sessionMiddleware } = require('./config/session');
const apiRoutes = require('./routes');

const app = express();
const PORT = config.port;

// Habilitar trust proxy para ambientes atrás de Nginx
app.set('trust proxy', 1);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor CAC Atividades ouvindo na porta ${PORT} [Ambiente: ${config.env}]`);
});