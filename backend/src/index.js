const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const config = require('./config');
const apiRoutes = require('./routes');

const app = express();
const prisma = new PrismaClient();
const PORT = config.port;

app.use(cors());
app.use(express.json());

// Rota de Health Check direta e via roteador /api
app.use('/api', apiRoutes);

// Suas rotas de negócio serão adicionadas abaixo...

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ouvindo na porta ${PORT} [Ambiente: ${config.env}]`);
});