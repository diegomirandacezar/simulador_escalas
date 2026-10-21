# Catálogo de Eventos de Folha de Pagamento
**Projeto:** Malemi Data Solutions  
**Fase:** 1 — Levantamento e Validação  
**Status:** Catálogo Preliminar — Sujeito à Homologação da Planilha Real  

---

## 1. Princípios de Classificação

Conforme a especificação do projeto (`SPEC.md`):
1. **Nenhum evento é descartado:** Todos os eventos da folha de referência devem constar na simulação.
2. **Separação por sensibilidade à escala:**
   - **Independente da Escala:** Eventos fixos contratuais cujo valor permanece inalterado qualquer que seja a escala simulada (ex: Salário Base, Insalubridade fixa, Gratificação de Função, Desconto de VT padrão, etc.).
   - **Dependente da Escala:** Eventos cuja ocorrência e valor derivam diretamente da jornada, dos dias trabalhados, turnos noturnos, DSRs ou sobrejornadas simuladas (ex: Horas Extras 50%, Horas Extras 100%, Adicional Noturno, Reflexo de DSR s/ Horas Extras).
   - **Pendente de Validação / Não Homologado:** Eventos identificados cuja regra de cálculo ou base de incidência ainda não foram validadas pelo responsável da folha.
3. **Não atribuir valor zero a eventos desconhecidos:** Devem ser mantidos com o valor da folha de referência e sinalizados com tag de pendência de regra.

---

## 2. Inventário Preliminar de Eventos

> **Nota:** A listagem abaixo reflete os eventos típicos de folha e as hipóteses de levantamento iniciais. O preenchimento definitivo ocorrerá com a entrega da planilha exportada pelo sistema de folha da Malemi.

| Código Preliminar | Nome do Evento | Tipo | Classificação de Escala | Status da Regra | Base de Incidência Teórica | Pendência / Dúvida em Aberto |
|---|---|---|---|---|---|---|
| `101` | Salário Contratual | Provento | **Independente** | Preliminar | Contratual | Mensalistas: fixo; Horistas: depende da carga mensal contratual (220h vs realizado). |
| `102` | Insalubridade | Provento | **Independente** | Pendente | Salário mínimo ou base? | Grau de risco (médio/máximo) e convenção coletiva aplicável. |
| `105` | Adicional de Periculosidade | Provento | **Independente** | Pendente | 30% s/ salário base | Aplicação restrita a cargos com exposição certificada. |
| `201` | Horas Extras 50% | Provento | **Dependente** | **Pendente de Homologação** | Hora normal + 50% | Hipótese: dias úteis além da jornada pactuada. Necessário definir divisor (200 ou 220). |
| `202` | Horas Extras 100% | Provento | **Dependente** | **Pendente de Homologação** | Hora normal + 100% | Hipótese: domingos e feriados sem folga compensatória compensada. |
| `203` | Adicional Noturno | Provento | **Dependente** | **Pendente de Homologação** | Percentual s/ hora normal | Hipótese CLT 20% das 22h às 05h; verificar se há previsão em CCT com 25% ou 30%. |
| `204` | Hora Ficta Noturna | Provento | **Dependente** | **Pendente de Homologação** | Fator 52m30s (1,142857) | Redução da hora noturna aplica-se a prorrogações após 05h? |
| `208` | DSR s/ Variáveis | Provento | **Dependente** | **Pendente de Homologação** | Fórmula DSR (Úteis x Descansos) | Calendário específico de cada mês (dias úteis vs repousos e feriados). |
| `301` | Dias Trabalhados Eleição | Informativo / Provento | **Dependente** | **Pendente de Homologação** | Folga dobrada ou pagamento | Definir política da empresa e acordos vigentes. |
| `501` | INSS Empregado | Desconto | **Derivado de Folha** | Pendente | Tabela progressiva | Cálculo de folha oficial (fora do escopo inicial da fase 1). |
| `502` | IRRF | Desconto | **Derivado de Folha** | Pendente | Tabela progressiva | Fora do escopo inicial de cálculo de escala. |
| `503` | Vale Transporte | Desconto | **Dependente** | Pendente | 6% ou custo real | Varia conforme o número de dias efetivamente trabalhados no mês? |
| `504` | Vale Refeição / Alimentação | Benefício / Custo | **Dependente** | Pendente | Valor diário x dias úteis | Custo de benefícios varia com o número de jornadas presenciais. |

---

## 3. Próximos Passos para Validação
1. Recebimento da planilha modelo (sem dados confidenciais ou com nomes anonimizados).
2. Validação da coluna de código e rubrica de folha do sistema ERP.
3. Homologação do responsável técnico sobre quais eventos integram o Custo Total da empresa (encargos patronais, FGTS, provisões de 13º e férias).
