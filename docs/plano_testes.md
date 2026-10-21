# Plano de Testes de Qualidade e Validação
**Projeto:** Malemi Data Solutions  
**Fase:** 1 — Levantamento e Validação da Arquitetura  
**Framework de Testes:** Test Runner nativo do Node.js (`node --test`)  

---

## 1. Escopo dos Testes

O objetivo dos testes nesta fase inicial é garantir:
1. **Integridade da API REST:** Respostas nos padrões esperados (HTTP 200, 201, 400, 404).
2. **Qualidade dos Dados Ingeridos:** Detecção de campos obrigatórios ausentes, identificação de duplicidades e eventos desconhecidos.
3. **Validação de Escalas e Calendário:**
   - Detecção de sobreposição de horários e intervalos inválidos.
   - Cálculo de turnos que atravessam a meia-noite (virada noturna).
   - Preservação de dias ajustados manualmente versus calendário planejado.
4. **Isolamento e Rastreabilidade do Motor de Simulação:**
   - Garantir que eventos independentes da escala não sejam alterados.
   - Garantir que eventos sem fórmula aprovada sejam sinalizados como `PENDENTE_HOMOLOGACAO` e nunca descartados ou zerados.
   - Geração correta da memória de cálculo auditável (`auditTrail`).

---

## 2. Matriz de Casos de Teste Automatizados

| ID | Módulo / Endpoint | Cenário Testado | Entrada de Teste | Resultado Esperado | Status |
|---|---|---|---|---|---|
| `CT-API-01` | `GET /api/health` | Verificação de disponibilidade e versão do sistema | Requisição GET | HTTP 200, status `ok`, versão semântica e timestamp | Automatizado |
| `CT-API-02` | `GET /api/filiais` | Listagem de filiais cadastradas | Requisição GET | HTTP 200, array contendo filiais (Matriz, Filial 1, etc.) | Automatizado |
| `CT-API-03` | `GET /api/funcionarios` | Listagem com dados anonimizados | Requisição GET | HTTP 200, colaboradores com dados seguros sem exposição real | Automatizado |
| `CT-ESC-01` | `POST /api/escalas/validar` | Validação de escala com intervalo menor que o mínimo legal | Horário: 08:00 às 17:00, intervalo: 0 minutos | HTTP 400, mensagem de erro de intervalo obrigatório | Automatizado |
| `CT-ESC-02` | `POST /api/escalas/calendario` | Geração de calendário para escala 5x2 e 12x36 | Ano: 2026, Mês: 10, Escala ID | HTTP 200, 31 dias gerados com marcações corretas de trabalho e folga | Automatizado |
| `CT-SIM-01` | `POST /api/simulacoes` | Simulação sem alteração de eventos independentes | Cenário com funcionário mensalista | HTTP 200, salário base inalterado na comparação | Automatizado |
| `CT-SIM-02` | `POST /api/simulacoes` | Sinalização de pendência de regras | Evento 201 (Hora Extra 50%) | HTTP 200, valor marcado com status `PENDENTE_HOMOLOGACAO` | Automatizado |
| `CT-IMP-01` | `POST /api/importacao/validar` | Relatório de qualidade de dados com linhas inválidas | Array contendo registros com matrícula vazia e salário negativo | HTTP 200, relatório com array de `erros` e `alertas` mapeados | Automatizado |

---

## 3. Critérios de Aceite
- 100% dos testes unitários e de integração da API devem passar sem falhas (`0 failing`).
- Nenhum teste pode efetuar chamadas a bancos de dados externos ou requisições de rede externas.
- Execução rápida (< 2 segundos).
