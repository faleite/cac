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
| **Fase 5** | Integração de Partilha e Comunicação com WhatsApp | 0% | Próxima |
| **Fase 6** | Dashboard de Indicadores, KPIs, Gráficos e Filtros | 0% | Pendente |
| **Fase 7** | Refinamento UI, Logs de Erro/Segurança e Homologação | 0% | Pendente |

**Progresso Geral Estimado:** ~57% (4 de 7 fases concluídas e validadas ponta a ponta)

---

## 2. Fase Concluída em Detalhe: Fase 4 (Módulo Operador: Abertura, Fecho, Incidências, Validações e Rascunho)

### Tarefas Concluídas
- [x] Criado módulo de cálculos operacionais `backend/src/utils/calculos.js` com fórmulas oficiais (FSD Seção 14):
  - $\text{Soma de Incidências} = \text{Avisados} + \text{Retornos} + \text{End. Insuficiente} + \text{Recusados} + \text{Desc. Morada}$.
  - $\text{Entregues Efetivos} = \text{Qtd Objetos} - \text{Soma(Incidências)}$.
  - $\text{Eficiência (\%)} = ((\text{Entregues} + \text{Recolhas}) / (\text{Objetos} + \text{Recolhas})) \times 100$ (com 0.00% em caso de divisão por zero).
  - $\text{Km Percorridos} = Km_{final} - Km_{inicial}$.
  - Validações matemáticas bloqueantes: $Km_{final} \ge Km_{inicial}$ e $\sum \text{Incidências} \le \text{Qtd Objetos}$.
- [x] Implementado `RegistoDiarioController` (`backend/src/controllers/RegistoDiarioController.js`):
  - `GET /api/registos/estado-atual`: Identificação de turno de hoje, pendência de dia anterior (não bloqueante com alerta em destaque) e carregamento de preferências de perfil (matrícula/giro habitual).
  - `POST /api/registos/abertura`: Abertura de jornada com validação de Km Inicial $\ge 0$, matrícula, giro e garantia de unicidade de turno diário por operador.
  - `POST /api/registos/fecho`: Fecho de jornada com contadores detalhados das 5 incidências, validações matemáticas e cálculo atômico de métricas.
  - `GET /api/registos`: Listagem com filtros por status e datas, com isolamento rigoroso por perfil (operador só vê seus turnos; admin pode auditar todos).
  - `GET /api/registos/:id`: Detalhes completos do turno com histórico de alterações.
  - `PUT /api/registos/:id`: Edição com motivo justificado obrigatório, recálculo de métricas e persistência atômica da auditoria em JSONB (`valores_antigos`, `valores_novos`) na tabela `auditoria_registos`.
- [x] Roteamento registrado em `backend/src/routes/registos.routes.js` e plugado em `/api/registos`.
- [x] Desenvolvido utilitário client-side de contingência `frontend/public/js/draft-storage.js` para persistência automática de digitação em `localStorage` com expiração de 24h e limpeza no envio com sucesso.
- [x] Desenvolvidas interfaces web com Design System Postal CTT:
  - `frontend/public/abertura.html`: Tela de início de turno com pré-preenchimento, alerta de pendência de dias anteriores e integração com rascunho local.
  - `frontend/public/fecho.html`: Tela de fim de turno com resumo da abertura, contadores ergonômicos (+/-) para as 5 incidências, painel de KPIs em tempo real (Km rodados, entregues efetivos, eficiência estimada) e bloqueios matemáticos.
  - `frontend/public/registos.html`: Histórico de turnos com cartões informativos, badges de status e modal interativo de edição justificada com auditoria.
  - Atualizada Bottom Navigation em todas as telas para navegação fluida entre Abertura, Fecho, Histórico e Perfil.
- [x] Criado e executado script de testes automatizados (`backend/src/utils/test-fase4.js`) com 25 asserções cobrindo regras matemáticas, constraints, RBAC e auditoria JSONB (100% aprovados).
- [x] Verificado funcionamento da suíte anterior (`test-fase3.js`) garantindo zero regressões.

---

## 3. Próxima Fase: Fase 5 (Integração de Partilha e Comunicação com WhatsApp)

### Próximos Passos
1. Implementar formatador oficial de mensagem de fim de turno no backend/frontend conforme o modelo oficial CTT em `docs/FSD.md` (Seção 8 e 14) e `docs/extras/01-modelo-mensagem-whatsapp.md`.
2. Criar endpoint / utilitário para geração de link deep link WhatsApp (`https://wa.me/?text=...` ou `whatsapp://send?text=...`) e botão de ação com cópia direta para a área de transferência (*clipboard*).
3. Integrar modal/tela de confirmação e partilha rápida pós-fechamento do turno.
4. Elaborar testes automatizados de formatação textual e caracteres especiais.

---

## 4. Histórico de Atualizações

| Data | Responsável | Ação Realizada |
|---|---|---|
| 2026-09-26 | Arquiteto de Software | Criação do `docs/PLANO.md`, `AGENTS.md`, `docs/STATUS.md` e `docs/ERROS.md`. Validação da Fase 1 (infraestrutura). |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 2: schema Prisma com 5 entidades + tabela de sessões, índices compostos, migration aplicada no PostgreSQL, seed idempotente com Admin e Operador, e teste automatizado de integridade. |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 3: autenticação com sessões persistentes em PostgreSQL, RBAC, recuperação de senha com tokens criptográficos, gestão de perfis e preferências, Design System CSS local e 5 telas web funcionais testadas ponta a ponta. |
| 2026-09-26 | Desenvolvedor Sênior | Implementação completa da Fase 4: módulo operador (abertura e fecho de turnos), contadores das 5 incidências, regras matemáticas estritas, auditoria JSONB atômica, persistência de rascunho local em localStorage e 25 testes automatizados aprovados. |
