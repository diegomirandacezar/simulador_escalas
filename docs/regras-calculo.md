# Regras de Negócio e Cálculos de RH — Simulador de Escalas

## 1. Visão Geral e Premissas Fundamentais

Este documento detalha todas as fórmulas matemáticas, premissas de Recursos Humanos e critérios de cálculo utilizados no **Simulador de Escalas e Custos de RH**.

> [!IMPORTANT]
> **Aviso de Natureza Estimativa:**
> Este simulador foi concebido como uma ferramenta de apoio analítico e operacional para planejamento e comparação de cenários de escalas. Seus resultados consistem em **estimativas parametrizadas** e **não substituem** a apuração oficial de folha de pagamento, nem contemplam obrigações coletivas ou legais personalizadas.

---

## 2. Catálogo Detalhado de Regras

### Regra 1: Duração Efetiva da Jornada de Trabalho

- **Descrição:** Calcula o total de horas trabalhadas entre o horário de entrada e o horário de saída informados para uma jornada.
- **Dados de Entrada:**
  - `hora_entrada` (formato `HH:MM`, 00:00 a 23:59)
  - `hora_saida` (formato `HH:MM`, 00:00 a 23:59)
  - `atravessa_meia_noite` (booleano implícito ou explícito se saída <= entrada)
- **Fórmula Utilizada:**
  $$\text{minutos\_entrada} = \text{hora\_entrada} \times 60 + \text{minuto\_entrada}$$
  $$\text{minutos\_saida} = \text{hora\_saida} \times 60 + \text{minuto\_saida}$$
  - Se $\text{minutos\_saida} > \text{minutos\_entrada}$:
    $$\text{duracao\_horas} = \frac{\text{minutos\_saida} - \text{minutos\_entrada}}{60}$$
  - Se $\text{minutos\_saida} \le \text{minutos\_entrada}$ (jornada noturna que cruza a meia-noite):
    $$\text{duracao\_horas} = \frac{(1440 - \text{minutos\_entrada}) + \text{minutos\_saida}}{60}$$
- **Resultado Esperado:** Duração líquida contínua expressa em horas decimais (ex.: 08:30 = 8,5 horas).
- **Possíveis Exceções:** Entrada igual à saída sem marcação de 24 horas resulta em duração 0 (inválida).
- **Status:** Definido no SPEC (Seção 8.1). Intervalos de descanso/refeição não são deduzidos automaticamente nesta fase.

---

### Regra 2: Classificação do Dia e Divisão em Virada de Meia-Noite

- **Descrição:** Classifica cada período trabalhado em:
  - `Dia Comum` (segunda a sábado, sem marcação de feriado)
  - `Domingo` (identificado automaticamente pelo calendário)
  - `Feriado` (marcado manualmente pelo usuário)
  - `Domingo e Feriado` (coincidência entre domingo e feriado)
  Quando a jornada atravessa a meia-noite (ex.: 22:00 às 06:00), a jornada é dividida em dois tramos de apuração para preservar a exatidão das regras de cada dia de calendário civil.
- **Dados de Entrada:**
  - `data_inicio` (YYYY-MM-DD)
  - `hora_entrada` (HH:MM)
  - `hora_saida` (HH:MM)
  - `feriado_manual_dia1` (booleano)
  - `feriado_manual_dia2` (booleano opcional para o dia seguinte)
- **Fórmula e Lógica:**
  - Se $\text{hora\_saida} > \text{hora\_entrada}$:
    - Tramo único: da entrada à saída, sob a classificação da `data_inicio`.
  - Se $\text{hora\_saida} \le \text{hora\_entrada}$:
    - **Tramo A:** Da `hora_entrada` às `24:00` (duração = $24 - \text{hora\_entrada}$), com data = $\text{data\_inicio}$.
    - **Tramo B:** Das `00:00` à `hora_saida` (duração = $\text{hora\_saida}$), com data = $\text{data\_inicio} + 1\text{ dia}$.
    - Cada tramo é avaliado independentemente quanto a ser Domingo (`getDay() === 0`) ou Feriado.
- **Resultado Esperado:** Garantia de que horas prestadas em domingo ou feriado recebam o adicional correto de 100%, sem contaminar as horas prestadas no dia comum anterior ou posterior.
- **Status:** Definido no SPEC (Seções 6 e 8.1).

---

### Regra 3: Horas Normais em Dias Comuns

- **Descrição:** Limita o cômputo de horas comuns ao teto contratual/simulado parametrizado na escala (padrão de referência: 8 horas diárias, configurável pelo usuário).
- **Dados de Entrada:**
  - `horas_trabalhadas_comuns`: soma de horas trabalhadas no dia comum.
  - `limite_horas_normais`: limite diário da escala (ex.: 8h).
  - `valor_hora`: valor monetário da hora (ex.: R$ 20,00).
- **Fórmulas:**
  $$\text{horas\_normais} = \min(\text{horas\_trabalhadas\_comuns}, \text{limite\_horas\_normais})$$
  $$\text{custo\_horas\_normais} = \text{horas\_normais} \times \text{valor\_hora}$$
- **Resultado Esperado:** Quantidade de horas normais e seu custo a 100% do valor da hora.
- **Status:** Definido no SPEC (Seção 8.2).

---

### Regra 4: Horas Extras com Adicional de 50% em Dias Comuns

- **Descrição:** Toda hora trabalhada em dia comum que ultrapassar o limite diário de horas normais configurado é classificada como hora extra com acréscimo de 50% (multiplicador 1,5x).
- **Dados de Entrada:**
  - `horas_trabalhadas_comuns`
  - `limite_horas_normais`
  - `valor_hora`
  - `percentual_extra`: 50% (fator 1,5)
- **Fórmulas:**
  $$\text{horas\_extras} = \max(0, \text{horas\_trabalhadas\_comuns} - \text{limite\_horas\_normais})$$
  $$\text{custo\_horas\_extras} = \text{horas\_extras} \times \text{valor\_hora} \times 1{,}50$$
- **Resultado Esperado:** Quantidade de horas extras a 50% e custo correspondente.
- **Status:** Definido no SPEC (Seção 8.3).

---

### Regra 5: Horas Trabalhadas em Domingos e Feriados (Adicional de 100%)

- **Descrição:** Horas executadas em dias identificados como Domingo ou marcados manualmente como Feriado são remuneradas com adicional de 100% sobre o valor-hora (multiplicador 2,0x).
- **Dados de Entrada:**
  - `horas_trabalhadas_dom_fer`
  - `valor_hora`
  - `percentual_dom_fer`: 100% (fator 2,0)
- **Fórmulas:**
  $$\text{custo\_domingos\_feriados} = \text{horas\_trabalhadas\_dom\_fer} \times \text{valor\_hora} \times 2{,}00$$
- **Resultado Esperado:** Custo total das horas em domingos/feriados com fator integral 2,0x.
- **Premissa de Simulação:**
  - Não acumula 50% sobre 100% (não resulta em 250% nem 300%).
  - Coincidência de domingo com feriado aplica o fator de 2,0x uma única vez.
- **Status:** Definido no SPEC (Seção 8.4).

---

### Regra 6: Custo Total Estimado da Jornada e da Escala

- **Fórmulas de Consolidação da Jornada:**
  $$\text{custo\_total\_jornada} = \text{custo\_horas\_normais} + \text{custo\_horas\_extras} + \text{custo\_domingos\_feriados}$$
- **Fórmulas de Consolidação da Escala:**
  $$\text{total\_horas} = \sum \text{horas\_jornadas}$$
  $$\text{total\_horas\_normais} = \sum \text{horas\_normais}$$
  $$\text{total\_horas\_extras} = \sum \text{horas\_extras}$$
  $$\text{total\_horas\_dom\_fer} = \sum \text{horas\_dom\_fer}$$
  $$\text{custo\_total\_escala} = \sum \text{custo\_total\_jornada}$$
- **Status:** Definido no SPEC (Seção 8 e 9).

---

### Regra 7: Comparação entre Múltiplas Escalas

- **Critério de Classificação:**
  - Ordenação crescente pelo $\text{custo\_total\_escala}$.
  - A escala com o menor valor é destacada como **Menor Custo Estimado**.
- **Cálculo da Diferença:**
  $$\Delta_{\text{custo}} = \text{custo\_escala}_i - \text{menor\_custo}$$
  $$\Delta_{\%} = \begin{cases} 0\% & \text{se } \text{menor\_custo} = 0 \\ \frac{\Delta_{\text{custo}}}{\text{menor\_custo}} \times 100 & \text{caso contrário} \end{cases}$$
- **Aviso de Heterogeneidade de Taxas:**
  - Se duas ou mais escalas comparadas possuírem `valor_hora` distinto, a aplicação emite um alerta explícito destacando que a variação de custo decorre também da diferença no valor-hora contratado, e não exclusivamente da distribuição da escala.
- **Status:** Definido no SPEC (Seção 9).

---

## 3. Matriz de Exemplos Numéricos Validados

| Cenário | Data | Entrada | Saída | Horas | Classificação | Horas Normais | Horas Extras (50%) | Horas Dom/Fer (100%) | Custo Total (Valor Hora R$ 20,00) |
|---|---|---|---|---|---|---|---|---|---|
| **Padrão SPEC 8.5 (Dia Comum 10h)** | 2026-10-21 (Qua) | 08:00 | 18:00 | 10,0h | Comum | 8,0h (R$ 160) | 2,0h (R$ 60) | 0h | **R$ 220,00** |
| **Padrão SPEC 8.5 (Domingo 8h)** | 2026-10-25 (Dom) | 08:00 | 16:00 | 8,0h | Domingo | 0h | 0h | 8,0h (R$ 320) | **R$ 320,00** |
| **Jornada inferior ao limite (6h)** | 2026-10-22 (Qui) | 08:00 | 14:00 | 6,0h | Comum | 6,0h (R$ 120) | 0h | 0h | **R$ 120,00** |
| **Jornada exata no limite (8h)** | 2026-10-23 (Sex) | 08:00 | 16:00 | 8,0h | Comum | 8,0h (R$ 160) | 0h | 0h | **R$ 160,00** |
| **Feriado manual (8h)** | 2026-10-21 (Qua) | 08:00 | 16:00 | 8,0h | Feriado | 0h | 0h | 8,0h (R$ 320) | **R$ 320,00** |
| **Virada Sábado -> Domingo (20h às 04h = 8h)** | 2026-10-24 (Sáb) | 20:00 | 04:00 | 8,0h | Misto (4h Sáb / 4h Dom) | 4,0h (R$ 80) | 0h | 4,0h (R$ 160) | **R$ 240,00** |
| **Virada Domingo -> Segunda (20h às 04h = 8h)** | 2026-10-25 (Dom) | 20:00 | 04:00 | 8,0h | Misto (4h Dom / 4h Seg) | 4,0h (R$ 80) | 0h | 4,0h (R$ 160) | **R$ 240,00** |

---

## 4. Limitações e Escopo de RH Não Coberto

Conforme estabelecido na Seção 15 do SPEC, não integram esta versão:
- Encargos previdenciários e trabalhistas (INSS, FGTS, RAT, Sistema S).
- Descanso Semanal Remunerado (DSR) e seus reflexos.
- Adicional noturno e redução ficta da hora noturna (CLT art. 73).
- Acordos coletivos de banco de horas ou compensação semanal (ex.: 44h semanais com supressão de sábado).
- Provisões de 13º salário e férias proporcionais + 1/3 constitucional.
