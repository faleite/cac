# Status do Projeto CAC Atividades

Arquivo vivo de acompanhamento contínuo do progresso, estado de cada fase e próximas atividades do sistema **CAC Atividades**.

---

## 1. Visão Geral do Progresso

| Fase | Descrição | Progresso | Status |
|:---:|---|:---:|:---:|
| **Fase 1** | Infraestrutura, Docker, Nginx e Estrutura Base | 100% | Concluída / Validada |
| **Fase 2** | Modelagem de Dados no Prisma, Migrations e PostgreSQL | 100% | Concluída / Validada |
| **Fase 3** | Autenticação, Sessão, Perfis e Recuperação de Senha | 100% | Concluída / Validada |
| **Fase 4** | Módulo Operador: Abertura, Fecho, Incidências e Rascunho | 0% | Próxima |
| **Fase 5** | Integração de Partilha e Comunicação com WhatsApp | 0% | Pendente |
| **Fase 6** | Dashboard de Indicadores, KPIs, Gráficos e Filtros | 0% | Pendente |
| **Fase 7** | Refinamento UI, Logs de Erro/Segurança e Homologação | 0% | Pendente |

**Progresso Geral Estimado:** ~43% (3 de 7 fases concluídas e validadas ponta a ponta)

---

## 2. Fase Concluída em Detalhe: Fase 3 (Autenticação, Sessão, Perfis e Recuperação de Senha)

### Tarefas Concluídas
- [x] Instaladas dependências de autenticação, sessão e mensageria no backend: `express-session`, `connect-pg-simple`, `nodemailer`, `bcryptjs`.
- [x] Configurado armazenamento de sessões persistentes no PostgreSQL via `connect-pg-simple` apontando para a tabela `app_sessoes` com cookies seguros (`cac_session_id`, `httpOnly: true`, `sameSite: 'lax'`, expiração de 8h).
- [x] Criado utilitário de e-mail com `Nodemailer` (`backend/src/utils/mailer.js`) para recuperação de palavra-passe com template HTML institucional no padrão Postal CTT.
- [x] Implementados middlewares de segurança:
  - `backend/src/middlewares/auth.js`: Verificação de autenticação de sessão com suporte a respostas JSON (401) e redirecionamento (302).
  - `backend/src/middlewares/rbac.js`: Controle de acesso baseado em papéis (`administrador`/`operador`).
- [x] Implementado `AuthController` (`backend/src/controllers/AuthController.js`):
  - `POST /api/auth/registo`: Auto-registo forçando impreterivelmente o perfil `operador`, criação de hash bcrypt seguro (10 rounds), criação atômica do perfil de preferências e início de sessão.
  - `POST /api/auth/login`: Autenticação flexível por Número SC ou E-mail com proteção anti-enumeração.
  - `POST /api/auth/logout`: Destruição da sessão no PostgreSQL e limpeza do cookie no cliente.
  - `GET /api/auth/me`: Retorno dos dados do usuário autenticado e preferências vinculadas.
  - `POST /api/auth/recuperar-senha`: Geração de token criptográfico de 1 hora com resposta neutra anti-enumeração.
  - `POST /api/auth/redefinir-senha`: Validação de token e expiração, atualização segura de senha com bcrypt.
- [x] Implementado `PerfilController` (`backend/src/controllers/PerfilController.js`):
  - `GET /api/perfil`: Consulta de dados pessoais e preferências operacionais.
  - `PUT /api/perfil`: Atualização atômica de nome, telemóvel, matrícula habitual, código de giro e troca de senha.
- [x] Desenvolvido Design System CSS local sem CDNs (`frontend/public/css/custom.css`):
  - Paleta Postal CTT (`#a8001c`, `#d3122a`, `#ffe6e4`), fontes seguras Inter, ergonomia para mobile-first (inputs $\ge 56\text{px}$, botões $\ge 48\text{px}$, bordas arredondadas de 8px).
- [x] Construídas interfaces web funcionais:
  - `frontend/public/login.html`: Tela de login com alternância de visibilidade de senha e feedback.
  - `frontend/public/registo.html`: Tela de auto-registo de colaboradores.
  - `frontend/public/recuperar-senha.html`: Solicitação de link de recuperação por e-mail.
  - `frontend/public/redefinir-senha.html`: Formulário de definição de nova palavra-passe com token da URL.
  - `frontend/public/perfil.html`: Gestão de perfil e preferências habituais com navegação inferior (*BottomNav*).
  - `frontend/public/index.html`: Roteamento inteligente baseado no status da sessão.
- [x] Desenvolvido utilitário client-side `frontend/public/js/app.js` para integração HTTP, alertas e autenticação.
- [x] Criado e executado script de testes automatizados (`backend/src/utils/test-fase3.js`) com 21 asserções cobrindo todos os cenários da fase (100% aprovados).
- [x] Reconstruídos containers Docker e validados endpoints e páginas através do Nginx (porta 80).

---

## 3. Próxima Fase: Fase 4 (Módulo Operador: Abertura, Fecho, Incidências e Rascunho)

### Próximos Passos
1. Implementar `RegistoController` com endpoints de abertura de turno (Km Inicial, matrícula, giro com preenchimento automático das preferências), validações de consistência e regra de turno único diário por colaborador.
2. Implementar endpoint de fecho de turno com contadores de objetos entregues, falhas por tipo de incidência, Km Final, cálculo automático de Km Percorridos e validação $Km_{final} \ge Km_{inicial}$.
3. Implementar contingência de rascunho de digitação no cliente com `draft-storage.js` e `localStorage`.
4. Construir as telas `abertura.html` e `fecho.html` com controles ergonômicos (+/-) e teclado numérico amigável.

---

## 4. Histórico de Atualizações

| Data | Responsável | Ação Realizada |
|---|---|---|
| 2026-09-26 | Arquiteto de Software | Criação do `docs/PLANO.md`, `AGENTS.md`, `docs/STATUS.md` e `docs/ERROS.md`. Validação da Fase 1 (infraestrutura). |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 2: schema Prisma com 5 entidades + tabela de sessões, índices compostos, migration aplicada no PostgreSQL, seed idempotente com Admin e Operador, e teste automatizado de integridade. |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 3: autenticação com sessões persistentes em PostgreSQL, RBAC, recuperação de senha com tokens criptográficos, gestão de perfis e preferências, Design System CSS local e 5 telas web funcionais testadas ponta a ponta. |
