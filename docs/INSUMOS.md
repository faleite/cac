# Inventário de Insumos do Projeto CAC Atividades

| Arquivo | O que é | Usado pelo sistema em execução? | Onde será usado | Observações |
|---|---|---|---|---|
| `docs/FSD.md` | Documento de Especificação Funcional e Técnica principal | Não | Documentação de arquitetura e regras | Fonte de verdade funcional e técnica para o desenvolvimento |
| `docs/DESIGN.md` | Especificação do Design System (*Postal Utility System*) | Não | Referência visual para HTML/CSS | Guia de cores (CTT Red `#a8001c`), tipografia Inter, espaçamentos e componentes |
| `docs/extras/cac-model.txt` | Exemplo de texto formatado para o WhatsApp | Não | Referência para validação/testes | Exemplo do modelo oficial de mensagem a ser gerado no backend/frontend |
| `docs/extras/design/00-registo-de-utilizador-layout/code.html` | Protótipo HTML do ecrã de Auto-Registo | Não | Referência para construção da View (`src/views/auth/registo.html`) | Layout estrutural e classes de estilo do formulário de registo |
| `docs/extras/design/00-registo-de-utilizador-layout/screen.png` | Mockup visual do ecrã de Auto-Registo | Não | Referência visual | Imagem estática do layout de auto-registo |
| `docs/extras/design/01-iniciar-sessao-layout/code.html` | Protótipo HTML do ecrã de Login | Não | Referência para construção da View (`src/views/auth/login.html`) | Layout estrutural e campos do formulário de autenticação |
| `docs/extras/design/01-iniciar-sessao-layout/screen.png` | Mockup visual do ecrã de Login | Não | Referência visual | Imagem estática do layout de login |
| `docs/extras/design/02-inicio-de-turno-layout/code.html` | Protótipo HTML de Início de Turno (Abertura) | Não | Referência para construção da View (`src/views/registos/abertura.html`) | Layout de abertura de turno (Km Inicial, Giro, Matrícula) |
| `docs/extras/design/02-inicio-de-turno-layout/screen.png` | Mockup visual de Início de Turno | Não | Referência visual | Imagem estática da tela de abertura de turno |
| `docs/extras/design/03-fim-de-turno-layout/code.html` | Protótipo HTML de Fim de Turno (Fecho) | Não | Referência para construção da View (`src/views/registos/fecho.html`) | Layout do fecho de turno com campos de incidências e Km Final |
| `docs/extras/design/03-fim-de-turno-layout/screen.png` | Mockup visual de Fim de Turno | Não | Referência visual | Imagem estática da tela de fecho de turno |
| `docs/extras/design/04-registo-diario-layout/code.html` | Protótipo HTML do ecrã de Registo Diário | Não | Referência para construção da View de histórico/registos | Layout de acompanhamento do turno do dia |
| `docs/extras/design/04-registo-diario-layout/screen.png` | Mockup visual do Registo Diário | Não | Referência visual | Imagem estática da tela de registo diário |
| `docs/extras/design/05-resumo-de-partilha-layout/code.html` | Protótipo HTML do ecrã/modal de Partilha WhatsApp | Não | Referência para construção da View (`src/views/registos/confirmar-whatsapp.html`) | Layout com pré-visualização do texto e botões Copiar / Enviar |
| `docs/extras/design/05-resumo-de-partilha-layout/screen.png` | Mockup visual da Partilha WhatsApp | Não | Referência visual | Imagem estática da tela de envio para WhatsApp |
| `docs/extras/design/06-relatorio-diario-de-atividade/code.html` | Protótipo HTML de Relatório Diário | Não | Referência para construção da View de detalhe do dia | Layout de resumo das métricas diárias |
| `docs/extras/design/06-relatorio-diario-de-atividade/screen.png` | Mockup visual do Relatório Diário | Não | Referência visual | Imagem estática do relatório diário |
| `docs/extras/design/07-relatorio-mensal-layout/code.html` | Protótipo HTML do Dashboard de Indicadores | Não | Referência para construção da View (`src/views/dashboard/index.html`) | Layout com cartões de KPIs, gráfico e tabela de histórico |
| `docs/extras/design/07-relatorio-mensal-layout/screen.png` | Mockup visual do Dashboard | Não | Referência visual | Imagem estática do dashboard |
| `docs/extras/design/08-perfil-e-configuracoes-layout/code.html` | Protótipo HTML de Perfil do Colaborador | Não | Referência para construção da View (`src/views/perfil/index.html`) | Layout de configurações de preferências (Matrícula e Giro Padrão) |
| `docs/extras/design/08-perfil-e-configuracoes-layout/screen.png` | Mockup visual de Perfil | Não | Referência visual | Imagem estática da tela de perfil |
| `docs/extras/prompts/DECISOES_TECNICAS.md` | Registro de decisões técnicas tomadas na concepção | Não | Documentação histórica | Consolidado no FSD.md |
| `docs/extras/prompts/PRD.md` | Documento do Produto inicial (PRD) | Não | Documentação histórica | Consolidado no FSD.md |
| `docs/extras/prompts/create-fsd.md` | Prompt de geração do FSD | Não | Documentação histórica | Instruções usadas para criar a especificação |
| `docs/extras/prompts/ideia-consolidada-v1.md` | Documento de ideia consolidada do projeto | Não | Documentação histórica | Consolidado no FSD.md |
| `docs/extras/prompts/prompt-decisoes-tecnicas.md` | Prompt para decisões técnicas | Não | Documentação histórica | Material de apoio |
| `docs/extras/prompts/prompt-idea-explore.md` | Prompt para exploração da ideia | Não | Documentação histórica | Material de apoio |
| `docs/extras/prompts/prompt-to-prompt-design.md` | Prompt de geração do design system | Não | Documentação histórica | Material de apoio |

*Nota:* Nenhum arquivo da pasta `docs/` precisa ser copiado diretamente para a pasta pública durante o runtime; os estilos CSS (Bootstrap local e custom.css) e scripts Vanilla JS serão criados em `public/css/` e `public/js/` com base nos protótipos e especificações do `docs/DESIGN.md`.
