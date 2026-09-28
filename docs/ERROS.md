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
- **Resolução:** A validação foi reforçada em todas as camadas (backend em `src/utils/calculos.js` e frontend em `fecho.html` e `registos.html`), rejeitando qualquer valor onde `kmFinal <= kmInicial` e informando que o Km Final deve ser estritamente superior ao Km Inicial e que o percurso não pode ser zero. Foram adicionados testes unitários e de integração na suíte automatizada.

---

## 3. Diretrizes para Registro de Novos Erros

Ao se deparar com qualquer erro ou comportamento inesperado:
1. Registre uma nova linha na tabela acima com ID sequencial (`ERR-002`, `ERR-003`, etc.).
2. Descreva a causa-raiz identificada e o caminho adotado para a resolução definitiva.
3. Se o erro for recorrente ou exigir cautela futura, documente uma observação no `AGENTS.md` ou no plano de implementação correspondente.
