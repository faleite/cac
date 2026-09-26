const express = require('express');
const cors = require('cors');

const config = require('./config');
const prisma = require('./database/prisma');
const apiRoutes = require('./routes');

const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api', apiRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ouvindo na porta ${PORT} [Ambiente: ${config.env}]`);
});