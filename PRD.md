# DOCUMENTO DE REQUISITOS DO PRODUTO (PRD)

## 1. Visão Geral do Produto

- **Nome Provisório do Sistema:** **CAC Atividades** (Controlo Atividades Correios).
- **Descrição Resumida:** O CAC Atividades é um sistema web responsivo (otimizado para telemóveis e computadores) desenvolvido para simplificar, padronizar e automatizar a rotina de registo diário de entregas e controlo de viaturas por parte de estafetas e carteiros de serviços de correio e logística de última milha (*last-mile*). O sistema permite o registo do turno em duas etapas (início e fim do dia), gera a mensagem formatada para partilha direta no WhatsApp da empresa e disponibiliza um painel de indicadores com métricas visuais de qualidade e produtividade.
- **Público Principal:** Estafetas e carteiros (como utilizadores operacionais do dia a dia) e gerentes/supervisores de frota (como utilizadores administradores).
- **Principal Benefício Esperado:** Eliminar o preenchimento manual e despadronizado de relatórios, reduzir erros de contagem e cálculo de incidências, fornecer visibilidade imediata dos quilómetros percorridos e da taxa de eficiência das entregas, e simplificar a comunicação diária via WhatsApp com o menor custo e esforço de desenvolvimento possível na V1.
- **Contexto Geral de Uso:** O estafeta acede ao sistema no início do dia no seu telemóvel para registar a quilometragem inicial e a rota. Ao longo do preenchimento, o formulário guarda um rascunho local simples para evitar perda de dados por recarregamento de página. Ao final do turno, regista a quilometragem final, objetos recolhidos e pacotes não entregues (incidências). O sistema valida os dados, calcula as métricas e disponibiliza a mensagem pronta para envio ao grupo da empresa via WhatsApp. Os gestores acedem ao sistema para consultar os indicadores globais e individuais da equipa no Dashboard.

---

## 2. Problema que o Sistema Resolve

Atualmente, o processo de acompanhamento de atividade dos estafetas é realizado de forma manual ou despadronizada. O sistema resolve as seguintes dores e dificuldades:

- **Relatórios manuais e despadronizados:** Cada estafeta escreve o seu resumo diário de forma diferente no grupo de WhatsApp, originando erros de digitação, omissão de dados essenciais e dificuldade de leitura por parte da chefia.
- **Falta de controlo sobre o uso de viaturas:** Dificuldade em acompanhar a quilometragem real percorrida por cada veículo em serviço de entregas, misturando a utilização profissional com deslocações pessoais.
- **Processamento manual de dados de desempenho:** Gestores perdem tempo a somar manualmente os pacotes entregues, avisados e devolvidos para calcular a eficiência da equipa.
- **Risco de perda de dados digitados:** Estafetas correm o risco de perder os números já digitados no ecrã se a página do telemóvel for recarregada acidentalmente.
- **Falta de histórico e auditabilidade:** Ausência de um registo centralizado e seguro onde seja possível consultar o histórico de dias anteriores e identificar quem fez edições num registo.

---

## 3. Objetivos do Sistema

### Objetivo Principal
Disponibilizar uma plataforma web simples, enxuta e intuitiva, acessível via telemóvel, que permita aos estafetas registar o seu trabalho diário em menos de 2 minutos, gerar o relatório formatado para o WhatsApp e fornecer à gestão indicadores visuais e precisos de eficiência e utilização de viaturas.

### Objetivos Específicos
1. **Padronizar a comunicação diária:** Gerar automaticamente o texto formatado para envio no grupo de WhatsApp com 100% de conformidade com o modelo exigido pela empresa.
2. **Garantir a integridade dos dados:** Bloquear registos com inconsistências matemáticas (como quilometragem final inferior à inicial ou número de falhas superior ao total de pacotes).
3. **Preservar a digitação do utilizador:** Guardar temporariamente um rascunho local dos números inseridos no ecrã do telemóvel para prevenir perdas por fecho acidental do navegador.
4. **Simplificar o acompanhamento gerencial:** Apresentar gráficos e cartões de indicadores (taxa de eficiência, Km percorridos, volumes entregues vs. pendentes) com filtros por período (dia, semana, mês, ano) e por colaborador.
5. **Preservar a memória histórica e auditoria:** Manter o histórico de todas as alterações feitas nos registos diários com registo de autor e data/hora.

---

## 4. Personas e Perfis de Usuário

| Perfil | Descrição simples | Principais ações no sistema | Permissões básicas |
| ------ | ----------------- | --------------------------- | ------------------ |
| **Operador / Colaborador** | Estafeta, carteiro ou prestador de serviços de entrega de última milha. | Registar abertura/fecho do dia, editar dados do seu perfil (matrícula/giro padrão), copiar/enviar relatório para o WhatsApp, consultar as suas próprias métricas diárias e mensais no Dashboard. | Acesso exclusivo aos seus próprios registos e ao seu próprio dashboard pessoal. Pode editar os seus próprios registos a qualquer momento (com registo de auditoria). |
| **Administrador** | Gerente, supervisor ou diretor de operações da empresa de entregas. | Acompanhar os indicadores operacionais da empresa, consultar o Dashboard consolidado da frota ou filtrar por colaborador específico, e editar registos diários caso necessário. *(Nível de acesso gerencial)* | Acesso de leitura a todos os dashboards e dados da equipa. A gestão de utilizadores e permissões na V1 é suportada na base de dados (backend) sem telas de cadastro complexas. |

---

## 5. Escopo da Primeira Versão

As funcionalidades confirmadas para a V1 estão agrupadas por áreas funcionais:

### A. Área de Autenticação e Perfil do Utilizador
- **Auto-Registo de Colaborador:** Permite que um novo estafeta crie a sua conta na ecrã inicial informando Nome Completo, Número de Telemóvel, Número de Colaborador (SC), E-mail e Palavra-passe. A conta é criada automaticamente com o perfil 'Operador'.
  - *Regra:* O formulário não permite auto-seleção da função de Administrador.
- **Início de Sessão (Login):** Autenticação através do Número de Colaborador (SC) ou E-mail combinado com a Palavra-passe.
- **Recuperação de Palavra-passe:** Funcionalidade na ecrã de login para solicitar o envio de um link/código de recuperação para o e-mail cadastrado.
- **Gestão de Perfil Pessoal:** Permite ao colaborador visualizar e atualizar os seus dados básicos, alterar a sua própria palavra-passe e definir a sua **Matrícula de Veículo Padrão** e o seu **Código de Giro Padrão** (ex: 2825H).

### B. Área de Controlo Diário de Atividade
- **Registo em Duas Etapas (Abertura e Fecho):**
  - **Início do Turno (Abertura):** O colaborador informa manualmente o **Km Inicial** (digitado do zero devido ao uso do veículo na deslocação casa-trabalho). A Matrícula do Veículo e o Código do Giro surgem pré-preenchidos a partir do perfil, mas podem ser alterados pontualmente caso haja troca de viatura ou rota.
  - **Fim do Turno (Fecho):** O colaborador informa o **Km Final**, confirma o **Giro**, insere a **Quantidade de Objetos** totais do dia, a **Quantidade de Recolhas** e o detalhamento das incidências (Avisados, Retornos, Endereço Insuficiente, Recusados e Desconhecidos na Morada).
- **Rascunho Local de Digitação:** O formulário guarda temporariamente no ecrã os números inseridos à medida que o colaborador digita, evitando que os dados se percam caso a página seja recarregada involuntariamente. *(Nota: O envio final do turno exige ligação ativa à internet)*.
- **Aviso de Pendência do Dia Anterior:** Ao aceder ao sistema, se existir um registo do dia anterior sem fecho (Km final/incidências em branco), o sistema apresenta um aviso em destaque solicitando o preenchimento pendente.
  - *Regra:* O aviso não é bloqueante; o colaborador pode deixar pendente e abrir o novo turno se necessário.
- **Edição com Histórico de Auditoria:** O colaborador ou o administrador podem editar um registo diário a qualquer momento. O sistema regista internamente quem alterou, quando alterou e quais eram os valores anteriores.

### C. Área de Comunicação (WhatsApp)
- **Gerador de Mensagem Formatada:** Monta automaticamente o relatório final do dia no formato exato estipulado pela empresa.
- **Botões de Ação Rápida:** Apresenta na ecrã dois botões destacados:
  1. **Copiar Texto:** Copia a mensagem formatada para a área de transferência do telemóvel com 1 clique.
  2. **Enviar para WhatsApp:** Abre a aplicação do WhatsApp (ou WhatsApp Web) diretamente na conversa/grupo com o texto pronto para envio.

### D. Área de Acompanhamento e Dashboards
- **Painel de Indicadores (Dashboard):** Exibe cartões de resumo com:
  - Total de Objetos Entregues Efetivamente.
  - Total de Incidências (Objetos Não Entregues).
  - Quilómetros Totais Percorridos.
  - Taxa de Eficiência (%).
  - Dias de Atividade Registados.
- **Gráfico de Entregas:** Gráfico simples comparando Entregas Efetivadas vs. Entregas Não Efetivadas.
- **Filtros por Período:** Permite selecionar visualizações por Dia, Semana, Mês e Ano.
- **Visão Diferenciada por Perfil:**
  - O *Operador* visualiza apenas as suas próprias métricas.
  - O *Administrador* possui um seletor para alternar entre a visão global ("Toda a Empresa") e a visão individual de um colaborador específico.

### E. Estrutura de Suporte Técnico (Backend & Logs)
- **Suporte a Múltiplos Perfis na Base de Dados:** O sistema armazena a função (`operador` / `administrador`) e o estado (`ativo` / `inativo`) diretamente na base de dados para suportar a diferenciação de acesso ao Dashboard e preparar a expansão futura.
- **Logs Silenciosos de Erros:** Gravação automática em ficheiros de texto locais apenas para erros críticos do sistema, com rotina de limpeza automática após 90 dias (sem impacto de custos em nuvem).

---

## 6. Funcionalidades Fora de Escopo

As seguintes funcionalidades **NÃO** farão parte da primeira versão (V1) e foram explicitamente movidas para a **V2**:

1. **Telas de Gestão de Administrador (Interface UI):** Painel visual para o Administrador criar, editar, alterar perfis, inativar utilizadores graficamente, fazer upload de logotipo/paleta de cores e clicar para descarregar ficheiros de log.
   - *Motivo de ter ficado de fora:* Simplifica o desenvolvimento da V1 removendo código de telas administrativas secundárias. No início, a gestão inicial de contas pode ser feita diretamente na base de dados ou via auto-registo.
2. **Sincronização Offline Completa (PWA Engine):** Motor de fila de envio e sincronização de dados no plano de fundo para zonas sem internet.
   - *Motivo de ter ficado de fora:* Evita alta complexidade de código e potenciais bugs de sincronização. A V1 conta apenas com rascunho de digitação no ecrã e requer internet para o envio final do turno.
3. **Registo de Quantidade de Paragens:** Campo "Qtd Paragens" no formulário de fecho.
   - *Motivo de ter ficado de fora:* Os colaboradores nem sempre sabem informar a quantidade exata de paragens e o dado só será necessário quando houver cálculo de comissões.
4. **Calculadora e Previsão de Comissões:** Módulo financeiro para calcular ganhos em dinheiro no final do mês.
5. **Exportação de Relatórios em PDF ou Excel:** Geração de ficheiros para descarregamento ou impressão formal.
6. **Anexo de Fotos ou Comprovativos de Incidência:** Registo fotográfico de avisos deixados ou moradas inexistentes.
7. **Rastreamento GPS em Tempo Real e Otimização de Rotas:** Mapa interativo de localização da viatura.
8. **Leitura de Código de Barras / QR Code via Câmara:** Digitalização de etiquetas de pacotes pelo telemóvel.
9. **Integração Automática via API com os Correios:** Importação direta de listas de objetos a partir dos sistemas centrais postais.

---

## 7. Regras de Negócio

### A. Regras de Cálculo e Fórmulas
1. **Quantidade de Objetos Entregues Efetivos:**
   $$\text{Entregues} = \text{Qtd Objetos} - (\text{Avisados} + \text{Retornos} + \text{End. Insuficiente} + \text{Recusados} + \text{Desconhecidos na Morada})$$
2. **Taxa de Eficiência (%):**
   $$\text{Eficiência (\%)} = \left( \frac{\text{Objetos Entregues} + \text{Qtd Recolhas}}{\text{Qtd Objetos} + \text{Qtd Recolhas}} \right) \times 100$$
3. **Quilómetros Percorridos:**
   $$\text{Km Percorridos} = \text{Km Final} - \text{Km Inicial}$$

### B. Regras de Validação de Dados
4. **Validação de Quilometragem (Bloqueante):** O sistema impede o envio do formulário e destaca o campo a vermelho se o $\text{Km Final} < \text{Km Inicial}$.
5. **Validação de Incidências (Bloqueante):** O sistema impede o envio do formulário e destaca os campos a vermelho se o somatório de todas as incidências ($\text{Avisados} + \text{Retornos} + \text{End. Insuficiente} + \text{Recusados} + \text{Desconhecidos na Morada}$) for estritamente maior do que a $\text{Quantidade de Objetos}$ declarada.
6. **Entrada Manual de Km Inicial:** O Km inicial deve ser digitado manualmente a cada novo dia, sem puxar automaticamente o Km final do dia anterior (devido ao uso do veículo em deslocações pessoais casa-trabalho).

### C. Regras de Acesso, Edição e Auditoria
7. **Preservação de Dados de Utilizador:** Na base de dados, a inativação de um utilizador é feita alterando o seu estado para `Inativo` (sem exclusão física do registo), garantindo a preservação do histórico para relatórios e auditoria.
8. **Histórico Transparente de Edição:** Qualquer edição realizada num registo diário já guardado gera automaticamente um registo de auditoria contendo o nome de quem alterou, data/hora exata e os valores antigos vs. novos.
9. **Bloqueio de Auto-Elevação de Perfil:** Um utilizador com perfil 'Operador' não pode alterar o seu próprio perfil para 'Administrador'.
10. **Aviso Não Bloqueante de Pendência:** Um fecho pendente do dia anterior gera um alerta visual no login, mas não impede a abertura de um novo turno.

---

## 8. Informações que o Sistema Precisa Controlar

| Informação | Para que serve no sistema | Observações importantes |
| ---------- | ------------------------- | ----------------------- |
| **Utilizadores** | Registar os dados de conta de estafetas e administradores para acesso ao sistema. | Controla Nome Completo, Nº Colaborador (SC), Telemóvel, E-mail, Palavra-passe encriptada, Perfil (`operador` / `administrador`) e Estado (`ativo` / `inativo`). |
| **Perfil Pessoal / Veículo** | Armazenar os dados de transporte e rota habituais do colaborador. | Guarda a Matrícula do Veículo Padrão e o Código do Giro Padrão (ex: 2825H). |
| **Registo Diário de Atividade** | Armazenar os dados de abertura e fecho do turno de trabalho de cada dia. | Contém Km Inicial, Km Final, Matrícula do dia, Giro do dia, Qtd Objetos, Qtd Recolhas, detalhamento de cada uma das 5 incidências, data/hora de abertura, data/hora de fecho e estado do turno (`aberto` / `fechado`). |
| **Histórico de Auditoria** | Registar todas as edições feitas em registos existentes para fiscalização. | Guarda a identificação de quem alterou, a data/hora exata e o detalhamento das modificações realizadas. |
| **Logs de Erro da Aplicação** | Registar falhas técnicas do sistema para diagnóstico e suporte. | Armazenados em ficheiros de texto (.txt) no servidor com limpeza automática aos 90 dias. |

---

## 9. Fluxos Principais de Uso

### Fluxo 1: Auto-Registo e Configuração Inicial do Colaborador
1. O estafeta acede à página inicial do sistema no navegador do telemóvel.
2. O estafeta clica em "Criar Conta".
3. O sistema exibe o formulário de registo solicitando Nome, Telemóvel, Nº Colaborador (SC), E-mail e Palavra-passe.
4. O estafeta preenche os dados e confirma o registo.
5. O sistema valida os dados, cria a conta com o perfil 'Operador' e efetua o login automaticamente.
6. O sistema sugere o preenchimento do perfil com a Matrícula do Veículo e o Giro habitual.

### Fluxo 2: Início do Turno Diário (Abertura)
1. O colaborador acede ao sistema no início do dia de trabalho.
2. O sistema verifica se existe algum dia anterior pendente e, se houver, exibe um alerta visual (permitindo fechar o anterior ou continuar).
3. O colaborador clica em "Iniciar Dia de Trabalho".
4. O sistema exibe o formulário de abertura trazendo a Matrícula e o Giro pré-preenchidos a partir do perfil.
5. O colaborador digita manualmente o **Km Inicial** do veículo (e ajusta a matrícula/giro se tiver trocado de carrinha/rota).
6. O colaborador clica em "Guardar Início".
7. O sistema regista a abertura e altera o estado do dia para 'Aberto'.

### Fluxo 3: Fecho do Turno Diário e Envio para o WhatsApp
1. O colaborador acede ao sistema ao final do dia de trabalho.
2. O colaborador seleciona o registo 'Aberto' do dia e clica em "Fechar Dia".
3. O sistema exibe o formulário de fecho.
4. O colaborador insere o Km Final, Qtd Objetos, Qtd Recolhas e a quantidade de cada incidência (Avisados, Retornos, End. Insuficiente, Recusados, Desc. Morada).
5. O colaborador clica em "Finalizar e Gerar Relatório".
6. O sistema valida as regras de negócio ($\text{Km Final} \ge \text{Km Inicial}$ e $\text{Incidências} \le \text{Objetos}$). Se houver erro, destaca os campos a vermelho.
7. Se os dados forem válidos, o sistema guarda o registo, calcula a eficiência e exibe a mensagem formatada na ecrã com os botões "Copiar Texto" e "Enviar para WhatsApp".
8. O colaborador clica em "Enviar para WhatsApp" e é redirecionado diretamente para a aplicação do WhatsApp com o texto pronto para publicação no grupo da empresa.

### Fluxo 4: Acompanhamento de Métricas pelo Administrador
1. O Administrador faz login no sistema.
2. O sistema exibe o Dashboard com a visão consolidada de toda a empresa.
3. O Administrador utiliza o seletor de colaboradores para escolher um estafeta específico.
4. O sistema atualiza instantaneamente os cartões de indicadores (Entregues, Incidências, Km, Eficiência %) e o gráfico para o colaborador selecionado.
5. O Administrador altera o filtro de período para analisar o desempenho semanal ou mensal da equipa.

---

## 10. Histórias de Usuário

- **HU01:** "Como **estafeta**, eu quero registar o meu Km inicial e dados da rota no início do dia para abrir o meu turno de trabalho de forma rápida no telemóvel."
- **HU02:** "Como **estafeta**, eu quero registar as minhas entregas, recolhas e incidências no final do dia para fechar o meu turno e ver a minha eficiência."
- **HU03:** "Como **estafeta**, eu quero gerar um texto formatado automaticamente e ter um botão de envio direto para o WhatsApp para não ter de digitar o relatório manualmente no grupo da empresa."
- **HU04:** "Como **estafeta**, eu quero que o formulário guarde um rascunho da minha digitação no ecrã para não perder os números caso a página do navegador seja recarregada acidentalmente."
- **HU05:** "Como **administrador**, eu quero visualizar um dashboard com filtros por período e por colaborador para acompanhar a eficiência e os quilómetros percorridos por toda a frota."

---

## 11. Critérios de Aceitação

### Módulo de Registo Diário e Validações
- [ ] O sistema permite a abertura do turno informando apenas o Km Inicial, Matrícula e Giro.
- [ ] O sistema impede a conclusão do fecho do dia se o Km Final for inferior ao Km Inicial, exibindo alerta em vermelho no campo.
- [ ] O sistema impede a conclusão do fecho do dia se a soma das 5 incidências for superior à Quantidade de Objetos declarada, exibindo alerta em vermelho nos campos.
- [ ] O sistema exibe o aviso de pendência caso exista um dia anterior sem fecho, permitindo avançar para o novo turno sem bloquear o utilizador.
- [ ] O sistema mantém os números digitados no ecrã mesmo se o utilizador recarregar a página antes de guardar o formulário.
- [ ] O sistema permite editar registos antigos e grava uma linha na tabela de auditoria com a identificação do autor e data/hora da alteração.

### Módulo de Comunicação WhatsApp
- [ ] A mensagem gerada pelo sistema contém exatamente a estrutura, maiúsculas, negritos e campos especificados no modelo de texto.
- [ ] O botão "Copiar Texto" coloca com sucesso a mensagem formatada na área de transferência do dispositivo.
- [ ] O botão "Enviar para WhatsApp" abre a aplicação do WhatsApp (ou WhatsApp Web) com o texto preenchido corretamente.

### Módulo de Dashboard
- [ ] O Administrador consegue filtrar os indicadores por qualquer colaborador individual ou visualizar a soma total da empresa.
- [ ] Os cartões de Eficiência (%), Objetos Entregues, Incidências e Km Percorridos recalculam corretamente ao alterar os filtros de período (Dia, Semana, Mês, Ano).
- [ ] O Operador visualiza exclusivamente os seus próprios indicadores operacionais.

---

## 12. Consultas, Relatórios e Indicadores

### Informações Exibidas no Dashboard
- **Cartão Objetos Entregues:** Somatório de todos os pacotes entregues com sucesso ($\text{Qtd Objetos} - \text{Incidências}$).
- **Cartão Incidências (Não Entregues):** Somatório total de pacotes não entregues (soma de Avisados, Retornos, End. Insuficiente, Recusados e Desconhecidos na Morada).
- **Cartão Distância Percorrida:** Somatório total de quilómetros rodados ($\text{Km Final} - \text{Km Inicial}$).
- **Cartão Taxa de Eficiência (%):** Percentual médio de sucesso de entregas e recolhas calculado pela fórmula oficial.
- **Gráfico Comparativo:** Gráfico de barras ou tarte exibindo a proporção de Entregas Efetivadas vs. Não Efetivadas.

### Filtros Obrigatórios
- **Filtro Temporal:** Seleção rápida entre Hoje (Dia), Esta Semana, Este Mês e Este Ano.
- **Filtro de Colaborador (Exclusivo Admin):** Menu suspenso para selecionar um estafeta específico ou a opção "Todos os Colaboradores".

---

## 13. Permissões e Segurança Funcional

| Perfil | Pode fazer | Não pode fazer | Observações |
| ------ | ---------- | -------------- | ----------- |
| **Operador** | Registar abertura/fecho do seu próprio dia; editar o seu próprio perfil (viatura/giro padrão); alterar a sua própria palavra-passe; editar os seus próprios registos de atividade; visualizar o seu próprio dashboard pessoal; copiar/enviar mensagem do WhatsApp. | Visualizar dados de outros estafetas; alterar o seu perfil para Administrador; aceder ao filtro global do Dashboard da empresa. | Acesso restrito estritamente aos seus próprios dados operacionais. |
| **Administrador** | Visualizar dashboards globais ou individuais de qualquer colaborador; editar registos de atividade de qualquer colaborador; consultar o histórico de entregas de toda a frota. | Excluir definitivamente utilizadores ou registos da base de dados (regra de Soft Delete obrigatória). | Possui visão gerencial consolidada sobre a operação da empresa. |

---

## 14. Limitações da Primeira Versão

Para garantir a entrega extremamente rápida, viável e enxuta da V1, foram assumidas as seguintes limitações deliberadas:

1. **Sem Interface Visual de Gestão de Admin:** Não haverá telas para gerir utilizadores, fazer upload de logo/cores ou clicar para descarregar logs. A gestão de contas na V1 é feita via auto-registo de estafetas e suporte direto na base de dados.
2. **Sem Sincronização Offline em Segundo Plano:** O envio final do turno exige ligação ativa à internet (havendo apenas rascunho local de digitação no ecrã).
3. **Sem Integração Externa:** O sistema não se liga via API a nenhum sistema central dos Correios ou plataformas de e-commerce.
4. **Sem Leitor de Código de Barras ou GPS:** Não há rastreamento por mapa em tempo real nem leitura de etiquetas via câmara.
5. **Sem Módulo Financeiro:** Não há cálculo automático de valores a pagar ou comissões por entrega nesta versão.
6. **Sem Exportação de Ficheiros:** Não haverá relatórios descarregáveis em PDF ou Excel na V1 (apenas consulta em ecrã e texto WhatsApp).
7. **Sem Aplicação Nativa nas Lojas:** O sistema será uma aplicação web responsiva (acessível pelo navegador do telemóvel).

---

## 15. Pontos Pendentes Antes do FSD

Todas as decisões de simplificação e regras de negócio funcionais foram devidamente refinadas. Resta apenas **1 detalhe operacional técnico** a alinhar para o FSD:

1. **Configuração do Servidor de E-mail de Recuperação:** Definir qual o serviço/provedor de e-mail transacional (oreservador SMTP) que será utilizado para o envio dos links de recuperação de palavra-passe.

> *Declaração de Prontidão:* **Não foram identificadas dúvidas funcionais ou bloqueios de regra de negócio pendentes para o avanço.**

---

## 16. Resumo Final do PRD

- **O que será construído:** O **CAC Atividades**, uma aplicação web responsiva ultra-enxuta para controlo diário de entregas e viaturas de estafetas de última milha.
- **Quem usará:** Estafetas/carteiros (Operadores) para registar o turno e gerar o relatório para o WhatsApp, e Gestores (Administradores) para acompanhar os indicadores operacionais da frota.
- **Principais Funcionalidades:** Auto-registo, registo diário em 2 etapas (abertura/fecho), rascunho local de digitação no ecrã, validações automáticas de Km e incidências, gerador de texto com envio em 1 clique para WhatsApp e dashboard visual com filtros de período e seletor de equipa.
- **Fora da Primeira Versão (Movido para a V2):** Painel visual de gestão de utilizadores pelo Admin, motor de sincronização offline PWA, contagem de paragens, calculadora de comissões, exportação para PDF/Excel, GPS em tempo real, scanner de código de barras e integração com os Correios.
- **Estado do Projeto:** O escopo da V1 está **otimizado, simplificado e 100% aprovado**, estando o projeto **totalmente pronto para avançar para a especificação técnica no FSD**.
