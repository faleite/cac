const express = require('express');
const router = express.Router();
const prisma = require('../database/prisma');

const authRoutes = require('./auth.routes');
const perfilRoutes = require('./perfil.routes');

// Health Check geral da API
router.get('/health', async (req, res) => {
  try {
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

// Agrupamento de rotas por módulo
router.use('/auth', authRoutes);
router.use('/perfil', perfilRoutes);

module.exports = router;
