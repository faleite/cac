# Status do Projeto CAC Atividades

Arquivo vivo de acompanhamento contínuo do progresso, estado de cada fase e próximas atividades do sistema **CAC Atividades**.

---

## 1. Visão Geral do Progresso

| Fase | Descrição | Progresso | Status |
|:---:|---|:---:|:---:|
| **Fase 1** | Infraestrutura, Docker, Nginx e Estrutura Base | 95% | Em Validação / Finalização |
| **Fase 2** | Modelagem de Dados no Prisma, Migrations e PostgreSQL | 0% | Próxima |
| **Fase 3** | Autenticação, Sessão, Perfis e Recuperação de Senha | 0% | Pendente |
| **Fase 4** | Módulo Operador: Abertura, Fecho, Incidências e Rascunho | 0% | Pendente |
| **Fase 5** | Integração de Partilha e Comunicação com WhatsApp | 0% | Pendente |
| **Fase 6** | Dashboard de Indicadores, KPIs, Gráficos e Filtros | 0% | Pendente |
| **Fase 7** | Refinamento UI, Logs de Erro/Segurança e Homologação | 0% | Pendente |

**Progresso Geral Estimado:** ~14% (Fase 1 adiantada e estruturada)

---

## 2. Fase Atual em Detalhe: Fase 1 (Infraestrutura e Base)

### Tarefas Concluídas
- [x] Configuração dos containers no `docker-compose.yml` (`cac_db`, `cac_backend`, `nginx_frontend`).
- [x] Criação do `backend/Dockerfile` (Node 20 Alpine, OpenSSL, nodemon).
- [x] Criação do `frontend/Dockerfile` e `frontend/nginx.conf` (Proxy Reverso `/api/` e arquivos estáticos).
- [x] Criação do `docs/PLANO.md` com as 7 fases detalhadas de construção.
- [x] Criação do `AGENTS.md` na raiz com regras de contexto, segurança, UI e protocolo vivo.
- [x] Criação dos arquivos vivos `docs/STATUS.md` e `docs/ERROS.md`.

### Tarefas em Andamento / Imediatas
- [ ] Validação do arquivo `.env` e criação de `.env.example` documentando variáveis adicionais (`SESSION_SECRET`, `NODE_ENV`, parâmetros SMTP).
- [ ] Ajuste no `docker-compose.yml` para injetar `env_file: .env` no backend.
- [ ] Criação das pastas estruturais no backend (`src/config/`, `src/controllers/`, `src/middlewares/`, `src/routes/`, `src/utils/`) e frontend (`public/css/`, `public/js/`, `public/images/`).

---

## 3. Próxima Fase: Fase 2 (Modelagem de Dados no Prisma)

### Próximos Passos
1. Atualizar `backend/prisma/schema.prisma` com todas as 5 entidades do FSD (`Usuario`, `PerfilConfiguracao`, `RegistoDiario`, `AuditoriaRegisto`, `LogSeguranca`) e a tabela de sessões `app_sessoes`.
2. Configurar índices de busca rápida (`idx_registos_usuario_data`, `idx_registos_data_status`, `idx_registos_usuario_status`, `idx_auditoria_registo`).
3. Executar a primeira migration oficial do Prisma (`npm run prisma:migrate`).
4. Criar o seed inicial com o usuário administrador padrão.

---

## 4. Histórico de Atualizações

| Data | Responsável | Ação Realizada |
|---|---|---|
| 2026-09-26 | Arquiteto de Software | Criação do `docs/PLANO.md`, `AGENTS.md`, `docs/STATUS.md` e `docs/ERROS.md`. Análise do FSD e alinhamento com a base Docker/Prisma/Nginx existente. |
