/**
 * Middleware para verificação de perfis de acesso (RBAC)
 * @param {string[]} perfisPermitidos - Lista de perfis autorizados (ex: ['administrador'])
 */
function autorizarPerfis(...perfisPermitidos) {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.status(401).json({
        status: 'erro',
        mensagem: 'Não autenticado. Por favor inicie sessão.'
      });
    }

    const { perfil } = req.session.usuario;

    if (!perfisPermitidos.includes(perfil)) {
      return res.status(403).json({
        status: 'erro',
        mensagem: 'Acesso negado. Perfil de utilizador não autorizado para este recurso.'
      });
    }

    next();
  };
}

module.exports = {
  autorizarPerfis,
  exigirAdmin: autorizarPerfis('administrador')
};
