# Regras de Cálculo, Fontes e Pendências
**Projeto:** Malemi Data Solutions  
**Fase:** 1 — Levantamento e Validação  
**Status:** Hipóteses Registradas — Nenhuma Regra Codificada em Definitivo  

---

## 1. Princípio Fundamental de Arquitetura de Negócio

Conforme estipulado no `SPEC.md` e nas diretrizes gerais:
> **"Nesta primeira etapa, não implemente fórmulas do motor de cálculo da folha. Não invente fórmulas, percentuais, regras trabalhistas ou convenções coletivas."**

Cada regra antes de ser codificada no motor definitivo deve possuir:
1. Fonte jurídica ou normativa formal (CLT, Acordo Coletivo, Convenção Coletiva, Regulamento Interno da Malemi).
2. Vigência e abrangência (Matriz, Filiais específicas, cargos elegíveis).
3. Metodologia de cálculo exata e ordem de precedência (qual evento calcula primeiro).
4. Casos de teste homologados pelo gestor da folha.
5. Aprovação explícita do responsável da Malemi.

---

## 2. Hipóteses Identificadas e Status Atual

### 2.1 Jornada Mensal e Divisor Contratual
- **Hipótese levantada:** 
  - Colaboradores administrativos / mensalistas: referência de 200 horas mensais.
  - Colaboradores de fábrica / operacionais horistas: referência de 220 horas mensais.
  - Cargos específicos: possível referência de 180 horas mensais.
- **Status:** *Hipótese preliminar — Não confirmada.*
- **Pendência técnica:** O cálculo do salário-hora para fins de horas extras e adicionais deve utilizar o divisor 200 ou 220? Como tratar colaboradores contratados por jornada reduzida?

---

### 2.2 Horas Extras em Dias Úteis (Adicional de 50%)
- **Hipótese levantada:** Horas que excederem o limite diário ou semanal acordado recebem adicional de 50%.
- **Status:** *Hipótese de levantamento.*
- **Pendência técnica:** Há banco de horas vigente formalizado por acordo? Existe tolerância de marcação de ponto (art. 58 da CLT)? Qual convenção coletiva define os percentuais para jornadas além de 2 horas extras diárias?

---

### 2.3 Horas Extras em Domingos, Feriados e Datas Especiais (100%)
- **Hipótese levantada:** Trabalho em domingos não compensados e feriados é remunerado a 100%.
- **Datas Especiais / Eleições:** Tratamento diferenciado para trabalho em dia de eleição.
- **Status:** *Hipótese de levantamento.*
- **Pendência técnica:** Em escalas 12x36 ou de revezamento contínuo, a folga compensatória afasta o adicional de 100% de domingos? Qual é a regra exata definida para folgas de eleição (concessão de dias de folga vs pagamento)?

---

### 2.4 Horário Noturno e Redução Ficta (22h às 05h)
- **Hipótese levantada:** Horas prestadas entre 22:00 e 05:00 sofrem adicional noturno (CLT art. 73 prevê 20%) e redução da hora ficta noturna para 52 minutos e 30 segundos (fator 1,142857).
- **Status:** *Hipótese técnica de referência.*
- **Pendência técnica:** Turnos que atravessam a meia-noite e se estendem após as 05:00 da manhã (Súmula 60 TST) recebem prorrogação de adicional noturno? A convenção coletiva estabelece percentual superior a 20%?

---

### 2.5 Reflexo de Descanso Semanal Remunerado (DSR)
- **Hipótese levantada:** Variáveis da escala (Horas Extras e Adicional Noturno) geram reflexo em DSR.
- **Fórmula padrão:** `(Soma das Variáveis no Mês / Dias Úteis) * (Domingos + Feriados do Mês)`.
- **Status:** *Pendente de homologação do calendário e de definição de sábados (dia útil não trabalhado vs dia útil).*

---

### 2.6 Custo Total da Empresa
- **Hipótese levantada:** A simulação deve comparar não apenas a remuneração bruta (proventos), mas o custo total para o empregador.
- **Status:** *Não definido.*
- **Pendência técnica:** Conforme o `SPEC.md`, **não chamar um valor de "Custo Total" até que os componentes estejam aprovados**. O custo total contemplará apenas encargos patronais (INSS patronal, RAT, FAP, Terceiros/Sistema S), FGTS (8%), provisões de 13º e férias (+1/3), e benefícios (VT, VR, plano de saúde)? Qual é o regime tributário da Malemi (Lucro Real, Presumido, Desoneração da Folha)?

---

## 3. Matriz de Rastreabilidade e Auditoria

Toda simulação executada pelo sistema deverá gerar um objeto de auditoria (`auditTrail`):
```json
{
  "simulacao_id": "SIM-2026-001",
  "data_execucao": "2026-10-21T20:00:00Z",
  "cenario": "Escala Alternativa 12x36",
  "eventos_processados": [
    {
      "codigo": "101",
      "status": "CALCULADO_FIXO",
      "regra": "Manutenção do salário base da folha de referência"
    },
    {
      "codigo": "201",
      "status": "PENDENTE_HOMOLOGACAO",
      "regra": "Jornada projetada x divisor; percentual 50% aguardando validação de CCT"
    }
  ],
  "alertas": [
    "Regra de Custo Total patronal ainda não configurada; exibindo apenas Proventos Brutos rastreados."
  ]
}
```
