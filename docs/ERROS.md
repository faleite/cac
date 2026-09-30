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

---

## 3. Diretrizes para Registro de Novos Erros

Ao se deparar com qualquer erro ou comportamento inesperado:
1. Registre uma nova linha na tabela acima com ID sequencial (`ERR-002`, `ERR-003`, etc.).
2. Descreva a causa-raiz identificada e o caminho adotado para a resolução definitiva.
3. Se o erro for recorrente ou exigir cautela futura, documente uma observação no `AGENTS.md` ou no plano de implementação correspondente.
