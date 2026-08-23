# Consolidação do Sistema CAC Atividades (Controlo Atividades Correios)

Esta consolidação reúne todas as definições e regras de negócio alinhadas durante a etapa de entrevista para a criação da primeira versão (V1) do **CAC Atividades**.

---

## 1. Resumo do Sistema

O **CAC Atividades** é uma aplicação web responsiva projetada para operacionalizar e simplificar o registo diário de trabalho de estafetas e carteiros do segmento de entrega de pacotes de última milha (*last-mile*). 

O sistema substitui anotações informais e controlos manuais por um painel digital intuitivo onde o colaborador regista o início do turno (quilometragem inicial da viatura) e o fecho do dia (quilometragem final, volumes recolhidos, entregues e incidências). Ao finalizar, o sistema gera automaticamente uma mensagem formatada padrão para envio em um clique para o grupo de WhatsApp da empresa, além de alimentar dashboards visuais de métricas de desempenho diárias e mensais.

---

## 2. Problema que o Sistema Resolve

- **Falta de padronização nos relatórios diários:** Elimina erros de digitação e mensagens fora do formato no grupo de trabalho do WhatsApp.
- **Falta de controlo de utilização das viaturas:** Garante o registo sistemático de Km percorridos por viatura em serviço.
- **Dificuldade na apuração de métricas de qualidade:** Substitui cálculos manuais por métricas automáticas de eficiência de entregas e volume de incidências (pacotes não entregues).
- **Trabalho em áreas com má cobertura de rede:** Resolve a perda de dados no momento da entrega através de suporte a armazenamento temporário offline no telemóvel.
- **Falta de histórico centralizado para gestão:** Fornece aos gerentes e diretores uma visão consolidada da frota e do desempenho individual de cada trabalhador.

---

## 3. Usuários e Perfis Envolvidos

### **A. Operador / Colaborador (Estafeta / Carteiro)**
- **Objetivo:** Registar a sua atividade diária de forma rápida no telemóvel e acompanhar os seus resultados.
- **Permissões:**
  - Registar abertura e fecho de turno diário.
  - Editar o seu próprio perfil (Matrícula padrão da viatura e Código do Giro/Rota).
  - Editar os seus próprios registos a qualquer momento (com geração de histórico de alteração).
  - Gerar e partilhar a mensagem formatada no WhatsApp.
  - Visualizar exclusivamente o seu Dashboard de métricas pessoais.

### **B. Administrador (Gestor / Diretor)**
- **Objetivo:** Acompanhar a operação global da empresa, gerir equipas e configurar o sistema.
- **Permissões:**
  - Acesso total a todas as funcionalidades do sistema.
  - Registar, editar e **inativar** utilizadores (sem exclusão definitiva do banco de dados).
  - Redefinir palavras-passe de utilizadores manualmente.
  - Consultar o Dashboard com filtro por empresa inteira ou por colaborador específico.
  - Alterar configurações globais da aplicação (nome, logótipo, cores da interface, tempo de sessão inativa e tempo de retenção de logs).
  - Descarregar ficheiros de log de erros do sistema (.txt) e executar a rotina de limpeza de logs.

---

## 4. Funcionalidades Essenciais da Primeira Versão (V1)

### **A. Autenticação e Gestão de Utilizadores**
- **Registo e Auto-Cadastro:** Formulário inicial com Nome Completo, Número de Telemóvel, Número de Colaborador (SC), E-mail e Palavra-passe. O novo utilizador entra imediatamente ativado com o perfil 'Operador'.
- **Início de Sessão:** Login via Número de Colaborador (SC) ou E-mail + Palavra-passe.
- **Recuperação de Palavra-passe:** Envio automático de link/código de recuperação por e-mail e opção de redefinição manual pelo Administrador.
- **Inativação Lógica:** Impedimento de login para contas inativadas pelo Admin, preservando todo o histórico de entregas e auditoria.

### **B. Registo Diário de Atividade (2 Etapas)**
1. **Abertura do Turno (Início do Dia):**
   - Introdução manual do **Km Inicial** (justificado pelo uso do veículo na deslocação casa-trabalho).
   - Pré-preenchimento automático da **Matrícula do Veículo** e **Giro** (padrões do perfil, porém editáveis para trocas pontuais).
2. **Fecho do Turno (Final do Dia):**
   - **Km Final** (manual).
   - **Giro** (editável).
   - **Quantidade de Objetos** e **Quantidade de Recolhas**.
   - **Detalhamento de Incidências:** Quantidade de Avisados, Retornos, Recusados, Endereço Insuficiente e Desconhecidos na Morada.
3. **Modo Offline:**
   - Possibilidade de guardar o registo localmente no dispositivo caso não haja sinal de internet, sincronizando automaticamente com o servidor assim que a rede for restabelecida.
4. **Alerta de Pendência:**
   - Aviso visual em destaque ao entrar no sistema caso o dia anterior esteja sem fecho. O utilizador pode optar por fechar o dia anterior ou avançar para o novo turno.

### **C. Gerador de Mensagem para WhatsApp**
- Geração automática da mensagem exatamente no padrão exigido:
  ```text
  *_10/08/2026_*

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
- **Ações rápidas:** Botão "Copiar Texto" e botão "Enviar para WhatsApp" (abre a app diretamente com a mensagem preenchida).

### **D. Dashboards e Métricas**
- **Cartões de Indicadores:** Total de Objetos Entregues, Total de Não Entregues (Incidências), Distância Total Percorrida (Km) e Eficiência (%).
- **Gráfico Básico:** Entregas Efetivas vs. Não Efetivas.
- **Filtros de Período:** Dia, Semana, Mês e Ano.
- **Filtro de Visão (Admin):** Seletor para alternar entre "Toda a Empresa" e "Colaborador Específico".

### **E. Configurações Globais e Logs**
- Personalização de Nome da Empresa, Logótipo e Paleta de Cores.
- Parâmetro de Tempo de Sessão Inativa (padrão: 12 horas).
- Parâmetro de Retenção de Logs (padrão: 90 dias).
- Descarregamento de ficheiro de log (.txt) por data e botão de limpeza de logs antigos pelo Admin.

---

## 5. Funcionalidades que Ficam Fora da Primeira Versão (V2+)

- **Quantidade de Paragens:** Campo removido da V1, será introduzido na V2.
- **Calculadora / Previsão de Comissões:** Cálculo de ganhos financeiros com base em paragens/pacotes entregues no mês.
- **Exportação de Relatórios Formatações avançadas:** Geração de ficheiros PDF/Excel mensais para arquivo formal.
- **Anexo de Fotos de Comprovativos:** Registo fotográfico de avisos deixados ou moradas não localizadas.
- **Rastreamento GPS e Otimização de Rota:** Mapa interativo em tempo real.
- **Leitura de Código de Barras / QR Code:** Scanner de pacotes via câmara do telemóvel.
- **Integração via API com o sistema dos Correios:** Importação direta da lista de pacotes.

---

## 6. Informações que o Sistema Precisa Armazenar

1. **Utilizadores (`users`):** ID, Nome Completo, Número de Colaborador (SC), Telemóvel, E-mail, Palavra-passe (encriptada), Perfil (`operador` / `administrador`), Estado (`ativo` / `inativo`), Data de Registo.
2. **Perfil do Veículo/Rota (`user_profiles`):** ID do Utilizador, Matrícula Padrão da Viatura, Código do Giro Padrão.
3. **Registo Diário de Atividade (`daily_activities`):**
   - ID, ID do Colaborador, Data da Atividade.
   - **Abertura:** Km Inicial, Matrícula do Dia, Giro do Dia, Hora de Abertura.
   - **Fecho:** Km Final, Qtd Objetos, Qtd Recolhas, Qtd Avisados, Qtd Retornos, Qtd End. Insuficiente, Qtd Recusados, Qtd Desconhecido na Morada, Hora de Fecho, Estado (`aberto` / `fechado`).
4. **Histórico de Auditoria (`audit_logs`):**
   - ID da Ação, Tabela/Registo Alterado, ID do Utilizador que alterou, Campos Alterados (Valor Antigo vs. Valor Novo), Timestamp.
5. **Configurações Globais (`system_settings`):**
   - Nome do Sistema, URL/Caminho do Logo, Tema de Cores, Tempo de Sessão (minutos), Dias de Retenção de Logs.
6. **Logs de Erros (Ficheiros Locais):**
   - Armazenados no servidor em pasta protegida organizada por subpastas `/Ano/Mês/Dia.log`.

---

## 7. Regras de Negócio Identificadas

1. **Fórmula de Eficiência (%):**
   $$\text{Eficiência (\%)} = \frac{\text{Objetos Entregues} + \text{Recolhas Efetivadas}}{\text{Qtd Objetos} + \text{Qtd Recolhas}} \times 100$$
   *Onde $\text{Objetos Entregues} = \text{Qtd Objetos} - (\text{Avisados} + \text{Retornos} + \text{End. Insuf.} + \text{Recusados} + \text{Desc. Morada})$.*
2. **Distância Percorrida:**
   $$\text{Km Percorridos} = \text{Km Final} - \text{Km Inicial}$$
3. **Bloqueio Rígido de Validação:**
   - O formulário **não pode ser guardado** e deve destacar os campos a vermelho se:
     - $\text{Km Final} < \text{Km Inicial}$
     - $(\text{Avisados} + \text{Retornos} + \text{End. Insuf.} + \text{Recusados} + \text{Desc. Morada}) > \text{Qtd Objetos}$
4. **Sem Exclusão Definitiva:** Nenhum utilizador ou registo de entrega é apagado fisicamente da base de dados. Utilizadores desativados passam para o estado `Inativo`.
5. **Histórico de Alterações:** Todas as edições num registo já guardado (seja feitas pelo Colaborador ou pelo Administrador) devem gerar uma linha de auditoria com autor e data/hora.
6. **Proteção de Perfil:** Um Operador não pode alterar o seu próprio perfil para Administrador ou alterar dados de outros utilizadores.
7. **Independência de Km Inicial:** O Km inicial é obrigatoriamente digitado manualmente a cada dia, sem puxar o valor final do dia anterior.

---

## 8. Dúvidas Ainda em Aberto

Não restaram dúvidas críticas de negócio após a entrevista incremental. Algumas questões puramente técnicas e operacionais a alinhar durante o desenvolvimento incluem:

- **E-mail de envio da recuperação de senha:** Definir se será utilizado um servidor SMTP próprio da empresa ou serviço de envio de e-mails transacionais (ex: SendGrid, Resend, etc.).
- **Tamanho máximo do logotipo:** Definir o limite de tamanho para o upload de imagem do logo no painel de configurações.

---

## 9. Recomendações para a Criação do PRD

1. **Foco em Mobile First:** A interface de registo diário e geração de WhatsApp deve ser otimizada prioritariamente para ecrãs de telemóveis (botões amplos, teclado numérico apropriado em campos de Km/volumes).
2. **Arquitetura de PWA / Armazenamento Local:** Adotar estratégias de *Service Worker* e *LocalStorage* / *IndexedDB* no navegador para suportar o requisito de registo offline sem falhas.
3. **Camada de Segurança para Pasta de Logs:** Garantir que o diretório de ficheiros de logs do servidor possua regras de acesso estritas que impeçam o acesso direto via URL no navegador por utilizadores não autorizados.
4. **Componente de Cópia e Deep Linking do WhatsApp:** Utilizar a API nativa do navegador (`navigator.clipboard`) e os esquemas de URL `https://api.whatsapp.com/send?text=...` para máxima compatibilidade entre telemóveis Android e iOS.

---

**Esta consolidação reflete o escopo completo e refinado para o início da elaboração do PRD eção do PRD (Documento de Requisitos do Produto).**
