/**
 * CAC Atividades - Utilitário de Preservação de Rascunho de Digitação (Local Storage)
 * Conforme especificações do docs/FSD.md (Seção 1, 6 e 14)
 */

const CACDraftStorage = {
  PREFIXO: 'cac_draft_',

  /**
   * Salva os valores de um formulário no localStorage
   * @param {string} formId ID do formulário HTML
   */
  salvar(formId) {
    try {
      const form = document.getElementById(formId);
      if (!form) return;

      const formData = new FormData(form);
      const dados = {};

      formData.forEach((value, key) => {
        // Ignora campos de senha e tokens por segurança
        if (key.toLowerCase().includes('senha') || key.toLowerCase().includes('token')) {
          return;
        }
        dados[key] = value;
      });

      const chave = this.PREFIXO + formId;
      localStorage.setItem(chave, JSON.stringify({
        timestamp: Date.now(),
        dados
      }));
    } catch (e) {
      console.warn('[DRAFT STORAGE] Falha ao persistir rascunho:', e);
    }
  },

  /**
   * Restaura os valores salvos no formulário se houver rascunho
   * @param {string} formId ID do formulário HTML
   * @returns {boolean} Retorna true se restaurou algum dado
   */
  restaurar(formId) {
    try {
      const form = document.getElementById(formId);
      if (!form) return false;

      const chave = this.PREFIXO + formId;
      const salvo = localStorage.getItem(chave);
      if (!salvo) return false;

      const parsed = JSON.parse(salvo);
      if (!parsed || !parsed.dados) return false;

      // O rascunho expira em 24 horas por segurança
      const umDiaMs = 24 * 60 * 60 * 1000;
      if (Date.now() - parsed.timestamp > umDiaMs) {
        this.limpar(formId);
        return false;
      }

      let restaurouAlgo = false;
      Object.keys(parsed.dados).forEach(campoNome => {
        const elemento = form.elements[campoNome];
        if (elemento && parsed.dados[campoNome] !== undefined && parsed.dados[campoNome] !== '') {
          // Se o elemento já tiver valor padrão diferente de vazio, só sobrescreve se o rascunho tiver valor
          elemento.value = parsed.dados[campoNome];
          restaurouAlgo = true;
          // Dispara evento input para acionar cálculos em tempo real
          elemento.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      return restaurouAlgo;
    } catch (e) {
      console.warn('[DRAFT STORAGE] Falha ao restaurar rascunho:', e);
      return false;
    }
  },

  /**
   * Limpa o rascunho de um formulário após envio com sucesso
   * @param {string} formId ID do formulário HTML
   */
  limpar(formId) {
    try {
      const chave = this.PREFIXO + formId;
      localStorage.removeItem(chave);
    } catch (e) {
      console.warn('[DRAFT STORAGE] Falha ao limpar rascunho:', e);
    }
  },

  /**
   * Conecta ouvintes automáticos a todos os campos do formulário
   * @param {string} formId ID do formulário HTML
   * @param {Function} [onRestore] Callback executado quando dados forem restaurados
   */
  conectar(formId, onRestore) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Restaura rascunho inicial
    const restaurado = this.restaurar(formId);
    if (restaurado && typeof onRestore === 'function') {
      onRestore();
    }

    // Ouve alterações com debounce leve
    let timeoutId;
    form.addEventListener('input', () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.salvar(formId);
      }, 300);
    });

    form.addEventListener('change', () => {
      this.salvar(formId);
    });
  }
};
