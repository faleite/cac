# Registro de Erros e Resoluções (ERROS.md)

Arquivo vivo para documentação de erros técnicos, anomalias, problemas de ambiente ou inconsistências identificadas durante o desenvolvimento e execução do sistema **CAC Atividades**, acompanhados de causa-raiz e solução aplicada.

---

## 1. Tabela de Ocorrências

| ID | Data | Módulo / Componente | Descrição da Ocorrência | Causa-Raiz | Solução / Contramedida Adotada | Status |
|:---:|:---:|---|---|---|---|:---:|
| **ERR-001** | 2026-09-26 | Docker / Ambiente | Conexão com o socket do Docker (`unix:///Users/.../.docker/run/docker.sock`) restrita pelo sandbox de execução de comandos. | O agente opera em sandbox seguro que bloqueia acesso direto a sockets Unix fora do workspace sem elevação de permissão. | Operações de subida/execução no Docker que necessitarem de bypass devem ser aprovadas pelo usuário ou os comandos devem ser documentados para execução manual/assistida. | **Mitigado** |
| **ERR-002** | 2026-09-26 | Backend / Dependências | Falha de carregamento do binário nativo de compilação C++ do pacote `bcrypt` (`bcrypt_lib.node`). | O pacote nativo `bcrypt` exige compilação via `node-gyp`/Python no host, gerando inconsistências entre macOS arm64 e Linux Alpine. | Adoção do pacote `bcryptjs` (implementação 100% JavaScript puro sem dependências nativas C++), garantindo portabilidade universal e mesma segurança criptográfica. | **Resolvido** |
| **ERR-003** | 2026-09-28 | Frontend / Cabeçalho e UI | Imagem do cabeçalho desconfigurada (SVG gigante), sobreposição do texto e botão de logout inoperante em `abertura.html`, `fecho.html` e `registos.html`. | Estrutura HTML do cabeçalho divergente da especificação de `perfil.html`, com classes de SVG não dimensionadas e IDs de logout desincronizados. | Padronização integral da estrutura de cabeçalho com `brand-title`, SVG `.icon` (20x20px vermelho CTT), botão `#btn-header-logout` com classe `.link` e vinculação reativa no script `CAC.logout()`. | **Resolvido** |
| **ERR-004** | 2026-09-28 | Backend & Frontend / Validação | Submissão de fecho permitindo Km Final igual ao Km Inicial (percurso de 0 km). | Validação verificava apenas se `kmFinal < kmInicial`, aceitando igualdade como válida. | Atualizada a validação no backend (`calculos.js`) e no frontend (`fecho.html`, `registos.html`) para exigir estritamente `kmFinal > kmInicial`, bloqueando `kmFinal <= kmInicial` com mensagem explicativa e feedback visual ao vivo. | **Resolvido** |
| **ERR-005** | 2026-09-28 | Frontend / Abertura de Turno | Campo "Data de Operação" bloqueado com atributo `disabled`, impedindo o registo retroativo de dias anteriores. | O campo de data estava fixado como texto somente leitura (`disabled`), sem permitir edição e sem enviar o campo `dataRegisto` no payload de abertura. | Campo atualizado para `<input type="date">` editável preenchido por defeito com a data atual (`YYYY-MM-DD`), envio de `dataRegisto` no POST de abertura, normalização UTC no backend e reatividade do botão de início ao selecionar datas anteriores. | **Resolvido** |
| **ERR-006** | 2026-09-28 | Frontend / UI Registos | Botão "+ Novo Turno" visualmente colado à barra de filtros ("Todos", "Fechados", "Abertos"). | Falta de margem inferior específica (`margin-bottom`) no botão de ação e espaçamento insuficiente com o grupo de botões de filtro. | Ajustado o layout em `registos.html` com espaçamento preciso de ~8px (~2mm) entre o botão de novo turno e o container de filtros. | **Resolvido** |
| **ERR-007** | 2026-09-29 | Backend / Formatters | Campos de incidências zeradas exibindo `**` em vez de `*0*` na mensagem do WhatsApp em `confirmar-whatsapp.html`. | A função `formatarIncidenciaValor` retornava `**` para valores zero ou nulos. | Atualizada a função em `backend/src/utils/formatters.js` para retornar `*0*` quando a quantidade for zero/nula e atualizados os testes automatizados em `test-fase5.js`. | **Resolvido** |
| **ERR-008** | 2026-09-30 | Frontend / Rascunho & Sincronização | Matrícula em `abertura.html` não atualizava após alteração de matrícula padrão em `perfil.html`. | O rascunho local (`localStorage`) de `abertura.html` sobrescrevia o campo com o valor antigo do rascunho e `perfil.html` não invalidava o rascunho ao salvar. | Limpeza automática do rascunho de abertura ao salvar perfil, sincronização inteligente diferenciando preferência de personalização manual e restauração em blur de campo vazio. | **Resolvido** |
| **ERR-009** | 2026-09-30 | Backend / E-mail Transacional Brevo | Formato inválido de `EMAIL_FROM` (preenchido com hostname) e link de recuperação expondo porta interna. | Variável `EMAIL_FROM` configurada como `smtp-relay.brevo.com` em vez de e-mail de remetente verificado; falta de `APP_URL` para links via proxy reverso. | Correção de `EMAIL_FROM` no `.env` para e-mail verificado da conta, adição de `APP_URL=http://localhost`, suporte a porta 587/465 com timeouts no `mailer.js` e criação do script `test-email.js`. | **Resolvido** |
| **ERR-010** | 2026-09-30 | Backend / Autenticação & Brevo SMTP | E-mail de recuperação não recebido: desincronização de .env no container e falha de autenticação SMTP 535. | Container Docker não possuía montagem de `/app/.env` (mantendo variáveis antigas vazias) e `SMTP_USER` preenchido com e-mail pessoal em vez do Login técnico do Brevo. | Montagem de `./.env:/app/.env` e `./logs:/app/logs` no `docker-compose.yml`, reload com `override: true`, `nodemon.json`, detecção e logging de erros 535/550 no `mailer.js` e persistência em `logs/app-error.log`. | **Resolvido** |
| **ERR-011** | 2026-10-04 | Segurança / Backend & Frontend | Exposição de detalhes de erro em `/api/health`, ausência de security headers HTTP, ausência de error handler global no Express e sanitização XSS no frontend. | Detalhes de exceção bruta do Prisma/PostgreSQL eram retornados no JSON da rota `/health`; ausência de middleware para headers de proteção HTTP e sanitização client-side incompleta. | Ocultação de detalhes internos em `/health` com registro em `logs/app-error.log`, headers de segurança HTTP (`nosniff`, `SAMEORIGIN`, `nosniff`), error handler global 500/404, sanitização XSS via `CAC.escapeHtml` e auditoria de segurança em `logs/security.log`. | **Resolvido** |
| **ERR-012** | 2026-10-04 | Frontend / Histórico e Modal | Botão "Editar com Auditoria" inoperante em `registos.html`. | Comparação estrita de tipo (`r.id === id`), `z-index` baixo na modal (`100`) e ausência de delegação de eventos para elementos criados dinamicamente no DOM. | Atualizado `z-index` para `1000`, normalização de ID para string (`String(r.id).trim() === idBusca`), exportação explícita de `abrirModalEdicao`/`fecharModalEdicao` no `window`, adição de `data-action="editar"` com event delegation e suporte a tecla `Escape`. | **Resolvido** |

---

## 2. Detalhamento dos Casos Registrados

### Caso ERR-001: Acesso ao Socket do Docker no Sandbox
- **Contexto:** Ao tentar verificar o status dos containers (`docker compose ps`), o comando retornou erro de permissão negada no socket do Docker.
- **Impacto:** Comandos locais de CLI que dependem do daemon do Docker exigem bypass do sandbox quando executados pela IA, ou podem ser acionados diretamente pelo usuário no terminal.
- **Resolução:** As instruções e comandos foram padronizados no `AGENTS.md` e em `docs/PLANO.md` para uso direto com `docker compose`.

### Caso ERR-002: Dependência Nativa do Bcrypt
- **Contexto:** Durante os testes locais da Fase 3, o Node.js reportou ausência do binário nativo de binding do `bcrypt`.
- **Impacto:** Falha na inicialização do servidor ou nos testes unitários se os scripts de pós-instalação C++ forem bloqueados.
- **Resolução:** Substituição do `bcrypt` pelo `bcryptjs`, mantendo a mesma interface de chamadas (`hash`, `compare`) e o mesmo fator de trabalho (10 rounds), eliminando qualquer dependência de ferramentas de compilação C++ no SO.

### Caso ERR-003: Inconsistência Visual e Logout no Cabeçalho
- **Contexto:** Nas páginas `abertura.html`, `fecho.html` e `registos.html`, o ícone do logotipo da van/correios ficava desproporcionalmente grande, sobrepondo o conteúdo abaixo, e o botão de logout no topo direito não acionava a finalização da sessão.
- **Impacto:** Degradação da experiência visual e impossibilidade de realizar logout a partir do cabeçalho superior nessas páginas.
- **Resolução:** A estrutura do cabeçalho foi refatorada para seguir fielmente o padrão de `perfil.html` (`.app-header` com `.app-header-inner`, `.brand-title` em vermelho CTT, SVG com a classe `.icon` de 20x20px e botão `#btn-header-logout` acionando `CAC.logout()`), além de reforçar as regras no `custom.css`.

### Caso ERR-004: Validação de Quilometragem Não Nula no Fecho
- **Contexto:** No ecrã de fecho de turno (`fecho.html`), ao informar o Km Final com o mesmo valor do Km Inicial (ex: 123 e 123), o sistema aceitava o fecho com percurso de 0 km.
- **Impacto:** Possibilidade de registar fecho sem quilometragem percorrida no turno.
- **Resolução:** A validação foi reforçada em todas as camadas (backend em `src/utils/calculos.js` e frontend em `fecho.html` e `registos.html`), rejeitando qualquer valor onde `kmFinal <= kmInicial` e informando que o Km Final deve ser estritamente superior ao Km Inicial e que el percurso não pode ser zero. Foram adicionados testes unitários e de integração na suíte automatizada.

### Caso ERR-005: Campo de Data Bloqueado na Abertura de Turno
- **Contexto:** No ecrã de abertura de turno (`abertura.html`), o campo "Data de Operação" estava marcado com `disabled`, impedindo que o operador registasse turnos de dias passados que porventura tivessem ficado sem envio.
- **Impacto:** Impossibilidade de regularizar registos de dias anteriores.
- **Resolução:** O campo foi modificado para `<input type="date">` com valor padrão preenchido com a data atual e limite máximo de hoje. O script de frontend foi atualizado para despachar o parâmetro `dataRegisto` no corpo da requisição e reagir visualmente quando uma data anterior é escolhida, permitindo o registo retroativo. O backend teve a função `normalizarData` aprimorada para manipulação estritamente UTC de datas no formato `YYYY-MM-DD`.

### Caso ERR-006: Espaçamento entre Botão de Novo Turno e Filtros
- **Contexto:** Em `registos.html`, o botão "+ Novo Turno" estava visualmente muito próximo / colado aos botões de filtro de status ("Todos", "Fechados", "Abertos").
- **Impacto:** Percepção visual desconfortável na interface mobile e desktop.
- **Resolução:** Adicionado espaçamento visual sutil e equilibrado (~8px / ~2mm) entre a área do cabeçalho de ações e a linha de botões de filtro.

### Caso ERR-007: Formatação de Incidências Zeradas no Relatório WhatsApp
- **Contexto:** Na página de partilha `confirmar-whatsapp.html?id=32`, os campos de incidência sem ocorrências eram exibidos como `Qtd Avisados: **`.
- **Impacto:** Inconsistência na mensagem gerada, que deve exibir `*0*` para contagens zeradas.
- **Resolução:** A função `formatarIncidenciaValor` em `backend/src/utils/formatters.js` foi corrigida para retornar `*${val}*` para qualquer valor $\ge 0$ (formatando valores zerados ou ausentes como `*0*`). A suíte de testes `test-fase5.js` foi atualizada e executada com 100% de sucesso.

### Caso ERR-008: Desincronização de Matrícula Padrão entre Perfil e Abertura de Turno
- **Contexto:** Ao alterar a "Matrícula do Veículo Padrão" no ecrã de Perfil (`perfil.html`) e aceder à Abertura de Turno (`abertura.html`), o campo "Matrícula *" mantinha a matrícula antiga em vez de exibir a nova cadastrada no perfil. O operador notou que o campo só assumia a nova matrícula se apagasse o conteúdo do campo manualmente e recarregasse a página.
- **Impacto:** Experiência confusa para o operador, que precisava redigitar a matrícula habitual ou limpar o campo manualmente mesmo já a tendo atualizado no seu perfil.
- **Causa-Raiz:** 
  1. `perfil.html` não possuía o script `draft-storage.js` e não invalidava o rascunho local de `form-abertura` no `localStorage` após salvar as novas preferências.
  2. Ao aceder a `abertura.html`, o formulário pré-carregava a nova matrícula do perfil, mas em seguida o método `CACDraftStorage.conectar('form-abertura')` restaurava o valor do rascunho antigo salvo no navegador, sobrescrevendo a nova preferência.
  3. Não existia mecanismo para diferenciar quando o operador digitou deliberadamente uma viatura temporária diferente vs quando o campo apenas continha o padrão salvo anteriormente.
- **Resolução:**
  1. Em `perfil.html`, incluído `draft-storage.js` e adicionada chamada `CACDraftStorage.limpar('form-abertura')` imediatamente após a resposta de sucesso de atualização do perfil.
  2. Em `abertura.html`, o script foi refatorado para conectar o rascunho antes e verificar se houve customização manual (`customMatricula` / `customGiro`). Se o campo estiver vazio ou não for customizado, assume imediatamente as novas preferências do perfil.
  3. Adicionados listeners de `input` para marcar customização manual caso o operador digite uma viatura diferente, `blur` para repor automaticamente a matrícula/giro padrão se o campo for apagado, e suporte a `pageshow` para evitar cache obsoleto do navegador (bfcache).

### Caso ERR-009: Configuração de Remetente (EMAIL_FROM) e Resolução de URL para Brevo
- **Contexto:** Ao configurar o envio de e-mails transacionais com Brevo, o parâmetro `EMAIL_FROM` no `.env` foi inadvertidamente preenchido com o host do relay (`smtp-relay.brevo.com`) em vez de um endereço de e-mail de remetente validado, e o link de recuperação montava `http://localhost:3000/...` em vez de utilizar o roteamento do proxy reverso Nginx (`http://localhost/...`).
- **Impacto:** O provedor SMTP do Brevo rejeita envios onde o remetente não seja um e-mail válido e verificado com erro `550 Sender address not verified`, e os links gerados no e-mail apontariam para portas internas não expostas ao usuário final.
- **Resolução:**
  1. No `.env` e `.env.example`, o campo `EMAIL_FROM` foi devidamente documentado e configurado com um endereço de e-mail válido (`devfaleite@gmail.com`), e adicionada a variável `APP_URL=http://localhost`.
  2. Em `backend/src/config/index.js`, adicionado suporte a `APP_URL` e padrões otimizados para Brevo (porta 587 STARTTLS / 465 SSL).
  3. Em `backend/src/utils/mailer.js`, implementada detecção de porta segura, timeouts de conexão e a função `verificarConexaoSMTP()`.
  4. Criado script CLI de validação `backend/src/utils/test-email.js` para teste de conexão SMTP e disparo controlado de teste com retorno de Message ID.

### Caso ERR-010: E-mail de Recuperação Não Recebido e Diagnóstico de Falha SMTP Brevo
- **Contexto:** Ao solicitar a recuperação de palavra-passe em `http://localhost/recuperar-senha.html`, a tela informou sucesso aparente ("Se o e-mail existir na nossa base de dados, receberá as instruções em breve"), mas a mensagem nunca chegou à caixa de entrada do usuário.
- **Impacto:** Impossibilidade de recuperar acesso à conta do operador por e-mail no ambiente de desenvolvimento/produção.
- **Causa-Raiz:**
  1. *Desincronização do Docker:* Ao editar o `.env` no host macOS para inserir `SMTP_PASS`, o container Docker `cac_backend` não continha o arquivo montado e não havia sido recriado. Com isso, `config.email.pass` continuou vazio na memória do processo Node.js, acionando o fallback `[MAILER SIMULADO]` sem efetuar chamada à rede.
  2. *Autenticação SMTP Inválida (535):* Após reiniciar o container com a chave preenchida, o servidor do Brevo retornou `Invalid login: 535 5.7.8 Authentication failed`. Isso ocorreu porque o campo `SMTP_USER` foi preenchido com o e-mail de login pessoal (`devfaleite@gmail.com`), enquanto o Brevo exige o identificador técnico específico exibido no campo "Login" da aba *SMTP & API -> SMTP* (formato `1234567@smtp-brevo.com` ou login técnico equivalente).
  3. *Tratamento Silencioso:* O erro de disparo era registrado de forma genérica sem persistência estruturada em arquivo de log (`logs/app-error.log`).
- **Resolução:**
  1. No `docker-compose.yml`, adicionadas montagens de volume `- ./.env:/app/.env` e `- ./logs:/app/logs` para que alterações no `.env` e persistência de logs sejam sincronizadas em tempo real.
  2. Em `backend/src/config/index.js`, implementado `carregarDotenv()` com `override: true` e getters reativos com `.trim()`, garantindo que qualquer alteração no `.env` seja lida instantaneamente pelo backend sem espaços acidentais.
  3. Criado `backend/nodemon.json` monitorando `.env` para restart automático.
  4. Criado utilitário `backend/src/utils/logger.js` registrando falhas técnicas e exceções em `logs/app-error.log` com timestamp ISO e contexto.
  5. Atualizado `backend/src/utils/mailer.js` para usar `obterTransporter()` dinâmico, interceptar erros típicos do Brevo (códigos 535 e 550) e emitir diagnósticos orientativos detalhados.
### Caso ERR-011: Blindagem de Segurança, Headers HTTP e Sanitização Preventiva
- **Contexto:** Durante a revisão de segurança preventiva antes das fases analíticas, foram identificados pontos de melhoria: o endpoint `/api/health` retornava o `error.message` original em falhas do banco; faltavam headers de segurança HTTP contra sniffing e clickjacking; requisições a rotas não mapeadas na API podiam responder sem padronização; e valores interpolados dinamicamente no DOM podiam sofrer riscos de XSS.
- **Impacto:** Potencial vazamento de informações técnicas internas da infraestrutura (information disclosure) e exposição a vulnerabilidades de interface.
- **Resolução:**
  1. Em `backend/src/routes/index.js`, o endpoint `/api/health` foi blindado para retornar apenas mensagens amigáveis em caso de falha, registrando o stack trace real exclusivamente no arquivo `logs/app-error.log` via `logErro`.
  2. Em `backend/src/index.js`, adicionado middleware de headers HTTP de segurança (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin` e remoção de `X-Powered-By`), middleware para 404 em formato JSON e error handler global 500 integrado ao logger.
  3. Nos controladores `AuthController.js`, `PerfilController.js` e `RegistoDiarioController.js`, tentativas de acesso indevido (403) e falhas de autenticação agora são auditadas em `logs/security.log` via `logSeguranca()`.
  4. Em `frontend/public/js/app.js` e `frontend/public/registos.html`, implementada a função `CAC.escapeHtml()` com sanitização ativa dos dados dinâmicos renderizados na interface.

### Caso ERR-012: Falha na Abertura do Modal de Edição com Auditoria em registos.html
- **Contexto:** Ao acessar `http://localhost/registos.html` e clicar no botão "Editar com Auditoria" de um card de turno no histórico, o modal não era exibido na tela.
- **Impacto:** Impossibilidade do operador ou administrador realizar correções justificadas em turnos já gravados pela interface web.
- **Causa-Raiz:**
  1. *Colisão de CSS com Design System (opacity e visibility ocultas):* O arquivo `frontend/public/css/custom.css` define para `.modal-overlay` as propriedades `opacity: 0; visibility: hidden;`, tornando o elemento visível exclusivamente quando acompanhado da classe `.modal-overlay.active`. Como o script de `registos.html` apenas alterava `modal.style.display = 'flex'` sem adicionar a classe `.active`, o modal mantinha-se com `visibility: hidden` e `opacity: 0`, ficando 100% invisível ao usuário.
  2. *Comparação estrita de tipo no array de registos:* A busca `todosRegistos.find(r => r.id === id)` utilizava igualdade estrita (`===`). Dependendo do formato em que `r.id` chegava na resposta da API (número ou string), a comparação com a string do ID sanitizado falhava silenciosamente sem exibir o modal.
  3. *Cache estático do navegador sem cabeçalhos No-Cache:* O Nginx não enviava cabeçalhos de controle de cache (`Cache-Control: no-cache, no-store`), mantendo versões desatualizadas de scripts e páginas em memória nos navegadores.
  4. *Escopo de funções e renderização dinâmica:* Os botões gerados dinamicamente via `innerHTML` dependiam exclusivamente de manipuladores `onclick` inline que podiam falhar caso não estivessem garantidos no escopo global `window`.
- **Resolução:**
  1. Em `frontend/public/registos.html`, o script passou a adicionar e remover explicitamente a classe `.active` (`modal.classList.add('active')` e `modal.classList.remove('active')`), além de forçar `opacity: 1; visibility: visible;` inline e via regra explícita `.modal-overlay.active`.
  2. Em `frontend/public/css/custom.css`, o `z-index` de `.modal-overlay` foi elevado para `9999` para garantir sobreposição a todos os componentes de navegação.
  3. Em `frontend/nginx.conf`, adicionados os headers `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0`, `Pragma: no-cache` e `Expires: 0`, e configurada a montagem do volume no `docker-compose.yml`.
  4. A função `abrirModalEdicao(id, event)` foi transformada em assíncrona, com busca resiliente por string, fallback automático de consulta à API (`GET /api/registos/:id`) caso o item não esteja no estado local, e preenchimento seguro de todos os campos via `preencherCampo`.
  5. As funções `abrirModalEdicao` e `fecharModalEdicao` foram exportadas no escopo `window`.

---

## 3. Diretrizes para Registro de Novos Erros

Ao se deparar com qualquer erro ou comportamento inesperado:
1. Registre uma nova linha na tabela acima com ID sequencial (`ERR-002`, `ERR-003`, etc.).
2. Descreva a causa-raiz identificada e o caminho adotado para a resolução definitiva.
3. Se o erro for recorrente ou exigir cautela futura, documente uma observação no `AGENTS.md` ou no plano de implementação correspondente.
