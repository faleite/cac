const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');

// Rotas públicas
router.post('/registo', authController.registo);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);
router.post('/recuperar-senha', authController.recuperarSenha);
router.post('/redefinir-senha', authController.redefinirSenha);

module.exports = router;
