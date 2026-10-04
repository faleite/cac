const express = require('express');
const router = express.Router();
const prisma = require('../database/prisma');

const authRoutes = require('./auth.routes');
const perfilRoutes = require('./perfil.routes');
const registosRoutes = require('./registos.routes');

const { logErro } = require('../utils/logger');

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
    logErro('HEALTH_CHECK', 'Falha na verificação de integridade do banco de dados', error);
    res.status(500).json({
      status: 'erro',
      message: 'Falha temporária na conexão com a base de dados.',
      timestamp: new Date().toISOString()
    });
  }
});

// Agrupamento de rotas por módulo
router.use('/auth', authRoutes);
router.use('/perfil', perfilRoutes);
router.use('/registos', registosRoutes);

module.exports = router;
