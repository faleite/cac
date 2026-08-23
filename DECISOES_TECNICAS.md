# DECISÕES TÉCNICAS DO PROJETO

## 1. Documentos recebidos

- **`PRD.md` (`docs/PRD.md`):** Recebido e analisado na íntegra. Define o escopo funcional completo do **CAC Atividades V1**.
- **`DESIGN.md` (`docs/DESIGN.md`):** Recebido e analisado na íntegra. Define o sistema de design (*Postal Utility System / CTT Delivery Assistant*) com paleta de cores (destaque CTT Red `#a8001c`), tipografia Inter, espaçamento em grade de 4px, cantos arredondados (0.5rem / 8px) e componentes otimizados para uso operacional móvel.

---

## 2. Identificação do sistema

- **Nome do Sistema:** CAC Atividades (Controlo Atividades Correios).
- **Objetivo Principal:** Simplificar, padronizar e automatizar a rotina de registo diário de entregas e controlo de viaturas por estafetas e carteiros de serviços de correio e logística de última milha (*last-mile*), gerando automaticamente o relatório formatado para o WhatsApp e disponibilizando um painel visual de indicadores para a gestão.
- **Público Usuário:** Estafetas e carteiros (Operadores) e gerentes/supervisores de frota (Administradores).
- **Contexto de Uso:** Aplicação web responsiva otimizada prioritariamente para dispositivos móveis (telemóveis) e acessível também em computadores.
- **Resumo Funcional:** 
  - Auto-registo de colaborador e autenticação.
  - Registo do turno em duas etapas (abertura no início do dia e fecho no fim do dia).
  - Rascunho local de digitação no ecrã para prevenção de perda de dados.
  - Validações automáticas de integridade (quilometragem e limite de incidências).
  - Gerador de mensagem formatada para WhatsApp com botões de cópia e envio direto em 1 clique.
  - Dashboard visual com cartões de indicadores, gráfico de entregas e filtros por período (Dia, Semana, Mês, Ano) e por colaborador (exclusivo Administrador).

---

## 3. Decisões técnicas confirmadas

### Stack e Tecnologias
- **Linguagem / Backend:** Node.js com o framework web Express.
- **Interface / Frontend:** HTML5, CSS3 e JavaScript puro (Vanilla JS), estruturado e renderizado no servidor (SSR com views/templates).
- **Estilização / UI:** Bootstrap local alinhado com o Design System definido em `DESIGN.md` (paleta CTT Red `#a8001c`, tipografia Inter, componentes responsivos e touch targets mínimos de 48px).
- **Banco de Dados:** PostgreSQL.

### Ambientes
- **Ambiente de Desenvolvimento Local:** Containerização completa via Docker e Docker Compose (serviços de Node.js/Express e banco PostgreSQL em containers isolados).
- **Ambiente de Testes / Homologação:** Não haverá ambiente obrigatório de testes em nuvem na V1. A validação e os testes serão realizados no ambiente local Docker antes de qualquer publicação.
- **Ambiente de Produção:** Hospedagem em nuvem na Oracle Cloud Infrastructure (instância Compute/VM executando Node.js e PostgreSQL).
- **Deploy:** O processo de deploy será detalhado e tratado numa etapa própria do fluxo de trabalho.

### Arquitetura
- **Padrão Obrigatório:** Padrão MVC (Model-View-Controller).
  - **Model:** Responsável pela interação com o PostgreSQL, validações de dados e regras de negócio relativas a entidades.
  - **View:** Responsável pela renderização das páginas HTML/CSS/JS e exibição de interfaces responsivas ao utilizador.
  - **Controller:** Responsável por intermediar requisições HTTP, invocar as regras de negócio nos Models e retornar as respostas/views adequadas.

### Autenticação e Gestão de Sessão
- **Credenciais:** Autenticação via Número de Colaborador (SC) ou E-mail combinado com Palavra-passe.
- **Auto-Registo:** Formulário público de criação de conta que atribui automaticamente o perfil 'Operador' (bloqueando a auto-seleção de perfil Administrador).
- **Mecanismo de Sessão:** Sessões de servidor mantidas via Cookies seguros (`express-session`) com persistência na base de dados PostgreSQL (`connect-pg-simple`).
- **Recuperação de Palavra-passe:** Envio de e-mail com link/código de recuperação via biblioteca `Nodemailer`, configurado por variáveis de ambiente (`.env`).

### Usuários e Permissões (RBAC)
- **Perfis Definidos:**
  - **Operador (Colaborador):** Acesso estrito aos seus próprios registos diários, ao seu próprio perfil e ao seu próprio dashboard pessoal.
  - **Administrador (Gestor):** Visão gerencial sobre toda a frota, acesso a dashboards consolidados e individuais, e permissão para editar registos de atividade de qualquer colaborador.
- **Segurança de Perfil:** Bloqueio rígido de auto-elevação de perfil no backend.

### Auditoria e Histórico
- **Auditoria de Registos Diários:** Qualquer edição efetuada num registo de atividade já existente gera obrigatoriamente um histórico de auditoria registando o autor da alteração, a data/hora exata e os valores antigos vs. novos.

### Soft Delete e Preservação de Dados
- **Inativação Lógica:** A inativação de um utilizador altera o seu estado para `Inativo` na base de dados, garantindo a preservação do histórico de entregas sem exclusão física dos dados.

### Logs e Diagnóstico
- **Logs de Erros:** Gravação silenciosa de falhas críticas em ficheiros de texto locais `.txt` no servidor, fora da pasta pública web, com rotina de limpeza automática aos 90 dias.
- **Contingência de Log:** Caso a conexão com a base de dados falhe ou o próprio erro impeça a gravação em banco, o sistema usará a gravação em ficheiro de texto como mecanismo de contingência.
- **Logs de Segurança:** Registo de eventos sensíveis (tentativas de login inválidas, acessos negados, alterações de permissão e edições em registos operacionais).

### Recursos de Digitação Local
- **Rascunho no Ecrã:** Preservação temporária no navegador (ex: `localStorage`) dos números digitados nos formulários de abertura/fecho, evitando perda de dados por recarregamento acidental da página.

### Comunicação WhatsApp
- **Integração sem Custos:** Geração de texto formatado com redirecionamento via protocolo web (`https://wa.me/?text=...`) e botão de cópia direta para a área de transferência (`navigator.clipboard`). Sem necessidade de API paga do WhatsApp.

### Segurança da Aplicação
- Senhas armazenadas com algoritmo de hash seguro (ex: `bcrypt`).
- Cookies configurados com `httpOnly`, `secure` (em produção) e `sameSite`.
- Proteção contra SQL Injection via consultas parametrizadas na camada Model.
- Proteção contra XSS na renderização de dados.

### Desempenho da Base de Dados
- O FSD deverá avaliar a inclusão de índices no PostgreSQL nas colunas mais consultadas em filtros do Dashboard e listagens, como datas de abertura/fecho (`data_registo`), ID do colaborador (`usuario_id`) e estado do turno (`status`).

---

## 4. Decisões adotadas por padrão

As seguintes decisões foram estabelecidas com base nas respostas e confirmações consolidadas durante o alinhamento técnico:

1. **Stack Tecnológica:** Adotada a combinação Node.js (Express), HTML, CSS, JavaScript puro, PostgreSQL, Bootstrap local e arquitetura MVC.
2. **Ambiente Local:** Adotada a containerização com Docker / Docker Compose para Node.js e PostgreSQL.
3. **Ambiente de Testes:** Adotada a ausência de ambiente dedicado de homologação em nuvem na V1, realizando todas as validações no ambiente local Docker.
4. **Ambiente de Produção:** Adotada a hospedagem na Oracle Cloud Infrastructure.
5. **Gestão de Sessão:** Adotadas sessões de servidor via cookies seguros com armazenamento no PostgreSQL (`express-session` + `connect-pg-simple`).
6. **Provedor de E-mail (SMTP):** Adotada a abstração com `Nodemailer` e variáveis de ambiente (`.env`), utilizando Mailtrap/Ethereal em desenvolvimento e SMTP transacional genérico em produção.
7. **Roteiro para IA Codificadora:** Adotada a inclusão de orientações no FSD para implementação em etapas pequenas, progressivas e testáveis.

---

## 5. Stack e ambientes

| Componente | Tecnologia / Solução |
| ---------- | -------------------- |
| **Linguagem Backend** | Node.js (v18+ LTS) |
| **Framework Web** | Express.js |
| **Linguagem Frontend** | HTML5, CSS3, JavaScript Vanilla (ES6+) |
| **Framework UI / CSS** | Bootstrap (ficheiros locais, sem dependência de CDN externa) |
| **Design System** | *Postal Utility System* (conforme `DESIGN.md`: CTT Red `#a8001c`, fonte Inter) |
| **Banco de Dados** | PostgreSQL |
| **Sessão & Autenticação** | `express-session` + `connect-pg-simple` + `bcrypt` |
| **E-mail Transacional** | `Nodemailer` (configurado via `.env`) |
| **Ambiente Local** | Docker & Docker Compose |
| **Ambiente de Testes** | Validação local (Docker) antes da publicação |
| **Ambiente de Produção** | Oracle Cloud Infrastructure (VM / Compute) |

---

## 6. Arquitetura obrigatória

O sistema deverá implementar estritamente a arquitetura **MVC (Model-View-Controller)**:

- **Models:** Conterão a lógica de acesso aos dados (consultas SQL parametrizadas para PostgreSQL), validações de regras de negócio (cálculo de eficiência, validações matemáticas de Km e incidências) e operações de auditoria.
- **Views:** Páginas HTML renderizadas pelo servidor, consumindo os estilos do Bootstrap e do `DESIGN.md`, otimizadas para touch em telemóveis (botões min. 48px, inputs min. 56px).
- **Controllers:** Tratarão a recepção de requisições HTTP, verificação de sessão/permissões via middleware, acionamento das regras nos Models e renderização das Views ou respostas JSON.

---

## 7. Recursos estruturais definidos

- **Autenticação:** Sim (E-mail/SC + Senha, auto-registo, recuperação por e-mail).
- **RBAC (Controlo de Acesso por Perfil):** Sim (Operador e Administrador).
- **Auditoria:** Sim (Tabela de histórico de edições em registos diários).
- **Soft Delete:** Sim (Estado `Inativo` para utilizadores).
- **Log de Erros:** Sim (Gravação silenciosa em ficheiros `.txt` com limpeza aos 90 dias e contingência em arquivo).
- **Log de Segurança:** Sim (Gravação de falhas de login, acessos negados e edições de registros).
- **Configurações Globais:** Apenas configurações de perfil de utilizador (Matrícula Padrão e Giro Padrão).
- **Uploads e Anexos:** Não (Fora de escopo na V1).
- **Exportações PDF/Excel:** Não (Fora de escopo na V1).
- **APIs / Integrações Externas:** Não (Apenas integração via URL nativa do WhatsApp e SMTP para e-mails).

---

## 8. Perfis e permissões em nível alto

- **Operador (Colaborador):**
  - Registar abertura (Km Inicial, Matrícula, Giro) e fecho de turno (Km Final, Objetos, Recolhas, Incidências).
  - Visualizar e gerir o seu perfil pessoal (alterar senha, Matrícula padrão, Giro padrão).
  - Visualizar o seu próprio dashboard operacional (suas métricas e gráficos).
  - Copiar e enviar o relatório formatado para o WhatsApp.
  - Editar os seus próprios registos diários (gerando registo de auditoria).
- **Administrador (Gestor):**
  - Aceder a todas as funcionalidades de Operador.
  - Visualizar o dashboard consolidado de toda a frota ("Toda a Empresa").
  - Filtrar o dashboard por qualquer colaborador individual.
  - Editar registos diários de qualquer colaborador (gerando registo de auditoria).

---

## 9. Entidades prováveis em nível alto

O FSD deverá considerar e estruturar as seguintes entidades principais na base de dados PostgreSQL:

1. **`usuarios` (Utilizadores):** Guarda dados de conta (Nome, SC, Telemóvel, E-mail, Senha hash, Perfil `operador`/`administrador`, Estado `ativo`/`inativo`).
2. **`perfis_configuracao` (Configurações de Perfil):** Guarda preferências habituais do colaborador (Matrícula de Veículo Padrão, Código do Giro Padrão).
3. **`registos_diarios` (Turnos Diários):** Guarda os dados operacionais do dia (Data, Km Inicial, Km Final, Matrícula do dia, Giro do dia, Qtd Objetos, Qtd Recolhas, Incidências: Avisados, Retornos, End. Insuficiente, Recusados, Desc. Morada, Status `aberto`/`fechado`, referências de criação e atualização).
4. **`auditoria_registos` (Histórico de Auditoria):** Guarda as edições realizadas em registos diários (ID do registo, ID de quem alterou, data/hora, valores antigos em JSON, valores novos em JSON).
5. **`logs_seguranca` (Eventos de Segurança):** Guarda ocorrências de segurança relevantes (Tentativas de login falhadas, acessos negados, edições).

---

## 10. Módulos, telas e fluxos esperados em nível alto

O FSD deverá detalhar os seguintes módulos e telas:

1. **Módulo de Autenticação e Perfil:**
   - Tela de Login (Entrada por SC ou E-mail + Senha, link de recuperação).
   - Tela de Auto-Registo de Colaborador.
   - Tela de Solicitação de Recuperação de Palavra-passe.
   - Tela de Perfil do Utilizador (Edição de dados pessoais, senha, veículo padrão e giro padrão).
2. **Módulo de Controlo Diário de Atividade:**
   - Tela de Início de Turno / Abertura (Km Inicial, confirmação de Matrícula e Giro).
   - Tela de Fecho de Turno (Km Final, Objetos, Recolhas, 5 tipos de incidências).
   - Alerta visual de pendência do dia anterior (não bloqueante).
   - Mecanismo de rascunho local de digitação no ecrã (`localStorage`).
   - Tela/Modal de Edição de Registo Diário com justificativa/auditoria.
3. **Módulo de Comunicação (WhatsApp):**
   - Ecrã de Confirmação com relatório formatado pré-visualizado.
   - Botão de Ação Rápida: "Copiar Texto" (`navigator.clipboard`).
   - Botão de Ação Rápida: "Enviar para WhatsApp" (`https://wa.me/?text=...`).
4. **Módulo de Dashboard e Indicadores:**
   - Ecrã de Dashboard com Cartões de Indicadores (Entregues, Incidências, Km Percorridos, Eficiência %, Dias Ativos).
   - Gráfico de Entregas (Efetivadas vs. Não Efetivadas).
   - Controlo de Filtros por Período (Hoje/Dia, Esta Semana, Este Mês, Este Ano).
   - Seletor de Colaborador (Exclusivo Administrador: "Toda a Empresa" vs Colaborador Específico).

---

## 11. Alertas para relatórios, consultas, exportações e desempenho

- **Relatórios:** Restritos à exibição dinâmica no Dashboard em ecrã.
- **Exportações:** Não haverá geração de ficheiros PDF ou Excel na V1.
- **Alertas de Desempenho para o FSD:**
  - O FSD deve especificar índices compostos ou individuais no PostgreSQL para a tabela `registos_diarios` nas colunas (`usuario_id`, `data_registo`) e `status` para garantir resposta instantânea nos dashboards e filtros temporais.

---

## 12. Alertas para uploads, anexos e arquivos

- **Recurso de Upload:** **Confirmado como FORA DE ESCOPO na V1.**
- Não haverá formulários de envio de imagem, comprovativos ou documentos. O FSD não deve criar estruturas ou rotas de upload nesta versão.

---

## 13. Alertas para logs, auditoria e segurança

- **Gravação de Logs:** Gravação de erros da aplicação em ficheiros `.txt` armazenados no diretório do servidor fora da raiz pública web (ex: `/logs/app-error.log`).
- **Limpeza Automática:** Implementação de rotina de retenção/limpeza automática de logs com idade superior a 90 dias.
- **Contingência:** Se o banco PostgreSQL falhar, o sistema deve registar o erro silenciosamente no ficheiro de texto sem expor detalhes técnicos ao utilizador final.
- **Mensagens Amigáveis:** Exibir telas de erro genéricas ("Ocorreu um erro inesperado. Tente novamente mais tarde.") sem expor stack traces ou dados sensíveis de banco de dados.
- **Segurança:**
  - Armazenamento de palavras-passe obrigatoriamente com `bcrypt` (fator de custo apropriado).
  - Sanitização de inputs para prevenir XSS.
  - Consultas parametrizadas no PostgreSQL para prevenir SQL Injection.
  - Cookies de sessão com flags `HttpOnly`, `SameSite=Lax` e `Secure` (em produção).

---

## 14. Itens que não devem ser inventados

Os seguintes recursos **NÃO** foram aprovados e **NÃO DEVEM** ser incluídos no FSD:

- Tela visual de administração de utilizadores (criação/edição gráfica de contas pelo Admin).
- Motor de sincronização offline avançado (PWA offline queue/service worker sync).
- Campo de quantidade de paragens.
- Calculadora de comissões ou valores financeiros.
- Exportação de relatórios para PDF, Excel ou CSV.
- Upload de anexos, fotos ou comprovativos.
- Rastreamento por GPS, mapas ou otimização de rotas.
- Leitor de códigos de barras ou QR Code via câmara.
- Integração via API com sistemas centrais dos Correios ou plataformas de e-commerce.

---

## 15. Pendências não bloqueantes

"Não foram identificadas pendências não bloqueantes para a criação do FSD."

---

## 16. Pronto para o FSD

As decisões técnicas do projeto estão **100% consolidadas e finalizadas**, estando o projeto completamente pronto para a fase de especificação detalhada no FSD.

**Próximo Passo:**
Gerar o documento oficial de especificação funcional e técnica:
- `docs/FSD.md`

**Fontes Obrigatórias para o FSD:**
- `docs/PRD.md`
- `docs/DECISOES_TECNICAS.md`
- `docs/DESIGN.md`
