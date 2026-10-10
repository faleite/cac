# Status do Projeto CAC Atividades

Arquivo vivo de acompanhamento contínuo do progresso, estado de cada fase e próximas atividades do sistema **CAC Atividades**.

---

## 1. Visão Geral do Progresso

| Fase | Descrição | Progresso | Status |
|:---:|---|:---:|:---:|
| **Fase 1** | Infraestrutura, Docker, Nginx e Estrutura Base | 100% | Concluída / Validada |
| **Fase 2** | Modelagem de Dados no Prisma, Migrations e PostgreSQL | 100% | Concluída / Validada |
| **Fase 3** | Autenticação, Sessão, Perfis e Recuperação de Senha | 100% | Concluída / Validada |
| **Fase 4** | Módulo Operador: Abertura, Fecho, Incidências e Rascunho | 100% | Concluída / Validada |
| **Fase 5** | Integração de Partilha e Comunicação com WhatsApp | 100% | Concluída / Validada |
| **Fase 6** | Dashboard de Indicadores, KPIs, Gráficos e Filtros | 0% | Próxima |
| **Fase 7** | Refinamento UI, Logs de Erro/Segurança e Homologação | 0% | Pendente |

**Progresso Geral Estimado:** ~71% (5 de 7 fases concluídas e validadas ponta a ponta)

---

## 2. Fase Concluída em Detalhe: Fase 5 (Integração de Partilha e Comunicação com WhatsApp)

### Tarefas Concluídas
- [x] Criado utilitário de formatação de mensagens `backend/src/utils/formatters.js`:
  - `formatarDataPostal(data)`: Formatação estrita DD/MM/YYYY.
  - `formatarIncidenciaValor(qtd)`: Formatação no padrão postal CTT (`*N*` se $N > 0$, ou `**` se $0$ ou nulo).
  - `gerarMensagemWhatsapp(registo)`: Geração do relatório no formato oficial com blocos `*Início*` e `*Final*`, rótulos exatos ("Qtd Objectos"), matrícula, giro, km inicial e final, e as 5 incidências detalhadas.
- [x] Criado endpoint backend `GET /api/registos/:id/whatsapp-preview` em `RegistoDiarioController.js` e roteado em `registos.routes.js`:
  - Retorna o texto formatado e a URL profunda `whatsappUrl` (`https://wa.me/?text=...`).
  - Protegido por autenticação e RBAC (operador só visualiza o relatório de seu próprio turno; administrador possui autorização de auditoria).
- [x] Desenvolvida tela de confirmação e partilha `frontend/public/confirmar-whatsapp.html`:
  - Design System CTT *Postal Utility System* (CSS local sem CDNs).
  - Card de pré-visualização textual do relatório formatado.
  - Botão de ação verde WhatsApp de 1-clique (`https://wa.me/?text=...`).
  - Botão "Copiar Texto" com API nativa Clipboard e fallback de seleção automática com alerta visual de sucesso.
- [x] Criado script client-side `frontend/public/js/whatsapp-share.js` para manipulação de eventos e cópia rápida.
- [x] Atualizado fluxo pós-fechamento em `frontend/public/fecho.html` para redirecionamento automático direto para `/confirmar-whatsapp.html?id=:id`.
- [x] Desenvolvida e executada suíte de testes automatizados `backend/src/utils/test-fase5.js` com testes unitários de formatação e testes de integração de API/RBAC (100% aprovados).
- [x] Executadas as suítes de testes anteriores (`test-fase3.js` e `test-fase4.js`) garantindo zero regressões.
- [x] **Conformidade Básica com RGPD**:
  - [x] Adicionados campos de auditoria de consentimento (`termosAceitosEm`, `termosVersao`) no schema Prisma e migração `add_rgpd_termos_aceite` executada.
  - [x] Validação estrita de consentimento obrigatório no auto-registo (`/api/auth/registo`) com bloqueio de submissão sem aceite.
  - [x] Checkbox de consentimento desmarcada por padrão em `registo.html` com reatividade no botão de submissão e links para os Termos de Uso e Política de Privacidade.
  - [x] Criação da página estática `termos-privacidade.html` no *Postal Utility System*.
  - [x] Implementação do Direito ao Esquecimento: rota `DELETE /api/perfil/conta` com transação atômica de deleção definitiva (auditorias, registos de turnos, perfil, anonimização de logs e exclusão do usuário), modal interativo com confirmação por senha em `perfil.html`.
- [x] **Refatoração Crítica: Separação de Nome Completo em Primeiro e Último Nome (Zero Data Loss)**:
  - [x] Migração de banco de dados `20261010143500_split_nome_completo`: criação das colunas `primeiro_nome` e `ultimo_nome`, migração de dados sem perda com `SPLIT_PART` e `SUBSTRING`, conversão para `NOT NULL` e `DROP COLUMN nome_completo`.
  - [x] Atualização do `schema.prisma` e regeneração do Prisma Client (`npx prisma generate`).
  - [x] Atualização de `seed.js` para popular `primeiroNome` e `ultimoNome`.
  - [x] Atualização de `AuthController.js` (registo, login, me, recuperação), `PerfilController.js` (obter e atualizar perfil) e `RegistoDiarioController.js` (listagem, whatsapp-preview, etc.).
  - [x] Atualização de `formatters.js` para compor o nome no relatório WhatsApp com `${primeiroNome} ${ultimoNome}`.
  - [x] Telas `frontend/public/registo.html` e `frontend/public/perfil.html` adaptadas com campos individuais "Primeiro Nome" e "Último Nome", mantendo ergonomia de altura mínima de 56px e grid responsivo.
  - [x] Restrição estrita de palavra única: campos "Primeiro Nome" e "Último Nome" rejeitam termos compostos com espaços tanto no frontend quanto no backend com validação por regex (`^[A-Za-zÀ-ÖØ-öø-ÿ'-]+$`).
  - [x] Correção de workflow e deploy: regeneração do Prisma Client e reinicialização automática do backend adicionadas ao script `deploy.yml` e `package.json`, eliminando o erro HTTP 500 no login pós-migração.
  - [x] Preservação reativa da saudação de barra de navegação e avatar (`primeiroNome` / `nome`).
  - [x] **Inclusão de Matrícula e Giro Padrão no Auto-Registo (`registo.html`)**:
    - [x] Campos opcionais "Matrícula do Veículo Padrão" e "Código do Giro / Rota Padrão" adicionados ao formulário de cadastro em grid de 2 colunas responsivo, com altura de 56px e caixa alta (`text-transform: uppercase`).
    - [x] Persistência atômica via transação Prisma em `AuthController.js`, populando `perfilConfiguracao` no momento da criação da conta.
    - [x] Redirecionamento pós-registo ajustado diretamente para a tela de abertura de turno (`abertura.html`).
    - [x] Suíte de testes automatizados `test-fase3.js` atualizada para validar persistência e sanitização em maiúsculas de ambos os campos.
  - [x] Atualização e aprovação de 100% dos testes automatizados (`test-fase3.js`, `test-fase4.js`, `test-fase5.js`, `test-rgpd.js`, `test-db.js`).

---

## 3. Próxima Fase: Fase 6 (Dashboard de Indicadores, KPIs, Gráficos e Filtros)

### Próximos Passos
1. Implementar controller e rotas de agregação de KPIs em `backend/src/controllers/DashboardController.js`:
   - Média de eficiência de entregas.
   - Total de km percorridos no período.
   - Total de objetos distribuídos e total de incidências por categoria.
2. Criar biblioteca/utilitário local de gráficos client-side em `frontend/public/js/` (sem CDNs externas).
3. Construir interface `frontend/public/dashboard.html` com filtros por período (hoje, semana, mês, personalizado) e cartões informativos.
4. Elaborar testes automatizados de agregação de dados do dashboard.

---

## 4. Histórico de Atualizações

| Data | Responsável | Ação Realizada |
|---|---|---|
| 2026-09-26 | Arquiteto de Software | Criação do `docs/PLANO.md`, `AGENTS.md`, `docs/STATUS.md` e `docs/ERROS.md`. Validação da Fase 1 (infraestrutura). |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 2: schema Prisma com 5 entidades + tabela de sessões, índices compostos, migration aplicada no PostgreSQL, seed idempotente com Admin e Operador, e teste automatizado de integridade. |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 3: autenticação com sessões persistentes em PostgreSQL, RBAC, recuperação de senha com tokens criptográficos, gestão de perfis e preferências, Design System CSS local e 5 telas web funcionais testadas ponta a ponta. |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 4: módulo operador (abertura e fecho de turnos), contadores das 5 incidências, regras matemáticas estritas, auditoria JSONB atômica, persistência de rascunho local em localStorage e 25 testes automatizados aprovados. |
| 2026-09-29 | Desenvolvedor Sênior | Implementação completa da Fase 5: utilitário `formatters.js`, endpoint `GET /api/registos/:id/whatsapp-preview`, página `confirmar-whatsapp.html`, script `whatsapp-share.js`, redirecionamento pós-fecho e suíte de testes `test-fase5.js` 100% aprovada. |
| 2026-09-30 | Desenvolvedor Sênior | Configuração e implementação do envio de token de recuperação de senha via Brevo (SMTP Relay): padronização do `mailer.js` com timeouts e porta 587 STARTTLS / 465 SSL, parametrização de `APP_URL`, criação do CLI de diagnóstico `test-email.js`, atualização do `.env` e `.env.example`, e validação ponta a ponta sem quebras no fluxo de autenticação. |
| 2026-09-30 | Desenvolvedor Sênior | Resolução de não recebimento de e-mail (ERR-010): montagem de volumes `.env` e `logs` no Docker, sincronização em tempo real com `override: true`, `nodemon.json`, criação de `logger.js` com escrita em `logs/app-error.log` e diagnóstico contextual para erro 535 de autenticação Brevo. |
| 2026-10-01 | UI/UX Designer & Dev | Inclusão do botão de partilha de turno via WhatsApp (`/confirmar-whatsapp.html?id=:id`) lado a lado com o botão 'Editar com Auditoria' em `registos.html` e adição da classe de estilo `.btn-whatsapp-sm` em `custom.css`, preservando dimensões e estrutura visual dos cartões de turno. |
| 2026-10-03 | Desenvolvedor & SecOps | Implementação de conformidade com o RGPD: campos `termosAceitosEm` e `termosVersao`, bloqueio de auto-registo sem consentimento ativo, links para `termos-privacidade.html`, caixa de aceite reativa em `registo.html`, rota `DELETE /api/perfil/conta` com transação de limpeza integral (Direito ao Esquecimento), modal com senha em `perfil.html` e suíte de testes `test-rgpd.js` 100% aprovada. |
| 2026-10-04 | Especialista em Segurança Web | Execução de Revisão de Segurança Parcial (Fases 1 a 5): blindagem do endpoint `/api/health` ocultando dados internos de erro, inclusão de headers de proteção HTTP (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`), tratamento global de rotas 404 e erros 500 sem vazamento de stack traces, sanitização contra XSS no frontend (`CAC.escapeHtml`), padronização de persistência em `logs/app-error.log` via `logErro` e registro de tentativas indevidas em `logs/security.log` via `logSeguranca`. Suítes de testes 100% aprovadas. |
| 2026-10-05 | Especialista DevOps / SecOps | Configuração da esteira de deploy manual para a Oracle Cloud (OCI): criação do workflow `.github/workflows/deploy.yml` (`workflow_dispatch`), blindagem de imagens com `.dockerignore`, script não interativo `prisma migrate deploy`, mapeamento seguro de portas (PostgreSQL em `127.0.0.1` e Nginx em `80` e `443`), template de produção Nginx com SSL (`nginx.prod.conf`) e guia de provisionamento com Certbot/Let's Encrypt. |
| 2026-10-06 | Especialista DevOps / SecOps | Configuração de deploy contínuo automático no GitHub Actions: adição do gatilho `push` na branch `main` em `.github/workflows/deploy.yml` mantendo o gatilho manual `workflow_dispatch`, viabilizando o fluxo de desenvolvimento em branch `dev` e publicação automatizada ao fazer merge/push na `main`. |
| 2026-10-10 | Desenvolvedor Frontend | Ajuste no fluxo de navegação pós-autenticação em `login.html`: redirecionamento alterado de `perfil.html` para `abertura.html` (tanto no retorno de login bem-sucedido quanto na verificação de sessão ativa pré-existente). |

