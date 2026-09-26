/**
 * CAC Atividades - Rotas do Módulo de Registos Diários e Turnos
 */

const express = require('express');
const router = express.Router();

const RegistoDiarioController = require('../controllers/RegistoDiarioController');
const { verificarAutenticacao } = require('../middlewares/auth');

// Todas as rotas de registo exigem autenticação ativa
router.use(verificarAutenticacao);

// 1. Estado atual do dia e pendências de dias anteriores
router.get('/estado-atual', RegistoDiarioController.obterEstadoAtual);

// 2. Abertura de Turno (Início)
router.post('/abertura', RegistoDiarioController.abrirTurno);

// 3. Fecho de Turno (Fim)
router.post('/fecho', RegistoDiarioController.fecharTurno);

// 4. Listagem de histórico de turnos
router.get('/', RegistoDiarioController.listarRegistos);

// 5. Detalhes de um turno específico por ID (com auditoria)
router.get('/:id', RegistoDiarioController.obterPorId);

// 6. Edição de turno com justificativa e auditoria obrigatória
router.put('/:id', RegistoDiarioController.editarRegisto);

module.exports = router;
