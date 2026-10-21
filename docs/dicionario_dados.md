# Dicionário de Dados — Simulador de Escalas e Custos de Folha
**Projeto:** Malemi Data Solutions  
**Fase:** 1 — Levantamento e Validação  
**Status:** Estrutura Proposta / Aguardando Planilha Real Anonimizada  

---

## 1. Visão Geral
Este documento especifica o modelo e os campos previstos para a ingestão de dados oriundos da folha de pagamento e do planejamento de escalas. Como a planilha de folha original ainda não foi disponibilizada, este dicionário estabelece a interface lógica esperada e os critérios de validação para cada entidade.

---

## 2. Entidades Principais

### 2.1 Funcionário / Vínculo (`Employee`)
Representa o colaborador cadastrado no sistema de folha.

| Campo | Tipo | Obrigatório | Descrição | Regra de Validação / Observação |
|---|---|---|---|---|
| `id` | String | Sim | Identificador interno único | Gerado pelo sistema (UUID ou ID de folha). |
| `matricula` | String | Sim | Matrícula de folha | Código funcional de folha. Não pode haver duplicidade ativa. |
| `nome` | String | Sim | Nome completo (ou anonimizado) | Em ambiente de teste/demonstração deve ser anonimizado. |
| `filial_id` | String | Sim | Código da filial de lotação | Deve corresponder a uma filial válida (ex: Matriz, Filial 1, Filial 2). |
| `cargo` | String | Sim | Cargo / função exercida | Utilizado para enquadramento de jornada e convenção. |
| `regime_remuneracao` | Enum | Sim | Tipo de remuneração | Valores: `MENSALISTA`, `HORISTA`. |
| `salario_base` | Decimal | Sim | Salário contratual bruto | Valor numérico positivo (R$). |
| `jornada_mensal_ref` | Inteiro | Não | Horas contratuais mensais de referência | Hipóteses em validação: `200` (mensalistas), `220` (horistas), `180` (específicos). **Requer homologação**. |
| `escala_id` | String | Não | Escala base associada | ID da escala de trabalho padrão. |

---

### 2.2 Filial (`Branch`)
Representa a unidade operacional da empresa.

| Campo | Tipo | Obrigatório | Descrição | Regra de Validação / Observação |
|---|---|---|---|---|
| `id` | String | Sim | Identificador único | Ex: `FILIAL-001`, `FILIAL-002`, `FILIAL-003`. |
| `nome` | String | Sim | Razão social ou nome fantasia | Ex: Matriz, Filial SP, Filial RJ. |
| `cidade` | String | Sim | Município | Importante para feriados municipais específicos. |
| `uf` | String (2) | Sim | Estado federativo | Para feriados estaduais. |
| `total_colaboradores` | Inteiro | Não | Total de colaboradores alocados | Campo informativo computado. |

---

### 2.3 Escala e Turno (`WorkSchedule`)
Define a grade de trabalho planejada.

| Campo | Tipo | Obrigatório | Descrição | Regra de Validação / Observação |
|---|---|---|---|---|
| `id` | String | Sim | Identificador único da escala | Ex: `ESC-5X2-ADM`, `ESC-6X1-FAB`, `ESC-12X36-NOT`. |
| `nome` | String | Sim | Nome descritivo da escala | Ex: "Comercial 5x2 08h-17h", "Revezamento 6x1". |
| `tipo_ciclo` | Enum | Sim | Tipo de periodicidade | `SEMANAL`, `CICLICO_DIAS` (ex: 12x36). |
| `dias_trabalho` | Inteiro | Sim | Dias consecutivos de trabalho | Ex: 5, 6, 1. |
| `dias_folga` | Inteiro | Sim | Dias consecutivos de descanso | Ex: 2, 1, 1 (ou DSR). |
| `horario_entrada` | String | Sim | Hora de início do turno | Formato `HH:mm`. |
| `horario_saida` | String | Sim | Hora de término do turno | Formato `HH:mm`. Suporta virada de noite (ex: `22:00` às `06:00`). |
| `intervalo_minutos` | Inteiro | Sim | Duração do intervalo intrajornada | Em minutos (ex: 60 para 1h). |
| `atravessa_meia_noite` | Booleano | Sim | Flag de turno noturno/misto | `true` se saída < entrada no mesmo dia civil. |

---

### 2.4 Calendário Mensal e Apontamento Diário (`DailySchedule`)
Representa o cronograma diário projetado para um funcionário ou grupo em um mês específico.

| Campo | Tipo | Obrigatório | Descrição | Regra de Validação / Observação |
|---|---|---|---|---|
| `data` | String (YYYY-MM-DD) | Sim | Data do calendário | Data válida do calendário gregoriano. |
| `funcionario_id` | String | Sim | Referência ao funcionário | Vinculação direta. |
| `tipo_dia` | Enum | Sim | Classificação do dia | `TRABALHO`, `DSR`, `FOLGA`, `FERIADO`, `ELEICAO`, `AFASTAMENTO`. |
| `horas_planejadas` | Decimal | Sim | Total de horas líquidas de jornada | Descontado o intervalo. |
| `horas_noturnas_est` | Decimal | Não | Horas no período noturno (22h às 05h) | Estimativa prévia; requer confirmação de redução de hora noturna. |
| `ajuste_manual` | Booleano | Sim | Indica se o dia sofreu edição manual | `true` se o usuário alterou o dia gerado pela escala base. |
| `observacoes` | String | Não | Justificativa do ajuste manual | Texto descritivo da alteração. |

---

### 2.5 Evento de Folha de Referência (`PayrollEventEntry`)
Representa um lançamento importado da folha de pagamento oficial para conferência.

| Campo | Tipo | Obrigatório | Descrição | Regra de Validação / Observação |
|---|---|---|---|---|
| `codigo_evento` | String | Sim | Código contábil/folha do evento | Ex: `101`, `205`, `302`. |
| `descricao_evento` | String | Sim | Nome do evento na folha | Conforme planilha exportada do ERP. |
| `tipo` | Enum | Sim | Natureza do evento | `PROVENTO`, `DESCONTO`, `INFORMATIVO`. |
| `referencia` | Decimal | Não | Horas, dias ou percentual base | Ex: 220 horas, 50%, etc. |
| `valor` | Decimal | Sim | Valor monetário em reais | Valor nominal importado da folha de referência. |
| `classificacao_escala` | Enum | Sim | Vínculo com a escala | `INDEPENDENTE`, `DEPENDENTE`, `PENDENTE_VALIDACAO`. |

---

## 3. Qualidade dos Dados e Validações de Ingestão
Durante a importação do arquivo da folha:
1. **Campos Obrigatórios Ausentes:** Linhas sem matrícula, nome ou salário base são marcadas como `INCONSISTENTE` e não descartadas.
2. **Duplicidades:** Matrículas duplicadas na mesma competência geram alerta para conciliação.
3. **Eventos Não Mapeados:** Nenhum evento é omitido. Qualquer evento não reconhecido entra como `PENDENTE_VALIDACAO`.
4. **Formatação Numérica:** Tratar vírgulas e pontos decimais do padrão brasileiro (pt-BR).
