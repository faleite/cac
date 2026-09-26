# Status do Projeto CAC Atividades

Arquivo vivo de acompanhamento contínuo do progresso, estado de cada fase e próximas atividades do sistema **CAC Atividades**.

---

## 1. Visão Geral do Progresso

| Fase | Descrição | Progresso | Status |
|:---:|---|:---:|:---:|
| **Fase 1** | Infraestrutura, Docker, Nginx e Estrutura Base | 100% | Concluída / Validada |
| **Fase 2** | Modelagem de Dados no Prisma, Migrations e PostgreSQL | 100% | Concluída / Validada |
| **Fase 3** | Autenticação, Sessão, Perfis e Recuperação de Senha | 0% | Próxima |
| **Fase 4** | Módulo Operador: Abertura, Fecho, Incidências e Rascunho | 0% | Pendente |
| **Fase 5** | Integração de Partilha e Comunicação com WhatsApp | 0% | Pendente |
| **Fase 6** | Dashboard de Indicadores, KPIs, Gráficos e Filtros | 0% | Pendente |
| **Fase 7** | Refinamento UI, Logs de Erro/Segurança e Homologação | 0% | Pendente |

**Progresso Geral Estimado:** ~28% (2 de 7 fases concluídas com validação técnica em banco)

---

## 2. Fase Concluída em Detalhe: Fase 2 (Modelagem de Dados e Migrations)

### Tarefas Concluídas
- [x] Adicionadas dependências `pg` e `bcrypt` no `backend/package.json`.
- [x] Modeladas todas as entidades do FSD no `backend/prisma/schema.prisma`:
  - `Usuario` (`usuarios`) com soft delete, perfis `operador`/`administrador` e tokens temporários.
  - `PerfilConfiguracao` (`perfis_configuracao`) com relação 1:1 e cascata para veículo e giro padrão.
  - `RegistoDiario` (`registos_diarios`) com contadores de incidências, métricas e constraint única por dia (`unq_usuario_data_registo`).
  - Índices compostos de alta performance: `idx_registos_usuario_data`, `idx_registos_data_status`, `idx_registos_usuario_status`.
  - `AuditoriaRegisto` (`auditoria_registos`) com campos `JSONB` e relação com usuário e turno.
  - `LogSeguranca` (`logs_seguranca`) para eventos críticos de segurança.
  - `AppSessao` (`app_sessoes`) com índice em `expire` para integração com `connect-pg-simple`.
- [x] Executada migration do Prisma (`20260926183316_init_cac_schema`) criando todas as tabelas, foreign keys e índices no PostgreSQL.
- [x] Gerado Prisma Client atualizado e singleton em `backend/src/database/prisma.js` com polyfill seguro para serialização JSON de BigInt.
- [x] Criado e executado script de seed idempotente (`backend/prisma/seed.js`) populando:
  - Administrador: `admin@cacatividades.pt` (SC-0001) com perfil `administrador`.
  - Operador: `fabricio@cacatividades.pt` (SC-2825) com perfil `operador` e veículo/giro padrão.
- [x] Validada integridade relacional, índices e operações no banco com script de teste automatizado (`backend/src/utils/test-db.js`).
- [x] Validado endpoint `/api/health` respondendo via Nginx com contagem ativa de registros do banco de dados.

---

## 3. Próxima Fase: Fase 3 (Autenticação, Sessão, Perfis e Recuperação de Senha)

### Próximos Passos
1. Instalar dependências adicionais no backend: `express-session`, `connect-pg-simple`, `nodemailer`.
2. Configurar middleware de sessão persistente no PostgreSQL (`connect-pg-simple` apontando para a tabela `app_sessoes`).
3. Implementar middlewares de autenticação (`auth.js`) e autorização RBAC (`rbac.js`).
4. Implementar `AuthController` (auto-registo com perfil restrito a operador, login por SC ou e-mail, logout, me, e recuperação de senha).
5. Implementar serviço de envio de e-mails de recuperação de senha com `Nodemailer`.
6. Implementar `PerfilController` para atualização de dados pessoais e preferências (veículo e giro padrão).
7. Criar as interfaces web correspondentes no frontend conforme o Design System *Postal Utility System*.

---

## 4. Histórico de Atualizações

| Data | Responsável | Ação Realizada |
|---|---|---|
| 2026-09-26 | Arquiteto de Software | Criação do `docs/PLANO.md`, `AGENTS.md`, `docs/STATUS.md` e `docs/ERROS.md`. Validação da Fase 1 (infraestrutura). |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 2: schema Prisma com 5 entidades + tabela de sessões, índices compostos, migration aplicada no PostgreSQL, seed idempotente com Admin e Operador, e teste automatizado de integridade. |
