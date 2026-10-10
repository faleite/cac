# DOCUMENTO DE ESPECIFICAÇÃO FUNCIONAL (FSD)

## 1. Visão Geral

O **CAC Atividades** (Controlo Atividades Correios) é uma aplicação web responsiva desenvolvida para simplificar, padronizar e automatizar a rotina de registo diário de entregas e controlo de viaturas por parte de estafetas e carteiros de serviços de correio e logística de última milha (*last-mile*).

O sistema resolve diretamente os problemas de relatórios manuais despadronizados em grupos de mensagens, erros de cálculo de incidências e eficiência, falta de visibilidade sobre a utilização da frota e risco de perda de dados digitados em dispositivos móveis.

### Resumo do Funcionamento
1. **Auto-registo e Autenticação:** O colaborador cria a sua conta (perfil Operador) e acede de forma segura via Número de Colaborador (SC) ou E-mail e Palavra-passe.
2. **Registo do Turno em Duas Etapas:**
   - **Início do Turno (Abertura):** Registo do Km Inicial, confirmação de Matrícula do veículo e Código do Giro (rota).
   - **Fim do Turno (Fecho):** Registo do Km Final, total de Objetos, Recolhas e detalhamento de 5 tipos de incidências (Avisados, Retornos, Endereço Insuficiente, Recusados, Desconhecidos na Morada).
3. **Preservação de Dados (Rascunho Local):** Durante a digitação, os números são preservados temporariamente no navegador (`localStorage`), prevenindo perdas por recarregamento acidental do ecrã.
4. **Validações de Integridade:** Validações matemáticas em tempo real impedem registos inconsistentes (ex: Km Final inferior ao Inicial ou total de incidências superior ao total de objetos).
5. **Comunicação Automatizada com WhatsApp:** Geração instantânea da mensagem formatada no padrão oficial da empresa, com botões para cópia com 1 clique e envio direto para o WhatsApp.
6. **Dashboard de Indicadores:** Painel visual com cartões de métricas (Entregues, Incidências, Km Percorridos, Taxa de Eficiência %, Dias Ativos), gráfico comparativo e filtros por período (Dia, Semana, Mês, Ano) e por colaborador (visão gerencial do Administrador).

### Público Usuário e Contexto de Uso
- **Operadores (Estafetas/Carteiros):** Utilizam a aplicação prioritariamente em telemóveis (*mobile-first*) nos momentos de início e fim da jornada de trabalho.
- **Administradores (Supervisores/Gestores):** Utilizam a aplicação em computadores ou telemóveis para acompanhamento dos indicadores operacionais da frota.

---

## 2. Documentos do Projeto para Implementação

A IA codificadora deverá utilizar exclusivamente os seguintes documentos situados no repositório do projeto para implementar o sistema:

- `docs/FSD.md` (este documento);
- `docs/DESIGN.md`.

*Nota de Consolidação:* O FSD consolida integralmente todas as especificações funcionais, regras de negócio, modelo de dados, rotas, segurança e arquitetura técnica necessárias. Não é necessária a consulta a documentos prévios como PRD ou notas de reuniões para a implementação do sistema.

---

## 3. Stack Definida

- **Linguagem Backend:** Node.js (v18+ LTS).
- **Framework Web Backend:** Express.js.
- **Linguagem Frontend:** HTML5, CSS3, JavaScript Vanilla (ES6+), renderizados no servidor via Engine de Templates (SSR - Server-Side Rendering).
- **Estilização / UI Framework:** Bootstrap mantido em ficheiros locais no repositório (sem dependência de CDN externa), estruturado conforme o Design System *Postal Utility System* (`docs/DESIGN.md`) — Paleta CTT Red (`#a8001c`), tipografia Inter, espaçamento em grelha de 4px, cantos arredondados (8px) e alvos de toque móveis com altura mínima de 48px e inputs com 56px.
- **Banco de Dados:** PostgreSQL (v14+).
- **Sessão e Autenticação:** `express-session` com armazenamento persistente via `connect-pg-simple` no PostgreSQL, encriptação de palavras-passe com `bcrypt`.
- **E-mail Transacional:** `Nodemailer` configurado centraladamente para envio de links de recuperação de palavra-passe via SMTP.
- **Padrão Arquitetural:** MVC (Model-View-Controller).
- **Uso Local de Bibliotecas:** Todas as bibliotecas de frontend (Bootstrap, ícones) e backend (npm) devem estar contidas e instaladas localmente no projeto, garantindo funcionamento autónomo em ambiente isolado.

---

## 4. Ambientes do Projeto

### 1. Ambiente de Desenvolvimento Local
Containerização completa utilizando Docker e Docker Compose:
- **Serviço de Aplicação:** Container Node.js executando a aplicação Express.
- **Serviço de Banco de Dados:** Container PostgreSQL isolado com volume persistente.
- **Orquestração:** Ficheiro `docker-compose.yml` unificando a inicialização da aplicação e do banco de dados na rede interna do Docker.

### 2. Ambiente de Testes / Homologação
Não haverá ambiente de testes em nuvem dedicado na V1. Todas as validações funcionais, testes de integração e verificações de segurança serão executadas no ambiente local Docker antes de qualquer publicação.

### 3. Ambiente de Produção
Instância Compute (Máquina Virtual) em nuvem na **Oracle Cloud Infrastructure (OCI)**:
- Sistema Operacional Linux (Ubuntu LTS).
- Process Manager (**PM2** ou **systemd**) para manter o processo Node.js em execução contínua.
- **Proxy Reverso (Nginx):** Recebe o tráfego HTTP/HTTPS nas portas 80/443 e redireciona internamente para a porta da aplicação Node.js (ex: 3000).
- Instância PostgreSQL configurada para aceitar apenas ligações locais (*localhost*) ou da rede interna da VM.

---

## 5. Arquitetura do Sistema

### Referência Principal de Raiz
A estrutura de diretórios do projeto adota como referência principal a designação:

`[Diretório do Projeto - Repositório]`

Este diretório representa a pasta do projeto versionada no Git (ex: `cac-atividades/` contendo o `package.json` e o `docker-compose.yml`). O projeto não assume dependência de pastas públicas fixas do servidor (como `public_html`, `htdocs` ou `www`). 

Em ambiente de desenvolvimento Docker, o projeto é mapeado para a pasta `/app` dentro do container. Em servidor VPS ou PaaS, o projeto reside no seu próprio diretório isolado, e o proxy reverso (Nginx) expõe publicamente apenas o ponto de entrada da aplicação.

### Aplicação do Padrão MVC

A aplicação separa rigidamente responsabilidades em três camadas principais:

1. **Model (`src/models/`):**
   - Lógica de acesso ao PostgreSQL executando consultas SQL estritamente parametrizadas.
   - Implementação das regras de negócio e validações de entidades (cálculo de eficiência, validações de Km e incidências).
   - Execução de operações de auditoria e inativação lógica (*soft delete*).
2. **View (`src/views/`):**
   - Templates HTML renderizados no servidor contendo a marcação estrutural e a integração com os estilos do Bootstrap local e do `docs/DESIGN.md`.
   - Exibição de dados dinâmicos injetados pelos Controllers.
   - Scripts Vanilla JS de suporte à interface (ex: preservação de rascunho em `localStorage` e integração com a API da Área de Transferência).
3. **Controller (`src/controllers/`):**
   - Receção de requisições HTTP, extração de parâmetros e validação de sessão/permissões via middlewares.
   - Invocação dos métodos adequados nos Models.
   - Escolha do template de View a renderizar ou resposta JSON a devolver.

### Proteção de Pastas Internas
Todas as pastas de código-fonte (`config`, `controllers`, `models`, `views`, `database`, `logs`, `middlewares`) residem no diretório privado da aplicação e **não são acessíveis diretamente via URL no navegador**. O servidor HTTP Express expõe estritamente os ficheiros estáticos autorizados (CSS local, JS local, imagens) através de uma pasta específica (`public/`), enquanto todas as outras rotas são processadas exclusivamente pelo roteador do Express (`src/routes/`).

### Estrutura de Diretórios Sugerida

```
[Diretório do Projeto - Repositório]
├── docker-compose.yml
├── Dockerfile
├── package.json
├── package-lock.json
├── README.md
├── docs/
│   ├── FSD.md
│   └── DESIGN.md
├── logs/
│   └── .gitkeep (ficheiros app-error.log e security.log gravados aqui)
├── public/ (única pasta exposta estaticamente)
│   ├── css/
│   │   ├── bootstrap.min.css
│   │   └── custom.css (estilos do DESIGN.md)
│   ├── js/
│   │   ├── bootstrap.bundle.min.js
│   │   └── draft-storage.js
│   └── images/
└── src/
    ├── index.js (arquivo de entrada da aplicação)
    ├── config/
    │   └── index.js (módulo centralizado de configurações técnicas)
    ├── database/
    │   ├── connection.js (pool de conexões com PostgreSQL)
    │   └── migrations/
    │       ├── 001_create_schema.sql
    │       ├── 002_create_indexes.sql
    │       └── migrate.js (executor seguro de migrations)
    ├── middlewares/
    │   ├── auth.js (verificação de autenticação de sessão)
    │   └── rbac.js (verificação de perfil Operador vs Admin)
    ├── models/
    │   ├── Usuario.js
    │   ├── PerfilConfiguracao.js
    │   ├── RegistoDiario.js
    │   ├── AuditoriaRegisto.js
    │   └── LogSeguranca.js
    ├── controllers/
    │   ├── AuthController.js
    │   ├── PerfilController.js
    │   ├── RegistoDiarioController.js
    │   └── DashboardController.js
    ├── views/
    │   ├── layouts/
    │   │   └── main.html
    │   ├── auth/
    │   │   ├── login.html
    │   │   ├── registo.html
    │   │   ├── recuperar-senha.html
    │   │   └── redefinir-senha.html
    │   ├── registos/
    │   │   ├── abertura.html
    │   │   ├── fecho.html
    │   │   ├── confirmar-whatsapp.html
    │   │   └── editar.html
    │   ├── perfil/
    │   │   └── index.html
    │   └── dashboard/
    │       └── index.html
    ├── routes/
    │   └── index.js
    └── utils/
        ├── logger.js (módulo de gravação de logs em ficheiro)
        └── formatters.js (formatador de texto do WhatsApp e datas)
```

---

## 6. Escopo Funcional da Primeira Versão

### Módulo 1: Autenticação e Gestão de Perfil Pessoal
- **Auto-Registo de Colaborador:** Permite a criação autónoma de conta indicando Nome Completo, Nº de Colaborador (SC), Nº de Telemóvel, E-mail e Palavra-passe. Atribui automaticamente o perfil `operador`.
- **Login de Utilizador:** Autenticação via Número de Colaborador (SC) ou E-mail combinado com Palavra-passe.
- **Recuperação de Palavra-passe:** Solicitador de link/código com token temporário de 1 hora enviado por e-mail via `Nodemailer`.
- **Perfil do Colaborador:** Visualização e alteração de dados pessoais, alteração de palavra-passe e definição das preferências habituais: **Matrícula de Veículo Padrão** e **Código de Giro Padrão**.

### Módulo 2: Controlo Diário de Atividade
- **Início do Turno (Abertura):** Registo do Km Inicial (inserido manualmente do zero) com pré-preenchimento automático da Matrícula e Giro a partir do perfil do colaborador (editáveis pontualmente).
- **Fim do Turno (Fecho):** Registo do Km Final, Giro, Quantidade de Objetos totais, Quantidade de Recolhas e detalhamento de 5 incidências: Avisados, Retornos, Endereço Insuficiente, Recusados e Desconhecidos na Morada.
- **Rascunho Local de Digitação:** Salvamento automático temporário dos campos do formulário no `localStorage` do navegador para prevenir perda de dados por atualização acidental da página.
- **Aviso de Pendência Não Bloqueante:** Alerta destacado ao aceder ao sistema quando existir um turno do dia anterior sem fecho efetuado.
- **Edição de Registo com Auditoria:** Permitir a correção de registos de atividade antigos por Operadores (seus próprios) e Administradores (de qualquer colaborador), gravando histórico de auditoria obrigatório.

### Módulo 3: Comunicação Automatizada (WhatsApp)
- **Gerador de Mensagem Formatada:** Montagem automática do texto no modelo exato oficial estipulado pela empresa.
- **Ações Rápidas:**
  - Botão **"Copiar Texto"**: Copia a mensagem formatada para a área de transferência do dispositivo.
  - Botão **"Enviar para WhatsApp"**: Redireciona via protocolo `https://wa.me/?text=...` diretamente para o WhatsApp.

### Módulo 4: Dashboard e Indicadores Operacionais
- **Cartões de Indicadores:** Exibição de Objetos Entregues Efetivos, Total de Incidências, Km Totais Percorridos, Taxa de Eficiência (%) e Dias de Atividade Registados.
- **Gráfico Comparativo:** Gráfico visual de barras/tarte comparando Entregues vs. Não Entregues.
- **Filtros Temporais:** Alternância entre Dia (Hoje), Esta Semana, Este Mês e Este Ano.
- **Seletor de Colaborador (Exclusivo Administrador):** Alternância entre a visão global ("Toda a Empresa") e a visão filtrada por um colaborador específico.

### Módulo 5: Infraestrutura Estrutural
- Suporte a múltiplos perfis no banco de dados (`operador` e `administrador`).
- Registos de auditoria em JSONB para edições.
- Inativação lógica (*soft delete*) para utilizadores.
- Gravação silenciosa de logs de erro em ficheiros `.txt` locais com rotação/limpeza aos 90 dias e contingência em arquivo quando a base de dados falhar.

---

## 7. Fora de Escopo

Os seguintes recursos **NÃO** fazem parte da primeira versão (V1):

1. **Painel Visual de Gestão de Utilizadores pelo Admin:** Telas para criação/edição/inativação de contas graficamente pelo Administrador (a criação é realizada via auto-registo de colaboradores e a gestão administrativa inicial via backend/banco de dados).
2. **Motor de Sincronização Offline Avançado (PWA Engine):** Fila de envio em segundo plano e Service Workers para envio sem internet (o sistema utiliza apenas rascunho de digitação no ecrã e requer ligação ativa para a submissão final).
3. **Campo de Quantidade de Paragens:** Registo numérico de paragens efetuadas na rota.
4. **Calculadora e Previsão de Comissões:** Módulo financeiro de cálculo de valores monetários.
5. **Exportação de Ficheiros (PDF, Excel, CSV):** Geração de relatórios para descarregamento ou impressão.
6. **Upload de Ficheiros, Anexos ou Fotografias:** Comprovativos fotográficos de entrega ou incidência.
7. **Rastreamento por GPS, Mapas e Otimização de Rotas:** Localização geográfica em tempo real.
8. **Leitura de Código de Barras / QR Code via Câmara:** Digitalização de etiquetas.
9. **Integrações via API com os Correios ou E-commerce:** Importação/exportação automática de listas de objetos com sistemas centrais postais.

---

## 8. Perfis de Usuário e Permissões

### Descrição dos Perfis

- **Operador (Colaborador / Estafeta / Carteiro):** Perfil atribuído no auto-registo. Acede exclusivamente aos seus próprios dados operacionais, ao seu perfil e ao seu dashboard individual.
- **Administrador (Gestor / Supervisor):** Perfil com acesso gerencial a toda a frota. Acede aos dashboards consolidados e individuais de todos os colaboradores e possui permissão para editar registos operacionais de qualquer colaborador.

### Matriz de Permissões (RBAC)

| Ação / Funcionalidade | Operador | Administrador |
| --------------------- | :------: | :-----------: |
| Auto-registo de conta | Permite | Permite |
| Solicitar Recuperação de Palavra-passe | Permite (Público) | Permite (Público) |
| Alterar próprios dados e senha | Permite | Permite |
| Definir Veículo Padrão e Giro Padrão | Permite | Permite |
| Registar Abertura de Turno (Início) | Permite (Próprio) | Permite (Próprio) |
| Registar Fecho de Turno (Fim) | Permite (Próprio) | Permite (Próprio) |
| Copiar e Enviar Relatório WhatsApp | Permite | Permite |
| Editar Registo Diário Próprio | Permite (Com Auditoria) | Permite (Com Auditoria) |
| Editar Registo Diário de Outro Colaborador | Bloqueado | Permite (Com Auditoria) |
| Visualizar Dashboard Pessoal | Permite (Apenas Próprio) | Permite |
| Visualizar Dashboard Consolidado ("Toda a Empresa") | Bloqueado | Permite |
| Filtrar Dashboard por Colaborador Específico | Bloqueado | Permite |
| Auto-elevação de Perfil para Administrador | Bloqueado | Bloqueado |

---

## 9. Recursos Estruturais do Sistema

### 1. Autenticação e Sessão
- **Mecanismo:** Sessões de servidor mantidas por cookies seguros via `express-session` e armazenadas na tabela `app_sessoes` do PostgreSQL via `connect-pg-simple`.
- **Encriptação:** Palavras-passe encriptadas utilizando `bcrypt` com fator de custo 10.
- **Validação de Acesso:** Middleware de rotas que redireciona utilizadores não autenticados para `/login`.

### 2. Controlo de Acesso Baseado em Perfis (RBAC)
- Middleware de permissões (`rbac.js`) aplicado a rotas administrativas que verifica se `req.session.usuario.perfil === 'administrador'`, retornando erro HTTP 403 (Acesso Negado) quando violado.

### 3. Auditoria de Alterações
- Qualquer alteração efetuada num registo da tabela `registos_diarios` gera automaticamente uma entrada na tabela `auditoria_registos`, armazenando o ID do registo, ID do autor da alteração, data/hora exata e a comparação dos valores antigos e novos em formato `JSONB`.

### 4. Inativação Lógica (*Soft Delete*)
- A inativação de contas de utilizador é realizada alterando a coluna `ativo` para `FALSE` na tabela `usuarios`. Todas as consultas de autenticação e listagens filtram por `ativo = TRUE`, preservando o histórico de entregas associado.

### 5. Registos de Diagnóstico (Logs)
- **Log de Erros em Arquivo:** Gravação em ficheiro local (`logs/app-error.log`) situado fora do acesso web público, com rotação diária e eliminação automática de registos com mais de 90 dias.
- **Contingência de Log:** Se a base de dados ficar indisponível ou a ligação falhar, o sistema grava a exceção no ficheiro de texto sem interromper o fluxo com detalhes técnicos visíveis ao utilizador.
- **Log de Segurança:** Gravação na tabela `logs_seguranca` e no ficheiro `logs/security.log` de falhas de login, tentativas de acesso a rotas não autorizadas e edições de registos.

### 6. Configurações Globais e Técnicas
- Preferências operacionais do utilizador mantidas na tabela `perfis_configuracao`.
- Configurações do servidor gerenciadas centralizadamente através do módulo `src/config/index.js`, consumindo variáveis de ambiente injetadas por `dotenv`.

---

## 10. Entidades do Sistema

### 1. `Usuario` (Utilizadores)
- **Finalidade:** Armazenar as credenciais e dados de identificação dos colaboradores e gestores, além de tokens temporários de recuperação de palavra-passe.
- **Atributos Principais:** ID, Nome Completo, Número de Colaborador (SC), Telemóvel, E-mail, Senha Hash, Perfil (`operador`/`administrador`), Estado Ativo (`BOOLEAN`), Token de Recuperação (`VARCHAR`), Expiração do Token (`TIMESTAMP`), Data de Criação, Data de Atualização.
- **Relacionamentos:** Possui 1 `PerfilConfiguracao`; possui N `RegistoDiario`.
- **Soft Delete:** Sim (coluna `ativo`).
- **Auditoria:** Gravação de data/hora de atualização.

### 2. `PerfilConfiguracao` (Configurações de Perfil)
- **Finalidade:** Armazenar as preferências operacionais habituais do colaborador para aceleração de preenchimento dos formulários.
- **Atributos Principais:** ID, Usuario ID, Matrícula de Veículo Padrão, Código do Giro Padrão, Data de Atualização.
- **Relacionamentos:** Pertence a 1 `Usuario`.

### 3. `RegistoDiario` (Turnos e Entregas Diárias)
- **Finalidade:** Armazenar os dados operacionais de abertura e fecho do turno de trabalho de cada dia.
- **Atributos Principais:** ID, Usuario ID, Data do Registo, Status (`aberto`/`fechado`), Km Inicial, Km Final, Matrícula do Dia, Giro do Dia, Qtd Objetos, Qtd Recolhas, Qtd Avisados, Qtd Retornos, Qtd Endereço Insuficiente, Qtd Recusados, Qtd Desconhecidos Morada, Qtd Entregues Efetivos, Taxa Eficiência (%), Km Percorridos, Data/Hora Abertura, Data/Hora Fecho, Data de Atualização.
- **Relacionamentos:** Pertence a 1 `Usuario`; possui N `AuditoriaRegisto`.
- **Auditoria:** Sim (tabela `auditoria_registos`).

### 4. `AuditoriaRegisto` (Histórico de Edições)
- **Finalidade:** Manter o histórico de auditoria transparente para alterações em registos diários.
- **Atributos Principais:** ID, RegistoDiario ID, UsuarioAlteracao ID (autor), DataHoraAlteracao, ValoresAntigos (`JSONB`), ValoresNovos (`JSONB`), Motivo/Observação.

### 5. `LogSeguranca` (Eventos de Segurança)
- **Finalidade:** Registar ocorrências e eventos sensíveis do sistema.
- **Atributos Principais:** ID, TipoEvento (ex: `LOGIN_FALHA`, `ACESSO_NEGADO`, `EDIT_REGISTO`), Usuario ID (opcional), IPOrigem, Detalhes (`TEXT` ou `JSONB`), DataHora.

---

## 11. Modelo de Dados Proposto

### Diagrama / Tabelas PostgreSQL

```sql
-- Habilitação da extensão para UUIDs (se necessário) ou uso de BIGSERIAL
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    primeiro_nome VARCHAR(100) NOT NULL,
    ultimo_nome VARCHAR(100) NOT NULL,
    numero_sc VARCHAR(30) UNIQUE NOT NULL,
    telemovel VARCHAR(20) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil VARCHAR(20) NOT NULL DEFAULT 'operador' CHECK (perfil IN ('operador', 'administrador')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    token_recuperacao VARCHAR(255),
    token_expiracao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE perfis_configuracao (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    matricula_padrao VARCHAR(20),
    giro_padrao VARCHAR(20),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registos_diarios (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    data_registo DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'fechado')),
    km_inicial INTEGER NOT NULL CHECK (km_inicial >= 0),
    km_final INTEGER CHECK (km_final >= km_inicial),
    matricula_dia VARCHAR(20) NOT NULL,
    giro_dia VARCHAR(20) NOT NULL,
    qtd_objetos INTEGER DEFAULT 0 CHECK (qtd_objetos >= 0),
    qtd_recolhas INTEGER DEFAULT 0 CHECK (qtd_recolhas >= 0),
    qtd_avisados INTEGER DEFAULT 0 CHECK (qtd_avisados >= 0),
    qtd_retornos INTEGER DEFAULT 0 CHECK (qtd_retornos >= 0),
    qtd_end_insuficiente INTEGER DEFAULT 0 CHECK (qtd_end_insuficiente >= 0),
    qtd_recusados INTEGER DEFAULT 0 CHECK (qtd_recusados >= 0),
    qtd_desc_morada INTEGER DEFAULT 0 CHECK (qtd_desc_morada >= 0),
    qtd_entregues INTEGER DEFAULT 0 CHECK (qtd_entregues >= 0),
    taxa_eficiencia DECIMAL(5,2) DEFAULT 0.00,
    km_percorridos INTEGER DEFAULT 0,
    data_hora_abertura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_hora_fecho TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_usuario_data_registo UNIQUE(usuario_id, data_registo)
);

CREATE TABLE auditoria_registos (
    id BIGSERIAL PRIMARY KEY,
    registo_diario_id BIGINT NOT NULL REFERENCES registos_diarios(id) ON DELETE CASCADE,
    usuario_alteracao_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    data_hora_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valores_antigos JSONB NOT NULL,
    valores_novos JSONB NOT NULL,
    motivo VARCHAR(255)
);

CREATE TABLE logs_seguranca (
    id BIGSERIAL PRIMARY KEY,
    tipo_evento VARCHAR(50) NOT NULL,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    ip_origem VARCHAR(45),
    detalhes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de controle de sessões do express-session (connect-pg-simple)
CREATE TABLE app_sessoes (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX idx_sessoes_expire ON app_sessoes(expire);

-- Tabela de controle de execuções de Migrations
CREATE TABLE schema_migrations (
    id SERIAL PRIMARY KEY,
    nome_migration VARCHAR(255) UNIQUE NOT NULL,
    executada_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Índices de Desempenho
Para garantir resposta instantânea na renderização de dashboards e filtros por período e colaborador, são definidos obrigatoriamente os seguintes índices:

```sql
CREATE INDEX idx_registos_usuario_data ON registos_diarios (usuario_id, data_registo);
CREATE INDEX idx_registos_data_status ON registos_diarios (data_registo, status);
CREATE INDEX idx_registos_usuario_status ON registos_diarios (usuario_id, status);
CREATE INDEX idx_auditoria_registo ON auditoria_registos (registo_diario_id);
```

### Estratégia de Migrations do Projeto
- **Localização:** Ficheiros SQL e scripts versionados em `src/database/migrations/`.
- **Mecanismo de Controle:** Script interno `src/database/migrations/migrate.js` que verifica a tabela `schema_migrations`. Ao ser invocado, lê os ficheiros `.sql` pendentes em ordem alfabética/numérica, executa as instruções dentro de uma transação SQL e regista o nome do ficheiro na tabela de controlo.
- **Modo de Execução:** Executado via linha de comandos localmente ou em script de deploy (`npm run migrate`). As migrations **não estão acessíveis via navegador web**.

---

## 12. Módulos e Telas

Todas as telas seguem o padrão visual especificado em `docs/DESIGN.md`: fundo neutro (`#f9f9f9`), cartões brancos (`#ffffff`) com bordas suaves (8px), tipografia Inter e botões de ação principal em Vermelho CTT (`#a8001c`).

### 1. Tela de Login (`/login`)
- **Objetivo:** Autenticar o utilizador no sistema.
- **Campos:** Campo "Nº Colaborador (SC) ou E-mail" e "Palavra-passe".
- **Ações:** Botão "Entrar em Sessão" (Vermelho CTT), Link "Criar Conta (Auto-Registo)", Link "Esqueceu-se da palavra-passe?".
- **Mensagens:** Erro em credenciais inválidas ("Credenciais de acesso incorretas. Tente novamente.").

### 2. Tela de Auto-Registo (`/registo`)
- **Objetivo:** Permitir a criação autónoma de conta de Operador.
- **Campos:** Nome Completo, Número SC, Telemóvel, E-mail, Palavra-passe e Confirmação de Palavra-passe.
- **Ações:** Botão "Criar Conta e Entrar", Link "Já tem conta? Iniciar sessão".
- **Mensagens:** Alerta em campo duplicado ("O Número SC ou E-mail já se encontra registado.").

### 3. Tela de Recuperação de Palavra-passe (`/recuperar-senha`)
- **Objetivo:** Solicitar o envio de e-mail de redefinição de palavra-passe.
- **Campos:** E-mail de cadastro.
- **Ações:** Botão "Enviar Link de Recuperação".
- **Mensagens:** Sucesso genérico por segurança ("Se o e-mail existir na nossa base de dados, receberá as instruções em breve.").

### 4. Tela de Redefinição de Palavra-passe (`/redefinir-senha?token=XYZ`)
- **Objetivo:** Validar o token recebido por e-mail e permitir a definição da nova palavra-passe.
- **Campos:** Nova Palavra-passe e Confirmação da Nova Palavra-passe.
- **Ações:** Botão "Guardar Nova Palavra-passe".
- **Mensagens:** Alerta de token inválido ou expirado ("O link de recuperação é inválido ou já expirou. Solicite um novo link.").

### 5. Tela de Perfil do Colaborador (`/perfil`)
- **Objetivo:** Gerir preferências habituais e dados da conta.
- **Campos:** Nome, Telemóvel, E-mail, Matrícula de Veículo Padrão, Código do Giro Padrão, Alteração de Palavra-passe.
- **Ações:** Botão "Guardar Alterações do Perfil".

### 6. Tela de Início de Turno / Abertura (`/registos/abertura`)
- **Objetivo:** Registar os dados de início da jornada de trabalho.
- **Campos:** Km Inicial (obrigatório, digitado do zero), Matrícula do Veículo (pré-preenchida pelo perfil, editável), Código do Giro (pré-preenchido pelo perfil, editável).
- **Ações:** Botão "Guardar e Iniciar Turno".
- **Recursos Visuais:** Caixa de aviso em destaque caso exista turno pendente do dia anterior.

### 7. Tela de Fecho de Turno (`/registos/fecho`)
- **Objetivo:** Registar a conclusão do turno e inserção de métricas de entrega.
- **Campos:** Km Final, Qtd Objetos Totais, Qtd Recolhas, Qtd Avisados, Qtd Retornos, Qtd Endereço Insuficiente, Qtd Recusados, Qtd Desconhecidos na Morada.
- **Ações:** Botão "Finalizar Turno e Gerar Relatório".
- **Comportamento Dinâmico:** Rascunho de digitação salvo continuamente em `localStorage`.

### 8. Tela / Modal de Confirmação do WhatsApp (`/registos/confirmar-whatsapp/:id`)
- **Objetivo:** Apresentar o relatório formatado e botões de envio rápido.
- **Exibição:** Bloco visual com a pré-visualização do texto formatado conforme o modelo oficial da empresa.
- **Ações:** Botão "Copiar Texto" (copia para área de transferência) e Botão "Enviar para WhatsApp" (abre `https://wa.me/?text=...`).

### 9. Tela / Modal de Edição de Registo (`/registos/editar/:id`)
- **Objetivo:** Permitir a correção justificada de um registo de atividade.
- **Campos:** Todos os campos de abertura e fecho + Campo obrigatório "Motivo da Alteração".
- **Ações:** Botão "Guardar Alterações com Auditoria".

### 10. Tela de Dashboard Operacional (`/dashboard`)
- **Objetivo:** Apresentar o painel visual de indicadores.
- **Componentes:**
  - Seletor de Colaborador (Exclusivo Administrador: "Toda a Empresa" vs Colaborador Específico).
  - Seletor de Período (Dia, Semana, Mês, Ano).
  - 5 Cartões de Resumo: Objetos Entregues, Incidências, Km Percorridos, Taxa de Eficiência (%), Dias Ativos.
  - Gráfico Comparativo: Entregues Efetivos vs. Não Entregues (Incidências).
  - Tabela de Histórico de Turnos do Período com botão de Ação "Ver / Editar".

---

## 13. Fluxos Funcionais

### Fluxo 1: Auto-Registo e Configuração Inicial
1. O estafeta acede à página inicial e clica em "Criar Conta".
2. Preenche Nome, SC, Telemóvel, E-mail e Palavra-passe.
3. O sistema valida que SC e E-mail não existem na base de dados, cria o registo em `usuarios` com perfil `operador`, cria uma linha em `perfis_configuracao` e estabelece a sessão do utilizador.
4. O utilizador é redirecionado para a tela de Perfil para preencher a sua Matrícula Padrão e Giro Padrão.

### Fluxo 2: Início do Turno Diário (Abertura)
1. O colaborador autenticado acede ao sistema no início do dia.
2. O sistema verifica se existe algum registo anterior com status `aberto`. Se houver, exibe um alerta no topo da ecrã (não bloqueante).
3. O colaborador abre a tela de Início de Turno. A Matrícula e o Giro surgem preenchidos com os seus dados padrão.
4. O colaborador insere o Km Inicial do veículo e clica em "Guardar e Iniciar Turno".
5. O sistema cria um registo na tabela `registos_diarios` com a data atual e status `aberto`.

### Fluxo 3: Fecho do Turno Diário e Envio para o WhatsApp
1. Ao final do dia, o colaborador clica em "Fechar Turno".
2. Insere o Km Final, Objetos, Recolhas e a contagem das 5 incidências.
3. À medida que digita, o script Vanilla JS salva rascunho local em `localStorage`.
4. Ao clicar em "Finalizar Turno e Gerar Relatório", o backend valida as regras de negócio ($\text{Km Final} \ge \text{Km Inicial}$ e $\sum \text{Incidências} \le \text{Objetos}$).
5. Se aprovado, o backend calcula a Taxa de Eficiência e os Objetos Entregues, atualiza o registo para `status = 'fechado'`, limpa o rascunho do `localStorage` e redireciona para a tela de confirmação do WhatsApp.
6. O colaborador clica em "Enviar para WhatsApp" e é redirecionado para a aplicação do WhatsApp com o texto pré-formatado conforme o modelo da empresa.

### Fluxo 4: Edição de Registo com Auditoria
1. O utilizador (Operador no seu registo ou Administrador em qualquer registo) clica em "Editar" num registo do histórico.
2. Altera os valores necessários e preenche o motivo da edição.
3. O backend executa a atualização na tabela `registos_diarios` dentro de uma transação SQL e insere uma linha em `auditoria_registos` contendo os dados antigos e novos em formato JSONB.

### Fluxo 5: Análise Gerencial pelo Administrador
1. O Administrador acede ao `/dashboard`.
2. Utiliza o seletor para mudar de "Toda a Empresa" para um colaborador específico.
3. Altera o filtro de período para "Este Mês".
4. O backend executa as consultas agregadas no PostgreSQL otimizadas pelos índices e atualiza instantaneamente os cartões e o gráfico.

### Fluxo 6: Recuperação de Palavra-passe
1. O utilizador não autenticado acede à ecrã de login (`/login`) e clica na opção "Esqueceu-se da palavra-passe?".
2. O sistema exibe a ecrã de recuperação de palavra-passe (`/recuperar-senha`) solicitando o e-mail cadastrado.
3. O utilizador insere o e-mail e clica em "Enviar Link de Recuperação".
4. O backend verifica se o e-mail existe na base de dados. Se existir, gera um token aleatório seguro de redefinição, armazena em `usuarios.token_recuperacao` com expiração de 1 hora (`usuarios.token_expiracao`), e dispara um e-mail transacional via `Nodemailer` contendo o link único `/redefinir-senha?token=XYZ`.
5. O sistema exibe uma mensagem de sucesso genérica na ecrã ("Se o e-mail existir na nossa base de dados, receberá as instruções em breve.") para prevenir enumeração de utilizadores.
6. O utilizador acede ao e-mail, clica no link e é direcionado para a ecrã de redefinição de palavra-passe.
7. O backend valida a existência e validade temporal do token. Se for válido, permite a digitação da nova palavra-passe.
8. Ao guardar, o backend encripta a nova senha com `bcrypt`, atualiza `senha_hash`, limpa o token (`token_recuperacao = NULL`) e redireciona para `/login` com mensagem de confirmação.

---

## 14. Validações e Regras de Negócio

### Modelo/Template Oficial do Texto do WhatsApp
O sistema deve gerar a mensagem do WhatsApp seguindo estritamente a seguinte estrutura textual formatada:

```txt
*_[DD/MM/YYYY]_*

*Início*
Nome: *[Nome Completo]*
Matrícula: *[Matrícula]*
Km iniciais: *[Km Inicial]*
Giro: *[Giro]*
Qtd Objectos: *[Qtd Objetos]*
Qtd Recolhas: *[Qtd Recolhas]*

*Final*
Nome: *[Nome Completo]*
Matrícula: *[Matrícula]*
Km Finais: *[Km Final]*
Giro: *[Giro]*
Qtd Objectos: *[Qtd Objetos]*
Qtd Recolhas: *[Qtd Recolhas]*
Qtd Avisados: *[Qtd Avisados ou valor gravado]*
Qtd Retornos: *[Qtd Retornos ou valor gravado]*
Qtd End. Insuf.: *[Qtd End. Insuficiente ou valor gravado]*
Qtd Recusados: *[Qtd Recusados ou valor gravado]*
Qtd desc morada.: *[Qtd Desconhecidos Morada ou valor gravado]*
```

*Exemplo de Saída Gerada:*
```txt
*_07/07/2026_*

*Início*
Nome: *Fabricio Leite*
Matrícula: *BI-04-NH*
Km iniciais: *73136*
Giro: *2825H*
Qtd Objectos: *159*
Qtd Recolhas: *1*

*Final*
Nome: *Fabrício Leite*
Matrícula: *BI-04-NH*
Km Finais: *73207*
Giro: *2825H*
Qtd Objectos: *159*
Qtd Recolhas: *1*
Qtd Avisados: *1*
Qtd Retornos: *3*
Qtd End. Insuf.: **
Qtd Recusados: **
Qtd desc morada.: *1*
```

### Fórmulas Oficiais de Cálculo
1. **Objetos Entregues Efetivos:**
   $$\text{Entregues} = \text{Qtd Objetos} - (\text{Avisados} + \text{Retornos} + \text{End. Insuficiente} + \text{Recusados} + \text{Desc. Morada})$$
2. **Taxa de Eficiência (%):**
   $$\text{Eficiência (\%)} = \left( \frac{\text{Entregues} + \text{Qtd Recolhas}}{\text{Qtd Objetos} + \text{Qtd Recolhas}} \right) \times 100$$
   *(Casos de divisão por zero são tratados resultando em 0.00%).*
3. **Quilómetros Percorridos:**
   $$\text{Km Percorridos} = \text{Km Final} - \text{Km Inicial}$$

### Regras de Validação Bloqueantes
1. **Validação de Quilometragem:** O formulário de fecho é rejeitado se $\text{Km Final} < \text{Km Inicial}$.
   - *Mensagem de Erro:* "O Km Final não pode ser inferior ao Km Inicial informado na abertura."
2. **Validação de Incidências:** O formulário de fecho é rejeitado se a soma das 5 incidências for estritamente superior à Quantidade de Objetos declarada.
   - *Mensagem de Erro:* "A soma das incidências (não entregues) não pode ser maior do que a Quantidade Total de Objetos."
3. **Unicidade de Registo Diário:** Não pode existir mais do que um registo diário para o mesmo `usuario_id` na mesma `data_registo` (garantido por constraint `UNIQUE` na base de dados).

---

## 15. Autenticação e Sessão

- **Tipo:** Autenticação por credenciais com sessão mantida no servidor (*Stateful Session*).
- **Parâmetros de Cookie:**
  - `name`: `cac_session_id`
  - `httpOnly`: `true` (impede acesso do cookie por scripts client-side / XSS).
  - `sameSite`: `'lax'` (proteção contra CSRF).
  - `secure`: `false` em desenvolvimento local e `true` em ambiente de produção HTTPS.
  - `maxAge`: 8 horas de inatividade.
- **Proteção de Rotas:** Middleware `auth.js` verifica a presença de `req.session.usuario`. Caso ausente, armazena a URL tentada e redireciona para `/login`.

---

## 16. Controle de Acesso

- **Mecanismo:** RBAC (*Role-Based Access Control*) com validação rigorosa no backend.
- **Isolamento de Dados no Operador:** Todas as consultas efetuadas por um utilizador com perfil `operador` contêm obrigatoriamente a cláusula `WHERE usuario_id = req.session.usuario.id`.
- **Validação de Acesso Gerencial:** Rotas do Dashboard com filtro de colaborador ou edição de registos de terceiros passam pelo middleware `rbac.js`, exigindo `perfil === 'administrador'`.

---

## 17. Auditoria e Histórico

- **Âmbito:** Todas as operações de atualização (`UPDATE`) na tabela `registos_diarios`.
- **Dados Registados em `auditoria_registos`:**
  - `registo_diario_id`: ID do registo alterado.
  - `usuario_alteracao_id`: ID do utilizador que executou a edição.
  - `data_hora_alteracao`: Timestamp exato.
  - `valores_antigos`: Objeto JSONB com o estado dos campos antes da alteração.
  - `valores_novos`: Objeto JSONB com os novos campos atualizados.
  - `motivo`: Texto justificativo inserido pelo utilizador.

---

## 18. Soft Delete e Exclusões

- **Inativação Lógica:** A exclusão de utilizadores no sistema é estritamente lógica, definindo a coluna `ativo = FALSE` na tabela `usuarios`.
- **Efeito nas Consultas:** Consultas de autenticação e listagens operacionais incluem `WHERE ativo = TRUE`.
- **Integridade Referencial:** Garante que o histórico de turnos, métricas e auditorias permanece intacto na base de dados para relatórios gerenciais mesmo após o desligamento de um colaborador.

---

## 19. Logs

### 1. Log de Erros da Aplicação
- **Localização:** `logs/app-error.log` no diretório do projeto, fora da pasta pública.
- **Estrutura da Linha de Log:** `[YYYY-MM-DD HH:mm:ss] [NÍVEL] [ROTA/MÓDULO] Mensagem de Erro - Stack Trace`.
- **Retenção:** Rotina diária que remove automaticamente ficheiros de log com mais de 90 dias.
- **Mecanismo de Contingência:** Se ocorrer falha crítica de ligação com o PostgreSQL, o sistema captura a exceção, grava silenciosamente a mensagem no ficheiro `logs/app-error.log` e apresenta uma ecrã de erro amigável ao utilizador ("Ocorreu uma falha temporária de comunicação. Por favor tente novamente em instantes.").

### 2. Log de Segurança
- **Eventos Registados:** Tentativas de login falhadas, acessos negados por falta de permissão RBAC e edições operacionais.
- **Destino:** Armazenado na tabela `logs_seguranca` e no ficheiro `logs/security.log`.

---

## 20. Configurações Globais

### Configurações do Utilizador
Armazenadas na tabela `perfis_configuracao`:
- `matricula_padrao`: Matrícula do veículo habitualmente utilizado.
- `giro_padrao`: Código da rota/giro habitual.

### Configuração Técnica do Projeto
Gerenciada centralizadamente através do ficheiro `src/config/index.js`, que utiliza a biblioteca `dotenv` para carregar as variáveis de ambiente sem expor dados sensíveis em código-fonte:

```javascript
// src/config/index.js
require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET || 'secret_dev_cac_key',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'cac_user',
    password: process.env.DB_PASSWORD || 'cac_pass',
    database: process.env.DB_NAME || 'cac_db'
  },
  email: {
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'no-reply@cacatividades.pt'
  }
};
```

---

## 21. Uploads, Anexos e Arquivos

**Recurso Declarado FORA DE ESCOPO na V1.**
O sistema não possui formulários, rotas ou estruturas de dados para envio, armazenamento ou visualização de ficheiros, fotografias ou anexos nesta versão.

---

## 22. Relatórios, Consultas e Exportações

- **Visualização:** Consultas dinâmicas renderizadas em ecrã no Módulo de Dashboard com filtros de período (Dia, Semana, Mês, Ano) e por colaborador.
- **Exportação para Ficheiros (PDF, Excel, CSV):** **Declarado FORA DE ESCOPO na V1.** Não haverá geração de ficheiros para descarregamento.

---

## 23. APIs e Integrações Externas

1. **Integração com WhatsApp:**
   - Realizada sem custos através do protocolo nativo web `https://wa.me/?text=...` e da API do navegador `navigator.clipboard.writeText()`.
2. **Integração com Servidor de E-mail (SMTP):**
   - Utilização da biblioteca `Nodemailer` para envio de mensagens transacionais de redefinição de palavra-passe.
3. **APIs Externas REST/SOAP:** **Declaradas FORA DE ESCOPO na V1.**

---

## 24. Segurança Funcional

- **Prevenção contra SQL Injection:** Todas as operações com o banco de dados PostgreSQL utilizam consultas parametrizadas na camada Model (ex: `pg.query('SELECT * FROM usuarios WHERE id = $1', [id])`).
- **Prevenção contra Cross-Site Scripting (XSS):** Sanitização de dados de entrada e auto-escape de variáveis na renderização dos templates HTML.
- **Proteção de Palavras-passe:** Hashes gerados com `bcrypt` com salt rounds de valor 10.
- **Segurança de Mensagens de Erro:** Em ambiente de produção, stack traces e detalhes internos de banco de dados são ocultados do utilizador final e gravados exclusivamente nos ficheiros de log.

---

## 25. Organização Sugerida da Implementação

A implementação do projeto pela IA codificadora deve ser realizada em 24 etapas progressivas e testáveis a partir do `[Diretório do Projeto - Repositório]`:

1. Preparação da estrutura de diretórios do repositório (`src`, `public`, `logs`, `docs`).
2. Configuração do `package.json` com dependências necessárias (`express`, `pg`, `express-session`, `connect-pg-simple`, `bcrypt`, `nodemailer`, `dotenv`).
3. Criação do módulo de configuração técnica em `src/config/index.js`.
4. Configuração da containerização Docker local (`Dockerfile` e `docker-compose.yml` para Node.js e PostgreSQL).
5. Estabelecimento do pool de ligações com o PostgreSQL em `src/database/connection.js`.
6. Criação do sistema de migrations e ficheiros SQL em `src/database/migrations/`.
7. Execução das migrations para criação das tabelas, chaves primárias, estrangeiras e índices.
8. Configuração do ficheiro de entrada `src/index.js` e Middlewares de ficheiros estáticos (`public/`).
9. Implementação do módulo de logging de erros em ficheiro (`src/utils/logger.js`).
10. Implementação da engine de templates HTML (Views) e inclusão do Bootstrap e estilos do `docs/DESIGN.md`.
11. Implementação do Model `Usuario` e Módulo de Autenticação (`bcrypt`, login, sessões).
12. Implementação do formulário e fluxo de Auto-Registo de Colaborador.
13. Implementação do fluxo e envio de e-mails de Recuperação de Palavra-passe via `Nodemailer`.
14. Implementação do Model `PerfilConfiguracao` e ecrã de Perfil do Colaborador.
15. Implementação dos Middlewares de Segurança (`auth.js` e `rbac.js`).
16. Implementação do Model `RegistoDiario` e fluxo de Início do Turno (Abertura).
17. Implementação do fluxo de Fecho do Turno com validações de Km e incidências.
18. Implementação do script client-side Vanilla JS para Rascunho Local (`localStorage`).
19. Implementação do Gerador de Mensagem do WhatsApp com botões de Copiar e Enviar.
20. Implementação do Model `AuditoriaRegisto` e fluxo de Edição de Registos Diários.
21. Implementação do Model e Controller do Dashboard com cartões de indicadores, gráfico e filtros.
22. Testes de integração das permissões de Operador vs. Administrador no Dashboard.
23. Revisão de segurança (sanitização XSS, queries parametrizadas SQL, tratamento de erros e contingência de logs).
24. Validação final e preparação da entrega.

---

## 26. Critérios de Aceitação Técnica e Funcional

Para considerar o sistema totalmente concluído, os seguintes critérios devem ser cumpridos:

- [ ] Arquitetura MVC respeitada com separação clara entre Models, Views e Controllers.
- [ ] Projeto estruturado a partir do `[Diretório do Projeto - Repositório]` sem dependência de nomes fixos de pastas públicas do servidor (`public_html`, `htdocs`, etc.).
- [ ] Configurações técnicas e credenciais concentradas no módulo `src/config/index.js` consumindo variáveis via `dotenv`.
- [ ] Estrutura do PostgreSQL totalmente criada e gerida através do mecanismo de Migrations em `src/database/migrations/`.
- [ ] Migrations protegidas contra execução duplicada e sem acesso público via navegador web.
- [ ] Índices de banco de dados criados para as colunas `(usuario_id, data_registo)` e `status`.
- [ ] Auto-registo criando contas com perfil `operador` com bloqueio de auto-elevação para `administrador`.
- [ ] Turno diário permitindo abertura com Km Inicial e fecho com validação matemática bloqueante ($\text{Km Final} \ge \text{Km Inicial}$ e $\sum \text{Incidências} \le \text{Objetos}$).
- [ ] Script de rascunho em `localStorage` prevenindo perda de dados por atualização do navegador.
- [ ] Gerador de texto do WhatsApp funcionando com botões de cópia e envio direto conforme o template oficial.
- [ ] Dashboard apresentando métricas corretas de Entregues, Incidências, Km, Eficiência (%) e filtros funcionais por período e colaborador.
- [ ] Edição de registos gerando histórico de auditoria com dados em JSONB.
- [ ] Inativação de utilizadores realizada via Soft Delete (`ativo = FALSE`).
- [ ] Logs de erro gravados em `logs/app-error.log` com limpeza aos 90 dias e contingência em arquivo funcionando se a base de dados falhar.
- [ ] Interface gráfica alinhada com o Design System em `docs/DESIGN.md` (CTT Red `#a8001c`, tipografia Inter, alvos de toque móveis min. 48px).

---

## 27. Pontos Pendentes e Decisões Futuras

Não foram identificadas pendências para iniciar a codificação com base neste FSD.

---

## 28. Conclusão

Este Documento de Especificação Funcional (FSD) está **100% concluído, consolidado, revisado e autossuficiente**, contendo todas as definições técnicas, operacionais, de banco de dados e de interface necessárias para orientar a IA codificadora na implementação completa do sistema **CAC Atividades**.

Ao iniciar a fase de codificação, devem ser fornecidos à IA codificadora os seguintes documentos presentes na pasta `docs/`:

- `docs/FSD.md`
- `docs/DESIGN.md`
