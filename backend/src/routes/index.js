const express = require('express');
const router = express.Router();

// Health Check da API
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend está rodando!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
