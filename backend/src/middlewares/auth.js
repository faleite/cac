/**
 * Middleware para verificação de autenticação de sessão
 */
function verificarAutenticacao(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.id) {
    return next();
  }

  // Se a requisição for de API (espera JSON), retorna 401
  if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json')) || req.path.startsWith('/api/')) {
    return res.status(401).json({
      status: 'erro',
      mensagem: 'Não autenticado. Por favor inicie sessão.'
    });
  }

  // Para requisições comuns de página web, redireciona para login
  return res.redirect('/login.html');
}

module.exports = {
  verificarAutenticacao
};
