# Malemi — Simulador de Escalas e Custos de Folha de Pagamento

Aplicação e API REST para planejamento, estruturação de escalas de trabalho e estimativa de impactos na folha de pagamento, desenvolvida para a **Malemi Data Solutions**.

Projetada com base estrita no [`SPEC.md`](.doc/SPEC.md), focando na **Fase 1 (Levantamento, Validação e Preparação Segura)**. O sistema mantém dados de folha de referência intactos, rastreia todas as rubricas e bloqueia a presunção de regras jurídicas ou de convenções coletivas (CCT) antes de sua homologação formal.

---

## 🛠️ Tecnologias Utilizadas

A solução foi construída utilizando exclusivamente a stack solicitada, sem over-engineering:

- **Back-end:** JavaScript (Node.js nativo utilizando `node:http`, `node:fs`, `node:test`). Zero dependências externas no runtime, garantindo portabilidade imediata, performance e alta segurança.
- **Front-end:** HTML5 semântico, Vanilla JavaScript e Tailwind CSS (via CDN oficial) com design system personalizado (*glassmorphism*, dark mode e responsividade).
- **Testes:** Test Runner nativo do Node.js (`node --test`).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** v18.0.0 ou superior (testado no Node.js v24.21.0).
- Nenhum `npm install` externo é necessário para iniciar a aplicação, pois ela utiliza os módulos nativos do Node.js.

### 1. Iniciar o Servidor e a API
```bash
npm start
```
Ou em modo de desenvolvimento com recarregamento automático:
```bash
npm run dev
```

O servidor iniciará em:
- **Interface Web:** [http://127.0.0.1:3000](http://127.0.0.1:3000)
- **API Health Check:** [http://127.0.0.1:3000/api/health](http://127.0.0.1:3000/api/health)

### 2. Executar os Testes Automatizados
```bash
npm test
```
A suíte de testes unitários e de integração valida cálculos de turnos noturnos, calendário mensal, integridade de eventos independentes e qualidade de ingestão de dados.

---

## 📚 Endpoints da API REST

Todas as respostas são servidas em JSON (`application/json; charset=utf-8`) com suporte a CORS liberado para integrações.

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/health` | Verifica status de operação da API, versão e fase do projeto. |
| `GET` | `/api/filiais` | Lista as filiais cadastradas (Matriz São Paulo, Filial 1 Campinas, Filial 2 Rio de Janeiro). |
| `GET` | `/api/funcionarios` | Retorna colaboradores com dados fictícios anonimizados (aceita filtro `?filialId=FIL-01`). |
| `POST` | `/api/funcionarios` | Cadastra um novo colaborador com validação de campos obrigatórios. |
| `GET` | `/api/escalas` | Lista as escalas-base pré-configuradas (Comercial 5x2, Operacional 6x1, Plantão 12x36 Diurno/Noturno). |
| `POST` | `/api/escalas/validar` | Valida parâmetros de jornada, formato `HH:mm` e intervalo intrajornada mínimo. |
| `POST` | `/api/escalas/calendario` | Gera o calendário de um mês específico (dias de trabalho, DSR, feriados, horas noturnas e ajustes manuais). |
| `GET` | `/api/eventos` | Retorna o catálogo de eventos da folha com classificação (Independente vs Dependente da escala). |
| `GET` | `/api/regras` | Lista hipóteses de cálculo mapeadas, fontes normativas e pendências de homologação. |
| `POST` | `/api/simulacoes` | Processa simulação comparativa entre a folha de referência e uma nova escala com rastreabilidade auditável. |
| `POST` | `/api/importacao/validar` | Valida lote de linhas de planilha e emite relatório de qualidade (duplicidades, campos vazios, eventos novos). |

---

## 📂 Estrutura do Repositório

```text
├── .doc/                      # Documentação de origem e especificações
│   ├── SPEC.md                # Especificação funcional completa da Malemi
│   └── prompt_github.md       # Diretrizes de análise, DevOps e segurança
├── docs/                      # Documentação funcional e arquitetural
│   ├── dicionario_dados.md    # Estrutura das entidades e critérios de ingestão
│   ├── catalogo_eventos.md    # Inventário e classificação das rubricas de folha
│   ├── regras_calculo.md      # Hipóteses registradas, fontes e pendências
│   ├── plano_testes.md        # Matriz de testes de qualidade e critérios de aceite
│   └── decisoes_tecnicas.md   # Registros de Decisão de Arquitetura (ADRs)
├── public/                    # Interface Frontend
│   ├── index.html             # Painel SPA com abas e explorador de API
│   ├── styles.css             # Tokens visuais e design system personalizado
│   └── app.js                 # Lógica de integração e consumo da API
├── src/                       # Código Fonte do Backend (JavaScript / Node.js)
│   ├── server.js              # Servidor HTTP nativo e roteador de estáticos
│   ├── api/
│   │   └── routes.js          # Controladores e despachantes REST da API
│   ├── models/
│   │   └── store.js           # Repositório em memória com dados mock anonimizados
│   └── services/
│       ├── scheduleService.js # Validação de turnos, jornadas e calendário mensal
│       ├── simulationService.js # Motor de simulação e rastreabilidade auditável
│       └── importValidator.js # Ingestão e relatório de qualidade dos dados
├── tests/                     # Testes Automatizados
│   └── api.test.js            # Suíte de testes com node:test e node:assert
├── .env.example               # Modelo seguro de variáveis de ambiente
├── .gitignore                 # Proteção estrita contra credenciais e dados reais
├── package.json               # Configurações do projeto e scripts npm
└── preparacao-api-simulador.md # Plano de execução do projeto
```

---

## 🔒 Segurança e Proteção de Dados

1. **Anonimização Integral:** O repositório contém apenas identificadores genéricos e nomes fictícios para validação de testes.
2. **Proteção no `.gitignore`:** Arquivos reais de folha (`.xlsx`, `.xls`, `.csv`), credenciais locais (`.env*`, `meu_git.txt`), certificados e diretórios de build estão estritamente bloqueados contra versionamento.
3. **Auditoria Contínua:** Nenhuma informação salarial real ou pessoal trafega para provedores externos.

---

## 📋 Comandos para Publicação no GitHub

Conforme os critérios de segurança do projeto, o `commit` e o `push` devem ser executados manualmente pelo usuário.

Após conferir os arquivos adicionados ao staging, execute no terminal do projeto:

```bash
git commit -m "feat: inicializar API REST e interface do simulador de escalas com documentacao e testes"
git push -u origin main
```
