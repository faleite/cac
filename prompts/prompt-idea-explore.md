Quero criar um sistema web.

O sistema será de **controlo de atividade diária para entregadores de pacotes dos correios**, com o nome de **CAC Atividades** (Controlo Atividades Correios).

## Público usuário do sistema

- Estafetas dos correios que desejam facilitar a criação do seu relátorio de controlo de atividade do seu dia de trabalho.
- Ideal para:
	- Controle de Entregas
	- Controle de Viaturas
	- Visualizar métricas de entregas mensais

- O próprio usuário acompanhará os resultados; gerentes e diretores utilizarão o sistema para acompanhamento.

- Uso pessoal e empresarial em uma empresa do tipo correios para trabalhadores de prestação de serviço de ultima milha.
    
- Haverá um usuário administrador ele poderá criar usuários, definir permissões, acessar configurações e gerenciar dados principais
    
## Objetivo principal

- O objetivo do sistema é ajudar e facilitar o entregador (colaborador, carteiro, estafeta) a entregar seu relatório diário e gerenciar seus feitos diarios e mensais de forma visual e pratica
- O sistema deve permitir que usuários autorizados registrem suas atividades de entregas e uso do veiculo no seu do dia a dia.  acompanhem o relatorio diario e  mensal com metricas que identifiquem a qualidade e quantidade.
- A ideia é criar um sistema fácil de entender, sem termos complexos, para que pessoas consigam usar no dia a dia. Ele deve funcionar como um painel de controlo de atividades: o usuário entra consulta suas atividades diarias e mensais ou registra seu dia de trabalho incluindo a matricula do veiculo, kilometros iniciais e finais, Giro (representa o codigo postal da volta do entregador + letra do colaborador), quantidade de objetos a serem entregues, quantidade de recolhas a serem feitas, quantidades de incidencias como: avisados, retornos, recusados, endererecos insuficientes, e desconhecidos na morada.
-  O controlo de atividade consegue responder rapidamente perguntas como: 
	+ Quantidade de entregas efetivas 
	+ Quantidades de incidencias (pacotes nao entregues)
	+ Kilometros percorridos
	+ eficiencia
	+ dias de atividade
+ Ao final do dia o colaborador enviara uma mensagem de texto para o whatsapp como o seu controle diario para o grupo da empresa. Esta aplicacao gerara esta mensagem para ser compatilhada exatamente com o seguinte formato:
+```txt
```

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

## Primeira versão

Na primeira versão, imagino que o sistema deve permitir:

### Cadastros Básicos

- Registo de Utilizador: Nome Completo, Número de Telemóvel, Número de Colaborador (SC), Palavra-passe.
    
- Iniciar Sessão do utilizador: Número de Colaborador (SC), Palavra-passe.
    
- Registrar perfil do utilizador após seu registro: Matrícula do Veículo, Código Rota (exemplo: 2825H)

### Gestão de usuários e permissões 

- Haverá dois tipos de usuários: **administrador** e **colaborador**.
#### administrador 
- O **administrador** será o gestor principal do sistema. - Ele terá acesso total ao sistema e poderá criar, editar e inativar usuários. - A exclusão definitiva de usuários não fará parte da primeira versão, para preservar histórico, relatórios e auditoria. - O administrador também poderá acessar e alterar as configurações globais do sistema.
#### operador 
- O **operador** poderá acessar o sistema e utilizar as funcionalidades do controlo diario e visualizacao de suas metricas, alterar seu perfil como a matricula e giro

#### Usuários inativados 
- Usuários inativados não poderão acessar o sistema, mas seus registros e ações anteriores serão mantidos para preservar o histórico, os relatórios e a auditoria do sistema. 
#### Recursos de gestão de usuários 
- Controle de acesso por e-mail ou numero de colaborador e senha com tela de login. 
- Tela de cadastro de usuário feita pelo administrador ou pelo usuario. 
- Recuperação de senha por e-mail. 
- Permitir que usuários alterem seus próprios dados básicos de perfil. 
- Permitir que usuários alterem sua própria senha. 
- Impedir que operadores alterem seu próprio perfil para administrador.

### Relatórios 
- Quantidade de Objetos
- Quantidade de paragens (As vezes uma paragem a mais de um objetos)
	- Este recurso sera opcional, muitas vezes o colaborador nao sabera dizer o numero de paragens
	- Este recurso cabera mais como uma feature, onde tera calculos para ter um previsao de ganhos de comicao ao fim do mes.
- Quantidade de incidencias (objetos nao entregues)
- Distancias percorridas
- metrica de eficiencia

### Dashboard 
- Exibir o total de Objetos entregues . 
- Exibir o total de Objetos nao entregues. 
- Exibir o total de distancia percorridas. 
- Exibir gráfico básico de entregas efetivadas x entregas nao efetivadas. 
- Permitir filtro adicional por período de dia, mes, semana e ano.

### Configurações gerais 
- A tela de **configurações gerais** permitirá alterar informações globais do sistema, como nome, logo e cores da interface, além de parâmetros administrativos, como tempo máximo de sessão inativa e tempo de retenção dos logs. - Somente administradores podem acessar este recurso.
### Outros recursos
- Interface simples, responsiva e fácil de usar em e celular. 
- Log de erros para facilitar diagnóstico durante o desenvolvimento. 
	+ Somente em arquivos. 
	+ Proteger pastas de logs para acessar através de navegador. 
	+ Criar subpastas por mês e ano 
	+ Criar arquivo de log por dia. 
	+ Permitir rotina de limpeza de logs acessível apenas pelo administrador. 
	+ Permitir ativar e desativar log de erro através de arquivo de configuração. 
- Auditoria simples para identificar quando criou ou registro, quando criou, quem alterou e quando alterou.
- Validações básicas para evitar lançamentos sem valor, sem data, sem tipo ou sem categoria. 
- Mensagens claras de sucesso e erro.

---

Atue como analista de sistemas experiente.

Antes de criar qualquer documento final, me ajude a organizar a ideia do sistema por meio de uma entrevista incremental.

Ao longo da entrevista, investigue e organize as informações necessárias para identificar:

1. qual problema o sistema resolve;    
2. quem usará o sistema;    
3. quais funcionalidades são essenciais para a primeira versão;    
4. quais funcionalidades podem ficar para uma versão futura;    
5. quais informações precisam ser armazenadas;    
6. quais regras de negócio já podem ser percebidas;    
7. quais dúvidas precisam ser respondidas antes da criação do PRD;    
8. quais recursos normalmente existem em sistemas desse tipo.    

Use linguagem simples e explique termos técnicos quando aparecerem.

Faça uma pesquisa sobre recursos normalmente adicionados a sistemas desse tipo.

Ao pesquisar recursos comuns, não inclua automaticamente todos eles no escopo.

Na primeira resposta, classifique as sugestões em três grupos:

1. essencial para a primeira versão;    
2. útil, mas pode ficar para depois;    
3. avançado demais para este primeiro projeto.    

Explique brevemente o motivo de cada classificação.

Depois dessa primeira classificação, não repita a lista completa nas próximas rodadas, a menos que eu peça ou que alguma resposta minha mude significativamente o escopo.

Nesta etapa, não defina linguagem de programação, banco de dados, bibliotecas, frameworks, hospedagem, estrutura de pastas, tabelas de banco de dados ou detalhes de código.

Essas decisões serão tomadas em uma etapa futura.

## Modo de condução da conversa

Conduza a conversa em modo de entrevista incremental.

Na primeira resposta, apresente apenas um resumo breve do que entendeu sobre o sistema e a classificação inicial dos recursos pesquisados.

Depois da primeira resposta, não repita resumos completos a cada nova rodada de perguntas.

A cada resposta minha, incorpore silenciosamente as informações ao contexto do sistema e avance apenas com o próximo bloco de perguntas necessário.

Em cada nova rodada, faça somente:

1. uma frase curta indicando os próximos temas da investigação;    
2. no máximo 3 perguntas objetivas. para cada pergunta:
   2.1. explique rapidamente por que essa informação é importante;
   2.2. dê exemplos de respostas possíveis;
   2.3. se for possível informe qual padrão será usado caso o usuário não saiba responder.

Não liste novamente tudo o que já foi decidido, exceto se houver contradição, lacuna crítica ou se eu pedir explicitamente.

Não produza o contexto consolidado completo durante a entrevista.

O contexto completo do sistema só deverá ser apresentado quando eu enviar um segundo prompt pedindo o resumo final antes da criação do PRD.

Faça perguntas sempre que precisar de mais informações.

Faça as perguntas em blocos pequenos, com no máximo 3 perguntas por vez, e aguarde minhas respostas antes de continuar.


