const express = require('express');
const router = express.Router();
const prisma = require('../database/prisma');

// Health Check geral da API
router.get('/health', async (req, res) => {
  try {
    // Validação de conexão e contagem de usuários para certificar o Prisma Client
    const totalUsuarios = await prisma.usuario.count();

    res.json({
      status: 'ok',
      message: 'Backend e Banco de Dados operacionais!',
      database: {
        connected: true,
        totalUsuarios
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'erro',
      message: 'Falha na conexão com o banco de dados',
      detalhe: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
