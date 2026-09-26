/**
 * CAC Atividades - Client-side Utilities
 */

const CAC = {
  // Chamada de API com credenciais e tratamento de JSON
  async api(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include'
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(`/api${endpoint}`, config);
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error('[ERRO API]', error);
      return {
        ok: false,
        status: 500,
        data: { status: 'erro', mensagem: 'Falha de comunicação com o servidor.' }
      };
    }
  },

  // Exibir alerta em um elemento container
  mostrarAlerta(containerId, mensagem, tipo = 'danger') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="alert alert-${tipo}">
        <span>${mensagem}</span>
      </div>
    `;
    container.style.display = 'block';
  },

  limparAlerta(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
      container.style.display = 'none';
    }
  },

  // Configurar alternância de visibilidade de senha
  configurarToggleSenha(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (!input || !btn) return;

    btn.addEventListener('click', () => {
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? 'Ocultar' : 'Mostrar';
    });
  },

  // Obter usuário da sessão ativa
  async obterSessao() {
    const res = await this.api('/auth/me', { method: 'GET' });
    if (res.ok && res.data.autenticado) {
      return res.data.usuario;
    }
    return null;
  },

  // Encerrar sessão
  async logout() {
    await this.api('/auth/logout', { method: 'POST' });
    window.location.href = '/login.html';
  }
};
