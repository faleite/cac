/**
 * CAC Atividades - Script Client-side para Partilha no WhatsApp
 * Conforme especificações do docs/DESIGN.md e docs/FSD.md (Módulo 3)
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Verificar autenticação do utilizador
  const usuario = await CAC.obterSessao();
  if (!usuario) {
    window.location.href = '/login.html';
    return;
  }

  // Configurar botão de logout do cabeçalho
  const btnHeaderLogout = document.getElementById('btn-header-logout');
  if (btnHeaderLogout) {
    btnHeaderLogout.addEventListener('click', () => CAC.logout());
  }

  // 2. Extrair ID do registo a partir dos parâmetros de URL (?id=123)
  const urlParams = new URLSearchParams(window.location.search);
  const registoId = urlParams.get('id');

  const alertContainer = document.getElementById('alert-container');
  const previewCard = document.getElementById('card-preview-whatsapp');
  const previewTextElement = document.getElementById('whatsapp-text-preview');
  const btnCopiar = document.getElementById('btn-copiar-texto');
  const btnEnviarWhatsapp = document.getElementById('btn-enviar-whatsapp');

  if (!registoId) {
    CAC.mostrarAlerta('alert-container', 'Nenhum registo de turno foi especificado para partilha.', 'warning');
    if (previewCard) previewCard.style.display = 'none';
    return;
  }

  let textoMensagemGlobal = '';
  let urlWhatsappGlobal = '';

  // 3. Buscar pré-visualização formatada do backend
  try {
    const res = await CAC.api(`/registos/${registoId}/whatsapp-preview`);

    if (res.ok && res.data && res.data.dados) {
      textoMensagemGlobal = res.data.dados.textoMensagem;
      urlWhatsappGlobal = res.data.dados.whatsappUrl;

      if (previewTextElement) {
        previewTextElement.textContent = textoMensagemGlobal;
      }
    } else {
      CAC.mostrarAlerta('alert-container', res.data.mensagem || 'Falha ao gerar pré-visualização do relatório.', 'danger');
      if (previewCard) previewCard.style.display = 'none';
      return;
    }
  } catch (err) {
    console.error('[ERRO CARREGAR PREVIEW WHATSAPP]', err);
    CAC.mostrarAlerta('alert-container', 'Erro de comunicação ao carregar o relatório.', 'danger');
    return;
  }

  // 4. Ação: Copiar Texto com Fallback seguro
  if (btnCopiar) {
    btnCopiar.addEventListener('click', async () => {
      if (!textoMensagemGlobal) return;

      let copiado = false;

      // Tentativa 1: API nativa Clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(textoMensagemGlobal);
          copiado = true;
        } catch (clipErr) {
          console.warn('[CLIPBOARD API FALHOU, USANDO FALLBACK]', clipErr);
        }
      }

      // Tentativa 2: Fallback com elemento Textarea temporário
      if (!copiado) {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = textoMensagemGlobal;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          copiado = document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch (execErr) {
          console.error('[FALLBACK COPY FALHOU]', execErr);
        }
      }

      if (copiado) {
        CAC.mostrarAlerta('alert-container', 'Texto do relatório copiado para a área de transferência com sucesso!', 'success');
        
        // Efeito visual no botão
        const textoOriginal = btnCopiar.innerHTML;
        btnCopiar.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span>Copiado com Sucesso!</span>
        `;
        btnCopiar.style.borderColor = 'var(--color-tertiary)';
        btnCopiar.style.color = 'var(--color-tertiary)';

        setTimeout(() => {
          btnCopiar.innerHTML = textoOriginal;
          btnCopiar.style.borderColor = '';
          btnCopiar.style.color = '';
        }, 3000);
      } else {
        CAC.mostrarAlerta('alert-container', 'Não foi possível copiar automaticamente. Selecione e copie o texto manualmente acima.', 'warning');
      }
    });
  }

  // 5. Ação: Enviar para WhatsApp
  if (btnEnviarWhatsapp) {
    btnEnviarWhatsapp.addEventListener('click', () => {
      if (urlWhatsappGlobal) {
        window.open(urlWhatsappGlobal, '_blank');
      } else if (textoMensagemGlobal) {
        const targetUrl = `https://wa.me/?text=${encodeURIComponent(textoMensagemGlobal)}`;
        window.open(targetUrl, '_blank');
      }
    });
  }
});
