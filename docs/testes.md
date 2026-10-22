# Registro de Testes Funcionais e Validação Matemática

Este documento registra os procedimentos, cenários e resultados da validação funcional e matemática do **Simulador de Escalas e Custos de RH**, abrangendo os 13 cenários obrigatórios previstos no item 18 do `SPEC.md`.

## Resumo da Bateria de Testes

- **Ambiente de Teste dos Cálculos:** Execução direta de funções puras do `js/calculator.js` e auditoria em navegador.
- **Total de Cenários Executados:** 13
- **Cenários Aprovados:** 13
- **Cenários com Falha:** 0
- **Taxa de Sucesso:** 100%

---

## Detalhamento dos Cenários e Evidências

### Cenário 1: Jornada comum inferior ao limite normal
- **Entrada:** Data 2026-10-21 (Quarta), Entrada: 08:00, Saída: 14:00 (Duração: 6,0h), Limite: 8,0h, Valor-Hora: R$ 20,00.
- **Resultado Esperado:** 6h normais, 0h extras, Custo: R$ 120,00.
- **Resultado Obtido:** 6h normais, 0h extras, Custo: R$ 120,00.
- **Status:** ✅ APROVADO.

### Cenário 2: Jornada comum exatamente no limite normal
- **Entrada:** Data 2026-10-21 (Quarta), Entrada: 08:00, Saída: 16:00 (Duração: 8,0h), Limite: 8,0h, Valor-Hora: R$ 20,00.
- **Resultado Esperado:** 8h normais, 0h extras, Custo: R$ 160,00.
- **Resultado Obtido:** 8h normais, 0h extras, Custo: R$ 160,00.
- **Status:** ✅ APROVADO.

### Cenário 3: Jornada comum acima do limite normal (Exemplo do SPEC 8.5)
- **Entrada:** Data 2026-10-21 (Quarta), Entrada: 08:00, Saída: 18:00 (Duração: 10,0h), Limite: 8,0h, Valor-Hora: R$ 20,00.
- **Fórmula:**
  - Horas normais: $\min(10, 8) = 8\text{h} \rightarrow 8 \times 20 = \text{R\$} 160,00$
  - Horas extras (50%): $\max(0, 10 - 8) = 2\text{h} \rightarrow 2 \times 20 \times 1,5 = \text{R\$} 60,00$
  - Total: R$ 220,00.
- **Resultado Esperado:** R$ 220,00.
- **Resultado Obtido:** R$ 220,00.
- **Status:** ✅ APROVADO.

### Cenário 4: Jornada em domingo (Exemplo do SPEC 8.5)
- **Entrada:** Data 2026-10-25 (Domingo identificado automaticamente), Entrada: 08:00, Saída: 16:00 (Duração: 8,0h), Limite: 8,0h, Valor-Hora: R$ 20,00.
- **Fórmula:**
  - $8\text{h} \times 20 \times 2,0 = \text{R\$} 320,00$.
- **Resultado Esperado:** R$ 320,00.
- **Resultado Obtido:** R$ 320,00.
- **Status:** ✅ APROVADO.

### Cenário 5: Jornada em feriado marcado manualmente
- **Entrada:** Data 2026-10-21 (Quarta com flag `isHoliday = true`), Entrada: 08:00, Saída: 16:00 (8h), Valor-Hora: R$ 20,00.
- **Resultado Esperado:** 8h com adicional 100%, Custo: R$ 320,00.
- **Resultado Obtido:** 8h domingo/feriado, Custo: R$ 320,00.
- **Status:** ✅ APROVADO.

### Cenário 6: Jornada que atravessa a meia-noite em dias comuns
- **Entrada:** Data 2026-10-20 (Terça), Entrada: 22:00, Saída: 06:00 (Quarta), Duração: 8,0h, Limite: 8,0h, Valor-Hora: R$ 20,00.
- **Comportamento:** A jornada é dividida em dois tramos civis:
  - Tramo 1 (22:00 às 24:00 = 2,0h normais na Terça) -> R$ 40,00.
  - Tramo 2 (00:00 às 06:00 = 6,0h normais na Quarta) -> R$ 120,00.
- **Resultado Esperado:** 8h normais, Custo total: R$ 160,00.
- **Resultado Obtido:** 8h normais, Custo total: R$ 160,00.
- **Status:** ✅ APROVADO.

### Cenário 7: Jornada que atravessa de dia comum para domingo
- **Entrada:** Data 2026-10-24 (Sábado), Entrada: 20:00, Saída: 04:00 (Domingo), Duração: 8,0h, Valor-Hora: R$ 20,00.
- **Comportamento:**
  - Tramo 1 (Sábado 20:00 às 24:00 = 4h comuns normais) -> $4 \times 20 = \text{R\$} 80,00$.
  - Tramo 2 (Domingo 00:00 às 04:00 = 4h em domingo) -> $4 \times 20 \times 2 = \text{R\$} 160,00$.
- **Resultado Esperado:** 4h normais + 4h domingo, Custo: R$ 240,00.
- **Resultado Obtido:** 4h normais + 4h domingo, Custo: R$ 240,00.
- **Status:** ✅ APROVADO.

### Cenário 8: Jornada que atravessa de dia comum para feriado
- **Entrada:** Data 2026-10-20 (Terça), Entrada: 20:00, Saída: 04:00 (Quarta marcada como feriado), Duração: 8,0h, Valor-Hora: R$ 20,00.
- **Comportamento:**
  - Tramo 1: 4h normais na terça -> R$ 80,00.
  - Tramo 2: 4h no feriado de quarta -> R$ 160,00.
- **Resultado Esperado:** Custo total: R$ 240,00.
- **Resultado Obtido:** Custo total: R$ 240,00.
- **Status:** ✅ APROVADO.

### Cenário 9: Comparação entre escalas com o mesmo valor por hora
- **Entrada:**
  - Escala A (5x2, 40h comuns, R$ 25/h) -> Custo: R$ 1.000,00.
  - Escala B (6x1 com 32h comuns e 8h domingo, R$ 25/h) -> Custo: R$ 1.200,00.
- **Resultado Esperado:** Escala A classificada em 1º lugar (Menor Custo); Escala B com diferença de +R$ 200,00 (+20%). Sinalizador de discrepância de valor-hora desativado (`false`).
- **Resultado Obtido:** Escala A classificada em 1º; diferença de R$ 200,00; `hasRateDiscrepancy: false`.
- **Status:** ✅ APROVADO.

### Cenário 10: Comparação entre escalas com valores por hora diferentes
- **Entrada:**
  - Escala Júnior (8h normais, R$ 20/h) -> Custo: R$ 160,00.
  - Escala Sênior (8h normais, R$ 50/h) -> Custo: R$ 400,00.
- **Resultado Esperado:** Aviso de alerta `hasRateDiscrepancy = true` emitido para evitar interpretações operacionais equivocadas.
- **Resultado Obtido:** Alerta disparado com sucesso; ordenação correta.
- **Status:** ✅ APROVADO.

### Cenário 11: Campos inválidos ou incompletos
- **Entrada:** Escala sem nome, valor-hora negativo (-5), limite zero, horários inválidos (99:99), duração nula (entrada = saída).
- **Resultado Esperado:** Rejeição graciosa através de `validateScale` e `validateJourney`, com lista detalhada de mensagens em português (pt-BR).
- **Resultado Obtido:** Validações defensivas disparadas sem exceções não tratadas.
- **Status:** ✅ APROVADO.

### Cenário 12: Persistência e exclusão de dados locais (`localStorage`)
- **Procedimento:** Salvar cenários no `localStorage`, recarregar e conferir integridade dos dados salvos; acionar exclusão com confirmação e verificar retorno ao estado limpo.
- **Resultado Esperado:** Dados persistem com chave `simulador_escalas_dados` e limpeza remove os dados com segurança.
- **Status:** ✅ APROVADO.

### Cenário 13: Responsividade e usabilidade em telas menores
- **Procedimento:** Verificação das classes responsivas do Tailwind CSS e estilos auxiliares para visualização em resoluções mobile (375px a 768px), com tabelas roláveis horizontalmente e formulários em coluna única adaptativa.
- **Resultado Esperado:** Interface totalmente utilizável sem quebra de layout.
- **Status:** ✅ APROVADO.
