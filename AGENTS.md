# Guia de Orientação para Agentes de IA - CAC Atividades

Este arquivo é a fonte primária de instruções e contexto operacional para qualquer agente de IA trabalhando no repositório **CAC Atividades** (Controlo Atividades Correios).

---

## 1. Idioma Obrigatório
- Todas as respostas, mensagens ao usuário, logs e documentações devem ser gerados **sempre em português do Brasil (pt-BR)**.

---

## 2. Stack Tecnológica e Arquitetura

O sistema é construído sobre uma arquitetura MVC e API REST com assets locais, conteinerizada em Docker:

- **Orquestração e Containers:** Docker e Docker Compose (`docker-compose.yml`).
- **Banco de Dados:** PostgreSQL 16 Alpine com persistência via volume Docker (`cac_postgres_data`).
- **Backend:** Node.js (v20 Alpine), Express.js, Prisma ORM (`@prisma/client`, `prisma`).
- **Proxy Reverso e Servidor Web:** Nginx Alpine atuando como servidor de arquivos estáticos e proxy reverso para a API Express (`/api/` -> `http://backend:3000`).
- **Autenticação e Sessão:** `express-session` com armazenamento persistente em PostgreSQL via `connect-pg-simple` (tabela `app_sessoes`), criptografia de senhas com `bcrypt` (10 rounds).
- **Envio de E-mails:** `Nodemailer` para recuperação de senhas via SMTP.
- **Frontend:** HTML5, CSS3, JavaScript Vanilla (ES6+), Bootstrap local estruturado conforme o Design System, sem dependência de CDNs externas.

---

## 3. Estrutura de Pastas do Projeto

Todos os caminhos abaixo são relativos à raiz do repositório:

```text
.
├── .env                     # Variáveis de ambiente locais (PostgreSQL, Portas, Sessão, SMTP)
├── .env.example             # Modelo documentado das variáveis de ambiente
├── docker-compose.yml       # Orquestração dos serviços db, backend e frontend
├── AGENTS.md                # Instruções de contexto para agentes de IA (este arquivo)
│
├── backend/                 # Aplicação Backend Node.js
│   ├── Dockerfile           # Imagem Node 20 Alpine com OpenSSL e hot-reload (nodemon)
│   ├── package.json         # Dependências do backend e scripts de execução/migrations
│   ├── prisma/
│   │   ├── schema.prisma    # Esquema relacional das entidades e migrações
│   │   └── seed.js          # Script para população inicial de dados e admin
│   └── src/
│       ├── index.js         # Ponto de entrada da aplicação Express
│       ├── config/          # Configurações centrais (ambiente, banco, sessão, mailer)
│       ├── controllers/     # Controladores HTTP (Auth, Perfil, Registos, Dashboard)
│       ├── middlewares/     # Middlewares de segurança (auth.js, rbac.js, sanitização)
│       ├── routes/          # Definição e agrupamento de rotas da API
│       └── utils/           # Utilitários (logger.js, formatters.js, calculos.js, mailer.js)
│
├── frontend/                # Serviço Web e Proxy Nginx
│   ├── Dockerfile           # Imagem Nginx Alpine
│   ├── nginx.conf           # Configuração de Proxy Reverso (/api/) e estáticos (/)
│   └── public/              # Arquivos públicos servidos diretamente pelo Nginx
│       ├── index.html       # Página inicial / Redirecionamento
│       ├── login.html       # Tela de login
│       ├── registo.html     # Tela de auto-registo
│       ├── abertura.html    # Tela de abertura de turno (Km Inicial)
│       ├── fecho.html       # Tela de fecho de turno (Km Final + Incidências)
│       ├── dashboard.html   # Tela de dashboard e KPIs
│       ├── perfil.html      # Tela de configurações de perfil
│       ├── css/             # Folhas de estilo (bootstrap local e custom.css)
│       └── js/              # Scripts client-side (draft-storage.js, app.js, chart local)
│
├── docs/                    # Documentação técnica e funcional de referência
│   ├── FSD.md               # Especificação Funcional e Técnica completa (Fonte de Verdade)
│   ├── DESIGN.md            # Especificação do Design System (Postal Utility System)
│   ├── INSUMOS.md           # Inventário de insumos, protótipos e telas
│   ├── PLANO.md             # Plano de construção incremental das 7 fases
│   ├── STATUS.md            # Arquivo vivo de acompanhamento de estado e progresso
│   ├── ERROS.md             # Arquivo vivo de registro de erros e resoluções
│   └── extras/              # Modelos oficiais de mensagem e protótipos de design
│
└── logs/                    # Arquivos de log gerados fora do acesso web público
    ├── app-error.log        # Registro de erros de execução da aplicação
    └── security.log         # Registro de eventos e auditoria de segurança
```

---

## 4. Comandos Principais

Todos os comandos devem ser executados a partir da raiz do projeto:

| Ação | Comando |
|---|---|
| Iniciar todos os serviços em segundo plano | `docker compose up -d` |
| Iniciar com reconstrução das imagens | `docker compose up -d --build` |
| Parar todos os serviços | `docker compose down` |
| Visualizar status dos containers | `docker compose ps` |
| Acompanhar logs em tempo real (todos) | `docker compose logs -f` |
| Acompanhar logs do backend | `docker compose logs -f backend` |
| Executar migrations do Prisma no backend | `docker compose exec backend npm run prisma:migrate` |
| Gerar Prisma Client no backend | `docker compose exec backend npm run prisma:generate` |
| Popular banco com seed inicial | `docker compose exec backend node prisma/seed.js` |
| Acessar shell dentro do container backend | `docker compose exec backend sh` |
| Acessar PostgreSQL via psql no container db | `docker compose exec db psql -U devuser -d appdb` |

---

## 5. Regras de Segurança e Boas Práticas

1. **Proteção de Dados e Consultas Parametrizadas:**
   - Todas as operações com banco de dados devem utilizar o Prisma Client ou consultas SQL estritamente parametrizadas, prevenindo SQL Injection.
2. **Criptografia de Senhas:**
   - Senhas devem ser salvas exclusivamente com hash seguro gerado via `bcrypt` com salt de no mínimo 10 rounds.
3. **Isolamento de Sessão e Cookies:**
   - Cookies de sessão (`cac_session_id`) devem ser configurados com `httpOnly: true`, `sameSite: 'lax'` e persistidos na tabela `app_sessoes`.
4. **Isolamento de Dados por Perfil (RBAC):**
   - Usuários com perfil `operador` devem ter consultas filtradas obrigatoriamente por `usuario_id = req.session.usuario.id`.
   - Rotas de edição de turnos de terceiros ou filtros consolidados exigem `req.session.usuario.perfil === 'administrador'`.
5. **Auto-Elevação Bloqueada:**
   - O auto-registo de usuários deve atribuir impreterivelmente o perfil `operador`, ignorando qualquer tentativa de injetar `perfil: 'administrador'` no payload.
6. **Sanitização e XSS:**
   - Todo dado recebido do cliente deve ser validado e sanitizado antes da persistência e renderização.
7. **Tratamento de Erros Silencioso:**
   - Em produção, stack traces e mensagens técnicas de banco de dados não devem ser expostos ao usuário. Erros devem ser capturados e registrados em `logs/app-error.log`.
   - Se o banco de dados falhar, o sistema deve registrar a falha em arquivo local (`logs/app-error.log`) como mecanismo de contingência.

---

## 6. Diretrizes de Interface (Design System)

Seguir rigorosamente o especificado em `docs/DESIGN.md` (*Postal Utility System*):

- **Paleta de Cores:**
  - Primária (Ações principais / Identidade Postal): CTT Red (`#a8001c`, variações `#d3122a` e `#ffe6e4`).
  - Superfície e Fundo: `#f9f9f9` (fundo neutro) e `#ffffff` (cartões/cards interativos).
  - Texto e Ícones: `#1a1c1c` (on-surface) e `#5f5e5e` (secundário).
  - Sucesso / Concluído: Verde CTT (`#066018`).
  - Alerta / Erro: Vermelho Erro (`#ba1a1a`).
- **Tipografia:** Fonte **Inter**, legível e estruturada para ambientes dinâmicos de entrega.
- **Ergonomia e Mobile-First:**
  - Aplicação otimizada primariamente para telemóveis, expandindo até no máximo 768px de largura centralizada em desktops.
  - **Inputs:** Altura mínima de 56px com rótulo (*label*) persistente no topo.
  - **Alvos de Toque:** Botões e elementos clicáveis com área mínima de 48px x 48px.
  - **Cantos Arredondados:** Raio padrão de 8px (0.5rem).
- **Sem Dependência de CDNs:**
  - Todos os arquivos CSS (Bootstrap, Custom) e JS (Bootstrap bundle, charts, utilitários) devem residir localmente em `frontend/public/css/` e `frontend/public/js/`.
- **Rascunho de Digitação:**
  - Campos numéricos e formulários de turno devem persistir o rascunho em `localStorage` via `draft-storage.js`, prevenindo perda de dados por recarregamento involuntário da página.

---

## 7. Protocolo Obrigatório dos Arquivos Vivos

Todo agente de IA que iniciar uma sessão de desenvolvimento neste repositório deve seguir rigorosamente o seguinte ciclo:

### Antes de iniciar qualquer trabalho:
1. Ler `docs/FSD.md` (garantir alinhamento com a fonte de verdade).
2. Ler `docs/DESIGN.md` (garantir alinhamento com a identidade visual e ergonomia).
3. Ler `docs/INSUMOS.md` (consultar inventário de protótipos e referências).
4. Ler `docs/PLANO.md` (identificar a fase e tarefas atuais).
5. Ler `docs/STATUS.md` (verificar o estado do projeto e tarefas pendentes).
6. Ler `docs/ERROS.md` (estar ciente de falhas conhecidas, bloqueios ou soluções adotadas).

### Ao terminar qualquer trabalho:
1. Atualizar `docs/STATUS.md` (refletir tarefas concluídas, percentual de progresso e próximas etapas).
2. Registrar erros e soluções em `docs/ERROS.md`, caso alguma anomalia ou correção tenha ocorrido.
3. Informar ao usuário de forma clara e objetiva o que foi feito.
4. Informar como testar ou validar a entrega realizada.
