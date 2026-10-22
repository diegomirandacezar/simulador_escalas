# Plano de Implementação — Simulador de Escalas e Custos de RH

## Objetivo
Implementar uma aplicação web estática (Vanilla JavaScript ES6+, HTML5, CSS3, Tailwind CSS via CDN) para simulação de jornadas de trabalho, cálculo transparente de custos de mão de obra (horas normais, extras 50%, domingos e feriados 100%) e comparação de escalas com foco no menor custo estimado, executável diretamente pelo arquivo `index.html` no navegador, sem qualquer dependência de Node.js, backend ou banco de dados.

## Tarefas

- [x] **Etapa 1: Diagnóstico e Análise do Repositório**
  - Mapear estado atual do repositório, exclusão de resquícios de backend e confirmação de restrições técnicas.
  - Verificar e configurar `.gitignore` para proteger dados locais e arquivos sensíveis como `.doc/meu_git.txt`.
  - Copiar/sincronizar `SPEC.md` para a raiz conforme especificado.
  - *Critério de Verificação*: Diagnóstico estruturado documentado e `.gitignore` ativo.

- [x] **Etapa 2: Especificação Formal das Regras de Negócio e RH**
  - Consolidar catálogo de premissas de cálculo em `docs/regras-calculo.md`:
    - Tratamento de jornadas e virada de meia-noite (split de dia comum para domingo ou feriado).
    - Horas normais (min(trabalhadas, limite)).
    - Horas extras (max(0, trabalhadas - limite)) com adicional de 50%.
    - Domingos e feriados calculados a 200% sem cumulação com 50%.
    - Tratamento explícito de feriado coincidente com domingo.
    - Avisos claros de premissa de simulação e descolamento de regras de folha oficial.
  - *Critério de Verificação*: Arquivo `docs/regras-calculo.md` completo com fórmulas, entradas, saídas e exceções.

- [x] **Etapa 3: Módulo de Cálculo Centralizado e Validação Matemática (`js/calculator.js` / lógica pura)**
  - Implementar funções puras desacopladas da UI:
    - `parseTime(timeStr)` e cálculo de duração entre entrada e saída, com suporte seguro a virada de meia-noite (`passa_da_meia_noite`).
    - `splitJourneyByDay(dateStr, startTime, endTime, isHoliday)` dividindo períodos caso cruzem 00:00.
    - `isSunday(dateStr)` e detecção de classificação (`comum`, `domingo`, `feriado`, `domingo_feriado`).
    - `calculateJourney(journey, config)` com apuração de horas normais, extras 50%, horas 100% e valores monetários.
    - `calculateScale(scale)` agregando jornadas, total de horas e custos.
    - `compareScales(scalesList)` ordenando do menor para o maior custo e calculando diferenças monetárias e percentuais.
    - Validações defensivas com mensagens em pt-BR.
  - *Critério de Verificação*: Testes matemáticos e unitários isolados com 100% de precisão nos exemplos do SPEC.

- [x] **Etapa 4: Camada de Armazenamento Local (`js/storage.js`)**
  - Implementar gerenciamento seguro em `localStorage` para escalas e configurações.
  - Métodos de exportação, importação e limpeza de dados com solicitação de confirmação.
  - Tratamento de exceções (ex.: quota excedida ou storage desabilitado no navegador).
  - Carga inicial com cenários de exemplo pré-cadastrados (ex.: Escala 5x2 Comercial vs Escala 6x1 vs Escala 12x36) para demonstração imediata.
  - *Critério de Verificação*: Persistência testada no navegador mantendo dados e permitindo limpeza com diálogo.

- [x] **Etapa 5: Interface de Usuário (`index.html`, `css/styles.css`, `js/app.js`)**
  - Estrutura semântica HTML5 com cabeçalho, barra de avisos de premissa, formulário de cadastro/edição de escalas e jornadas, tabela detalhada de cálculo, painel comparativo de escalas (destaque para a mais econômica) e rodapé com identificação exata: `Desenvolvedor: Diego Miranda Cezar`.
  - Design visual profissional, moderno, fluido e acessível utilizando Tailwind CSS + CSS customizado:
    - Paleta cromática corporativa equilibrada (azul petróleo / slate / esmeralda sutil para economia).
    - Tipografia limpa, hierarquia visual nítida, feedback imediato de validações.
    - Responsividade para telas móveis, tablets e desktops.
    - Modais acessíveis ou gavetas para adição de jornada e edição de escala.
  - *Critério de Verificação*: Carregamento estático sem erros no console, responsividade e usabilidade.

- [x] **Etapa 6: Bateria de Testes Funcionais e Validação com Navegador**
  - Executar testes dos 13 cenários mínimos obrigatórios listados no item 18 do `SPEC.md`.
  - Executar testes automatizados com script de validação de regras matemáticas.
  - Auditar e registrar evidências em `docs/testes.md`.
  - *Critério de Verificação*: Todos os 13 cenários testados e validados numericamente.

- [x] **Etapa 7: Documentação e Auditoria Final**
  - Criação do `README.md` completo em português do Brasil conforme itens 8 e 17.
  - Verificação final do status do Git, revisão do `.gitignore` (garantindo que `.doc/meu_git.txt` não vaze credenciais e seja protegido).
  - Elaboração do relatório de entrega nos moldes da seção 11 do prompt.
  - *Critério de Verificação*: README e docs sincronizados, sem chamadas a git commit/push, projeto 100% estático.

## Critérios de Sucesso
- Abertura imediata do `index.html` em qualquer navegador sem necessidade de Node.js, `npm` ou servidores.
- Cálculo transparente das horas e custos exatamente de acordo com as fórmulas do SPEC.
- Comparação clara entre escalas com destaque da opção de menor custo.
- Crédito exato `Desenvolvedor: Diego Miranda Cezar` no rodapé.
- Documentação técnica e funcional completa em português do Brasil.
