# SPEC.md — Simulador de Escalas e Custos de RH

## 1. Visão geral do projeto

Desenvolver um simulador de escalas de trabalho para Recursos Humanos (RH), com foco na comparação de jornadas e na estimativa dos custos de mão de obra.

O sistema deverá permitir cadastrar jornadas, configurar parâmetros de cálculo, simular diferentes escalas e comparar os resultados para identificar a alternativa de menor custo estimado.

O projeto deverá ser simples, funcional, responsivo e fácil de manter, com cálculos centralizados e regras claramente documentadas.

## 2. Objetivo principal

Criar uma ferramenta de consulta e simulação que permita:

- Cadastrar diferentes escalas de trabalho.
- Informar datas, horários de entrada e saída.
- Configurar o valor da hora trabalhada.
- Definir o limite de horas normais por jornada.
- Identificar domingos e informar feriados manualmente.
- Calcular horas normais e horas extras.
- Estimar os custos de cada jornada.
- Comparar os custos totais das escalas.
- Identificar a escala de menor custo estimado.
- Consultar o detalhamento dos cálculos por jornada e por evento.

O resultado deverá ajudar na análise de alternativas de escala, sem substituir um sistema oficial de folha de pagamento.

## 3. Tecnologias e restrições

Utilizar exclusivamente:

- HTML5;
- CSS3;
- Tailwind CSS;
- JavaScript puro (Vanilla JavaScript);
- localStorage para persistência local, se necessário.

### Restrições obrigatórias

- Não utilizar Node.js.
- Não implementar backend.
- Não criar servidor HTTP ou API REST.
- Não utilizar banco de dados.
- Não utilizar frameworks JavaScript como React, Vue ou Angular.
- Não exigir instalação de dependências.
- Não exigir compilação ou processo de build.

A aplicação deverá funcionar como um site estático, permitindo abrir o arquivo index.html em um navegador moderno.

Neste projeto, o termo API refere-se à lógica de consulta e simulação implementada em funções JavaScript locais. Não deverá existir uma API HTTP externa.

Caso o Tailwind CSS seja utilizado por CDN, documentar que o carregamento do framework depende de conexão com a internet.

## 4. Público e utilização

A aplicação destina-se à simulação de escalas e custos de mão de obra, permitindo que o usuário compare cenários antes de tomar decisões.

A interface deverá ser compreensível para pessoas que trabalham com RH, departamento pessoal, planejamento de jornadas e análise de custos.

## 5. Cadastro de escalas e jornadas

Permitir criar, editar, consultar e excluir escalas.

Cada escala deverá possuir:

- Nome ou identificação da escala.
- Funcionário ou identificação do cenário, quando aplicável.
- Valor da hora trabalhada.
- Limite de horas normais por jornada.
- Uma ou mais jornadas cadastradas.

Cada jornada deverá permitir informar:

- Data de trabalho.
- Horário de entrada.
- Horário de saída.
- Identificação manual de feriado.
- Observações opcionais.

A interface deverá permitir adicionar várias jornadas à mesma escala e comparar diferentes escalas entre si.

Não exigir dados pessoais desnecessários para realizar uma simulação.

## 6. Calendário e tratamento de datas

- Permitir selecionar a data de cada jornada.
- Identificar automaticamente os domingos.
- Permitir marcar manualmente os feriados.
- Não exigir uma integração externa para identificar feriados.
- Validar datas e horários informados.
- Tratar jornadas que atravessam a meia-noite.
- Dividir jornadas entre dias quando necessário para identificar corretamente domingos e feriados.

Quando uma jornada atravessar dias com classificações diferentes, calcular os períodos separadamente, evitando aplicar automaticamente a mesma classificação à jornada inteira.

A regra de tratamento de feriados que coincidam com domingos deverá ser documentada e configurável quando necessário, sem presumir regras legais ou coletivas não especificadas.

## 7. Parâmetros de cálculo

O usuário deverá poder configurar:

- Valor da hora trabalhada.
- Limite de horas normais por jornada.
- Percentual de adicional para horas extras comuns.
- Percentual de remuneração estimada para domingos e feriados.

Como configuração inicial da simulação:

- Horas normais: 100% do valor da hora.
- Horas extras comuns: 150% do valor da hora, correspondendo à hora normal acrescida de 50%.
- Domingos e feriados: 200% do valor da hora, correspondendo à hora normal acrescida de 100%.

O limite de horas normais deverá ser editável. Poderá ser sugerido inicialmente um limite de 8 horas por jornada, mas esse valor será apenas um parâmetro de simulação, não uma regra universal de jornada de trabalho.

Não presumir que o limite diário de 8 horas representa todas as regras aplicáveis ao trabalhador.

## 8. Regras de cálculo

### 8.1 Horas trabalhadas

Calcular a duração efetiva da jornada com base nos horários de entrada e saída.

Validar horários inválidos e tratar jornadas que atravessam a meia-noite.

Não considerar automaticamente intervalos de descanso ou refeição como horas descontadas, pois essa regra ainda não foi definida. Se necessário, prever um campo de intervalo para futura implementação, sem aplicar descontos não autorizados.

### 8.2 Horas normais

Para dias comuns, calcular as horas normais até o limite configurado para a jornada.

Fórmula:

Horas normais = menor valor entre horas trabalhadas e limite de horas normais.

Custo de horas normais = horas normais × valor da hora.

### 8.3 Horas extras de 50%

Para dias comuns, calcular as horas que excederem o limite configurado.

Fórmula:

Horas extras = máximo entre zero e (horas trabalhadas − limite de horas normais).

Custo de horas extras = horas extras × valor da hora × 1,5.

### 8.4 Domingos e feriados com adicional de 100%

Para períodos classificados como domingo ou feriado, utilizar como estimativa inicial o pagamento de 200% do valor da hora.

Fórmula:

Custo de domingo ou feriado = horas elegíveis × valor da hora × 2.

Nesta simulação inicial, não acumular automaticamente o adicional de 50% com o adicional de 100%.

A aplicação dessa regra é uma hipótese de cálculo do simulador, não uma afirmação de que todas as categorias profissionais ou situações trabalhistas devem ser remuneradas dessa forma.

As regras efetivas podem depender da legislação aplicável, de convenções ou acordos coletivos, do regime de trabalho e de outras condições.

### 8.5 Exemplo de cálculo

Considere os seguintes parâmetros:

- Valor da hora: R$ 20,00.
- Limite de horas normais: 8 horas.
- Jornada em dia comum: 10 horas.

Resultado esperado:

- Horas normais: 8.
- Custo normal: R$ 160,00.
- Horas extras: 2.
- Custo das horas extras: R$ 60,00.
- Custo total estimado: R$ 220,00.

Para uma jornada de 8 horas classificada como domingo ou feriado:

- Horas consideradas: 8.
- Custo estimado: R$ 320,00.

Os exemplos deverão ser utilizados nos testes automatizados ou manuais da lógica de cálculo.

## 9. Comparação de escalas

Permitir comparar duas ou mais escalas.

A comparação deverá apresentar:

- Nome da escala.
- Quantidade total de horas.
- Horas normais.
- Horas extras de 50%.
- Horas em domingos e feriados.
- Custo de horas normais.
- Custo de horas extras.
- Custo de domingos e feriados.
- Custo total estimado.
- Diferença de custo entre as escalas.
- Classificação da escala de menor custo estimado.

Ordenar os resultados do menor para o maior custo total.

Destacar a alternativa de menor custo, sem afirmar que ela é necessariamente a melhor opção operacional ou juridicamente válida.

Quando as escalas utilizarem valores por hora diferentes, apresentar um aviso para que a comparação seja interpretada corretamente.

## 10. Detalhamento dos resultados

Disponibilizar uma visualização detalhada por escala e jornada.

O detalhamento deverá permitir identificar:

- Data da jornada.
- Horários informados.
- Total de horas calculadas.
- Classificação do dia.
- Horas normais.
- Horas extras.
- Multiplicador aplicado.
- Valor da hora.
- Custo estimado de cada evento.
- Total da jornada.

Os cálculos deverão ser transparentes, permitindo ao usuário conferir como cada total foi obtido.

## 11. Arquitetura JavaScript

Organizar o código em funções pequenas e reutilizáveis.

Separar, sempre que possível:

- Validação de dados.
- Cálculo da duração das jornadas.
- Classificação dos períodos por data.
- Cálculo de horas normais.
- Cálculo de horas extras.
- Cálculo de domingos e feriados.
- Cálculo dos custos.
- Comparação de escalas.
- Persistência local.
- Renderização da interface.

Manter as regras de negócio centralizadas, evitando fórmulas duplicadas em diferentes componentes da interface.

Não utilizar valores monetários formatados como texto nos cálculos internos. Manter valores numéricos e aplicar formatação monetária somente na apresentação.

## 12. Persistência dos dados

Utilizar localStorage somente se necessário para manter os dados entre acessos no mesmo navegador.

Informar claramente que:

- Os dados ficam armazenados localmente no navegador.
- Os dados não são sincronizados automaticamente entre dispositivos.
- Limpar os dados do navegador pode remover as informações salvas.
- Não existe banco de dados centralizado.
- Não existe compartilhamento automático entre usuários.

Disponibilizar uma opção para limpar os dados salvos, solicitando confirmação antes da exclusão.

Não armazenar senhas, credenciais ou dados pessoais desnecessários.

## 13. Interface e experiência do usuário

Criar uma interface:

- Responsiva para computadores, tablets e celulares.
- Organizada e intuitiva.
- Com formulários claros.
- Com tabelas de comparação legíveis.
- Com resultados monetários bem formatados.
- Com mensagens de validação e erros compreensíveis.
- Com estados vazios informativos.
- Com confirmação antes de ações destrutivas.
- Com navegação acessível por teclado.
- Com contraste adequado e rótulos nos campos.

Priorizar a clareza dos cálculos e a facilidade de comparação, sem adicionar funcionalidades que não estejam descritas nesta especificação.

## 14. Tratamento de erros e validações

Validar:

- Campos obrigatórios.
- Datas inválidas.
- Horários inválidos.
- Valor da hora negativo ou inválido.
- Limite de horas inválido.
- Jornadas sem duração válida.
- Escalas sem jornadas.
- Valores numéricos ausentes ou não numéricos.
- Falhas de leitura ou gravação no localStorage.

Não permitir que dados inválidos produzam resultados silenciosamente incorretos.

Quando não for possível realizar um cálculo, explicar o motivo ao usuário.

## 15. Limitações de negócio

A primeira versão será um simulador simplificado.

Não implementar automaticamente:

- Encargos trabalhistas e previdenciários.
- FGTS, INSS ou outros tributos.
- Descanso semanal remunerado (DSR).
- Adicional noturno.
- Banco de horas.
- Férias, décimo terceiro ou rescisões.
- Divisor mensal de salário.
- Regras específicas de convenções coletivas.
- Compensações de jornada.
- Intervalos legais automáticos.
- Regras específicas de categorias profissionais.
- Acúmulo de adicionais não definido nesta especificação.

Esses itens somente poderão ser incorporados após levantamento de requisitos e validação das regras correspondentes.

Apresentar um aviso visível informando que os resultados são estimativas para comparação e não substituem o cálculo oficial da folha de pagamento nem a validação das regras aplicáveis.

## 16. Estrutura de arquivos sugerida

Organizar o projeto de forma simples:

- index.html
- css/styles.css
- js/app.js
- docs/regras-calculo.md
- docs/testes.md
- README.md
- SPEC.md
- .gitignore

A estrutura poderá ser adaptada após a análise do projeto existente, desde que a solução permaneça estática e respeite as tecnologias obrigatórias.

Preservar a pasta .agents e as skills existentes.

Não excluir arquivos existentes sem verificar sua finalidade.

## 17. Documentação obrigatória

Criar ou atualizar o README.md em português do Brasil.

O documento deverá conter:

- Objetivo do projeto.
- Funcionalidades.
- Tecnologias utilizadas.
- Estrutura dos arquivos.
- Como executar o projeto.
- Como cadastrar e comparar escalas.
- Explicação das regras de cálculo.
- Exemplos numéricos.
- Limitações conhecidas.
- Funcionamento do localStorage.
- Procedimentos de testes.
- Aviso sobre a natureza estimativa dos resultados.
- Créditos do desenvolvedor.

A execução deverá ser explicada de forma simples: abrir o arquivo index.html em um navegador moderno.

Criar também docs/regras-calculo.md com as fórmulas e premissas utilizadas e docs/testes.md com os cenários de validação.

## 18. Testes obrigatórios

Validar, no mínimo:

1. Jornada comum inferior ao limite normal.
2. Jornada comum exatamente no limite normal.
3. Jornada comum acima do limite normal.
4. Jornada em domingo.
5. Jornada em feriado marcado manualmente.
6. Jornada que atravessa a meia-noite.
7. Jornada que atravessa de um dia comum para um domingo.
8. Jornada que atravessa de um dia comum para um feriado.
9. Comparação entre escalas com o mesmo valor por hora.
10. Comparação entre escalas com valores por hora diferentes.
11. Campos inválidos ou incompletos.
12. Persistência e exclusão de dados locais.
13. Funcionamento da interface em telas menores.

Conferir os resultados matematicamente e corrigir qualquer divergência antes de concluir.

Não declarar que todos os testes passaram se não tiverem sido efetivamente executados.

## 19. Git e segurança do repositório

Antes de preparar alterações para versionamento:

- Revisar o .gitignore.
- Verificar os arquivos que seriam incluídos.
- Não incluir credenciais, tokens, senhas ou informações privadas.
- Não publicar o conteúdo de .doc/meu_git caso contenha informações confidenciais.
- Não excluir arquivos de configuração sem verificar sua finalidade.
- Não executar git commit ou git push sem autorização explícita.

Ao finalizar, informar quais arquivos foram criados ou alterados e apresentar os comandos Git sugeridos, se necessário, sem executá-los automaticamente.

## 20. Identificação do desenvolvedor

O rodapé da interface deverá conter exatamente:

Desenvolvedor: Diego Miranda Cezar

Não modificar a grafia desse texto.

## 21. Critérios de aceite

O projeto será considerado pronto para validação quando:

- Abrir no navegador sem exigir Node.js ou backend.
- Permitir cadastrar e editar escalas e jornadas.
- Validar corretamente as entradas.
- Calcular horas normais e extras de acordo com os parâmetros.
- Tratar domingos, feriados e mudanças de data conforme as premissas documentadas.
- Comparar os custos das escalas.
- Apresentar o detalhamento dos resultados.
- Identificar a escala de menor custo estimado.
- Persistir dados localmente quando essa funcionalidade estiver habilitada.
- Apresentar mensagens de erro compreensíveis.
- Possuir README e documentação das regras.
- Passar pelos testes efetivamente executados.
- Exibir o crédito exato do desenvolvedor no rodapé.

## 22. Entrega final

Ao concluir o trabalho, apresentar:

1. Resumo do diagnóstico inicial.
2. Descrição da implementação realizada.
3. Lista dos arquivos criados ou alterados.
4. Regras de cálculo implementadas.
5. Testes executados e seus resultados reais.
6. Limitações ou dúvidas que ainda dependam de validação.
7. Instruções para executar a aplicação.
8. Situação do Git, sem realizar commit ou push automaticamente.

Priorize a correção dos cálculos, a transparência das premissas, a simplicidade técnica e a facilidade de manutenção.