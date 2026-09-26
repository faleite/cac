# Registro de Erros e Resoluções (ERROS.md)

Arquivo vivo para documentação de erros técnicos, anomalias, problemas de ambiente ou inconsistências identificadas durante o desenvolvimento e execução do sistema **CAC Atividades**, acompanhados de causa-raiz e solução aplicada.

---

## 1. Tabela de Ocorrências

| ID | Data | Módulo / Componente | Descrição da Ocorrência | Causa-Raiz | Solução / Contramedida Adotada | Status |
|:---:|:---:|---|---|---|---|:---:|
| **ERR-001** | 2026-09-26 | Docker / Ambiente | Conexão com o socket do Docker (`unix:///Users/.../.docker/run/docker.sock`) restrita pelo sandbox de execução de comandos. | O agente opera em sandbox seguro que bloqueia acesso direto a sockets Unix fora do workspace sem elevação de permissão. | Operações de subida/execução no Docker que necessitarem de bypass devem ser aprovadas pelo usuário ou os comandos devem ser documentados para execução manual/assistida. | **Mitigado** |

---

## 2. Detalhamento dos Casos Registrados

### Caso ERR-001: Acesso ao Socket do Docker no Sandbox
- **Contexto:** Ao tentar verificar o status dos containers (`docker compose ps`), o comando retornou erro de permissão negada no socket do Docker.
- **Impacto:** Comandos locais de CLI que dependem do daemon do Docker exigem bypass do sandbox quando executados pela IA, ou podem ser acionados diretamente pelo usuário no terminal.
- **Resolução:** As instruções e comandos foram padronizados no `AGENTS.md` e em `docs/PLANO.md` para uso direto com `docker compose`.

---

## 3. Diretrizes para Registro de Novos Erros

Ao se deparar com qualquer erro ou comportamento inesperado:
1. Registre uma nova linha na tabela acima com ID sequencial (`ERR-002`, `ERR-003`, etc.).
2. Descreva a causa-raiz identificada e o caminho adotado para a resolução definitiva.
3. Se o erro for recorrente ou exigir cautela futura, documente uma observação no `AGENTS.md` ou no plano de implementação correspondente.
