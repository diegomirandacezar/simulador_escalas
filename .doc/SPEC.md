# SPEC.md — Malemi | Simulador de Escalas e Custos de Folha

**Status:** Especificação inicial — levantamento e validação de requisitos  
**Projeto:** Malemi Data Solutions  
**Objetivo desta fase:** definir escopo, arquitetura e critérios de validação antes de implementar regras de cálculo da folha.

---

## 1. Visão do produto

Construir uma aplicação para simular e comparar diferentes escalas de trabalho e estimar seus efeitos na folha de pagamento. A ferramenta deverá importar dados de uma planilha Excel exportada do sistema de folha, permitir configurar cenários de escala e apresentar resultados por funcionário, evento, filial e cenário.

O sistema deverá contemplar **todos os eventos existentes na folha de referência**, inclusive aqueles que não mudam quando a escala é alterada. Nenhuma fórmula trabalhista ou regra de negócio poderá ser presumida sem documentação e validação.

## 2. Objetivos

- Importar e analisar a estrutura de um arquivo Excel de folha.
- Cadastrar ou mapear funcionários, vínculos, cargos, filiais e eventos necessários à simulação.
- Definir escalas-base e montar calendários de trabalho.
- Permitir ajustes manuais no calendário antes da execução.
- Simular cenários alternativos e compará-los com uma folha de referência.
- Exibir remuneração bruta e custo total, com detalhamento por evento.
- Registrar premissas, pendências e decisões aprovadas para que os cálculos sejam auditáveis.

## 3. Princípios obrigatórios

1. **Não inventar regras:** não implementar uma fórmula de folha enquanto sua regra, fonte e tratamento de exceções não forem documentados e aprovados.
2. **Preservar a referência:** manter os dados importados originais separados dos resultados calculados.
3. **Rastreabilidade:** cada resultado deve permitir identificar o evento, a regra aplicada, os parâmetros e os dados de entrada utilizados.
4. **Comparação justa:** eventos que não mudam com a escala devem continuar incluídos no cenário, quando fizerem parte da folha de referência.
5. **Validação antes da expansão:** comparar os resultados com casos reais conhecidos e obter aprovação antes de ampliar a cobertura.
6. **Proteção de dados:** tratar informações de funcionários como confidenciais; usar dados fictícios ou anonimizados em desenvolvimento e testes.
7. **Mudanças incrementais:** não reescrever módulos funcionais sem necessidade; apresentar o impacto e testar regressões.

## 4. Escopo funcional

### 4.1 Importação e análise da planilha

- Aceitar um arquivo Excel exportado do sistema de folha.
- Inspecionar abas, cabeçalhos, tipos de dados, identificadores e eventos.
- Produzir um relatório de qualidade dos dados: campos ausentes, duplicidades, formatos inesperados, valores inválidos e linhas que exigem revisão.
- Permitir mapear as colunas da origem para os campos internos.
- Não descartar colunas ou eventos desconhecidos silenciosamente.
- Guardar uma cópia lógica dos dados de entrada e identificar a importação utilizada em cada simulação.
- Se a planilha não tiver dados suficientes para calcular determinado evento, marcar a informação como pendente em vez de estimá-la.

### 4.2 Funcionários e parâmetros

O sistema poderá organizar os funcionários por filial, cargo, tipo de remuneração e regime de jornada, conforme os campos realmente disponíveis na fonte.

Parâmetros mencionados inicialmente e que **precisam de confirmação**:

- Administrativos/mensalistas: referência de 200 horas mensais.
- Fábrica/horistas: referência de 220 horas mensais.
- Cargos específicos: possível referência de 180 horas mensais.
- Há três filiais com escalas que podem variar.

Esses valores são hipóteses fornecidas para levantamento, não regras universais nem valores a codificar definitivamente sem validação. A jornada aplicável deve ser configurável por grupo ou funcionário, de acordo com a regra aprovada.

### 4.3 Cadastro de escalas e calendário

- Permitir definir escalas-base por dia da semana e/ou por ciclo.
- Permitir associar escalas às filiais, grupos ou funcionários, conforme os requisitos confirmados.
- Gerar um calendário mensal a partir da escala-base.
- Permitir editar manualmente qualquer dia antes da simulação.
- Registrar, quando aplicável, início e fim do turno, intervalos, folgas e turnos que atravessam a meia-noite.
- Distinguir calendário planejado de ajustes manuais.
- Validar conflitos, sobreposições, horários inválidos e duração incoerente.
- Permitir visualizar claramente a escala antes de executar os cálculos.

### 4.4 Motor de simulação da folha

O motor deve ser separado da interface e organizado por regras e eventos identificáveis.

- Processar todos os eventos presentes na folha de referência.
- Classificar cada evento como, por exemplo: fixo/não afetado pela escala, variável conforme a jornada, derivado de horas, percentual, informativo ou ainda não classificado. A classificação final deve ser validada.
- Recalcular somente eventos cuja regra aprovada dependa da escala.
- Preservar no cenário os valores dos eventos que não dependem da escala, respeitando eventuais regras específicas aprovadas.
- Não tratar um evento desconhecido como zero.
- Exibir pendências quando faltarem dados, fórmulas, parâmetros ou decisões.
- Armazenar a memória de cálculo para explicar como cada valor foi obtido.
- Evitar arredondamentos intermediários não previstos na regra aprovada.

### 4.5 Horas, adicionais e datas especiais

Foram mencionadas como hipóteses iniciais para validação:

- Adicional de 50% para determinadas horas extras.
- Tratamento de 100% para domingos e feriados conforme critérios definidos pelo negócio.
- Tratamento de datas especiais, incluindo dias de eleição.
- Possíveis turnos noturnos e turnos que atravessam a meia-noite.

Esses itens **não são autorização para presumir regras legais ou convencionais**. Antes de implementar, registrar para cada caso: regra, fonte aplicável (por exemplo, convenção coletiva ou política formal), vigência, abrangência, exceções, método de cálculo, responsável pela validação e casos de teste. Domingo, feriado, dia de eleição e hora extra não devem ser automaticamente tratados como equivalentes.

### 4.6 Comparação de cenários

- Comparar uma escala de referência com uma ou mais escalas alternativas.
- Exibir remuneração bruta e custo total conforme a definição aprovada para cada métrica.
- Mostrar valores por evento e diferenças absolutas e percentuais.
- Permitir análise por funcionário, filial e total do cenário.
- Destacar eventos alterados, inalterados, ausentes ou pendentes.
- Informar claramente a base de comparação, o período, os parâmetros e as regras utilizadas.
- Não chamar um valor de “custo total” até que os componentes incluídos (encargos, provisões, benefícios e outros itens) sejam definidos e aprovados.

### 4.7 Relatórios e exportação

A definir após validação dos dados e das métricas:

- Resumo comparativo por cenário.
- Detalhamento por funcionário e evento.
- Relatório de qualidade da importação.
- Relatório de premissas, regras e pendências.
- Exportação para Excel ou CSV, caso seja confirmada como necessária.

## 5. Fora do escopo inicial

Ficam fora da primeira versão, salvo aprovação posterior:

- Integração automática com sistemas de folha.
- Cálculo oficial ou processamento efetivo de pagamento.
- Alteração de dados no sistema de folha de origem.
- Gestão completa de férias, afastamentos, faltas e outras ocorrências. Esses itens foram inicialmente deixados fora do escopo e devem continuar explicitamente sinalizados quando afetarem a validade de um cenário.
- Aplicação automática de interpretação jurídica.
- Banco de dados ou serviço de backend escolhidos sem uma decisão de arquitetura.

A ferramenta será inicialmente de simulação e apoio à decisão, não substituindo a conferência da folha oficial nem a validação pelo profissional responsável.

## 6. Arquitetura e tecnologias

A arquitetura tecnológica ainda deve ser confirmada com base no ambiente real e nas limitações do projeto.

Diretrizes:

- Separar interface, importação/normalização dos dados, calendário, regras de cálculo, comparação e exportação.
- Centralizar regras em módulos identificáveis, com parâmetros configuráveis quando apropriado.
- Evitar duplicar fórmulas em componentes de interface.
- Não adicionar banco de dados, backend ou serviços externos sem justificar a necessidade.
- Se for escolhida uma aplicação somente no navegador, avaliar com antecedência as limitações de armazenamento, tamanho de arquivo, persistência e proteção dos dados.
- Não publicar planilhas reais, dados pessoais ou informações salariais em repositórios públicos ou hospedagem pública.
- Se houver necessidade de compartilhar uma demonstração por link, usar apenas dados fictícios/anonimizados e deixar claro que se trata de uma demonstração.

## 7. Skills do Antigravity

Utilizar as skills disponíveis na pasta do projeto, se seus arquivos e instruções confirmarem que são compatíveis com a tarefa.

### Skills principais

1. `plan-writing` — planejar etapas, dependências, riscos e critérios de conclusão.
2. `documentation-templates` — documentar requisitos, regras, decisões e pendências.
3. `architecture` — definir separação de responsabilidades e interfaces entre módulos.
4. `testing-patterns` — estruturar testes unitários, de integração e de regressão.
5. `systematic-debugging` — investigar divergências sem alterar código aleatoriamente.

### Skills de implementação e qualidade

6. `app-builder` — organizar a construção da aplicação, se compatível com a arquitetura aprovada.
7. `clean-code` — manter o código legível e modular.
8. `code-review-checklist` — revisar mudanças e riscos antes de aceitá-las.
9. `lint-and-validate` — executar verificações estáticas e validações disponíveis.
10. `frontend-design` — criar uma interface clara para calendário e comparação.
11. `tailwind-patterns` — utilizar somente se Tailwind CSS for escolhido.
12. `webapp-testing` — testar os fluxos completos pela interface, se aplicável.
13. `vulnerability-scanner` — verificar riscos de segurança antes de compartilhar ou publicar.

Não presumir que uma skill foi executada apenas por estar listada. O agente deve verificar as instruções de cada skill na pasta local e informar quais utilizou. Não instalar dependências ou mudar a stack sem aprovação.

## 8. Fases de trabalho

### Fase 1 — Levantamento e validação (fase atual)

1. Solicitar uma cópia da planilha de folha, preferencialmente anonimizada.
2. Inventariar abas, colunas, identificadores e eventos.
3. Elaborar dicionário de dados.
4. Criar catálogo completo de eventos encontrados.
5. Classificar cada evento como dependente, independente ou ainda não determinado em relação à escala.
6. Documentar as regras e suas fontes.
7. Registrar perguntas em aberto e responsáveis pelas respostas.
8. Preparar casos reais de referência para validação.

**Critério de saída:** catálogo dos eventos e regras revisado, dúvidas explicitadas e responsáveis autorizando as regras necessárias para a primeira versão.

### Fase 2 — Protótipo de calendário

- Construir o cadastro de escalas e calendário mensal com dados fictícios.
- Validar ciclos, turnos, intervalos, folgas e edições manuais.
- Não calcular valores de folha ainda.

**Critério de saída:** calendário validado com casos de teste aprovados.

### Fase 3 — Motor de cálculo controlado

- Implementar apenas eventos com regras aprovadas.
- Criar testes unitários para cada regra.
- Comparar resultados com casos de referência.
- Mostrar pendências para eventos sem regra validada.

**Critério de saída:** resultados reproduzíveis e aprovados nos casos de teste definidos.

### Fase 4 — Comparação e relatórios

- Comparar cenários.
- Apresentar valores e diferenças por evento, funcionário e filial.
- Validar as definições de remuneração bruta e custo total.
- Validar exportações, se incluídas.

### Fase 5 — Segurança e entrega

- Revisar permissões, exposição de dados, armazenamento e dependências.
- Executar testes de regressão e revisão de código.
- Documentar limitações conhecidas.
- Publicar somente após aprovação e com dados fictícios/anonimizados se a hospedagem for pública.

## 9. Critérios de aceite gerais

- Nenhum evento da planilha de referência é descartado silenciosamente.
- Todo evento tem classificação, regra e status de validação, ou aparece como pendente.
- Os eventos não afetados pela escala continuam representados corretamente.
- Cada cálculo pode ser rastreado até os dados e parâmetros utilizados.
- Casos de teste aprovados reproduzem os resultados esperados dentro da regra de arredondamento documentada.
- Diferenças entre referência e simulação são explicáveis por evento.
- Cenários com dados insuficientes são sinalizados, não apresentados como resultados completos.
- Nenhuma regra trabalhista ou convencional é inventada pelo agente.
- Dados pessoais e salariais não são enviados a serviços externos nem publicados sem autorização explícita.
- A aplicação não altera a folha original.

## 10. Riscos e controles

| Risco | Controle exigido |
|---|---|
| Fórmula incorreta ou regra incompleta | Aprovação de regra e teste de referência antes de implementar |
| Evento omitido | Inventário completo e alerta para eventos desconhecidos |
| Dupla contagem de adicionais | Regras explícitas de acumulação e precedência |
| Erros em turnos noturnos ou entre dias | Testes de limites de data e hora |
| Comparação de custos incompleta | Definição formal dos componentes de custo |
| Dados pessoais expostos | Anonimização, acesso restrito e hospedagem apropriada |
| Mudança quebrar função existente | Alterações pequenas e testes de regressão |

## 11. Pendências que exigem decisão

1. Qual é a estrutura exata do Excel e quais abas contêm os eventos?
2. Qual período será simulado e qual é a folha de referência?
3. Como identificar de forma única funcionário, filial, cargo e vínculo?
4. Quais são os tipos de remuneração e as jornadas efetivamente aplicáveis?
5. Quais convenções coletivas, acordos e políticas se aplicam a cada grupo?
6. Como são calculados e acumulados os adicionais e demais eventos?
7. Quais componentes entram na definição de custo total?
8. Como tratar eventos variáveis, médias, arredondamentos e exceções?
9. A aplicação precisa salvar cenários entre sessões ou será temporária?
10. Onde será executada e quem poderá acessar os dados?
11. Quais relatórios e formatos de exportação são necessários?

## 12. Instrução inicial para o Antigravity

**Nesta primeira execução, não implemente o motor de cálculo da folha.**

1. Leia este `SPEC.md` integralmente.
2. Inspecione a estrutura atual do projeto e as skills disponíveis na pasta local.
3. Verifique quais skills são pertinentes e leia suas instruções.
4. Faça um diagnóstico do estado atual do projeto sem sobrescrever arquivos.
5. Apresente uma proposta de arquitetura e um plano incremental.
6. Crie, se necessário e após verificar os arquivos existentes, documentos auxiliares para o dicionário de dados, catálogo de eventos, registro de regras e casos de teste.
7. Liste as informações que faltam e os arquivos de entrada necessários.
8. Aguarde validação das regras e do plano antes de implementar fórmulas de folha.

Não invente dados, resultados, legislação aplicável ou regras de cálculo. Diferencie claramente fatos observados, hipóteses e decisões pendentes.
