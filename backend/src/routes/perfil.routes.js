const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/PerfilController');
const { verificarAutenticacao } = require('../middlewares/auth');

// Rotas protegidas de perfil
router.get('/', verificarAutenticacao, perfilController.obterPerfil);
router.put('/', verificarAutenticacao, perfilController.atualizarPerfil);
router.delete('/conta', verificarAutenticacao, perfilController.eliminarConta);

module.exports = router;
