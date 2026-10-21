# Registro de Decisões Técnicas e Arquiteturais (ADRs)
**Projeto:** Malemi Data Solutions — Simulador de Escalas e Custos de Folha  
**Fase:** 1 — Levantamento e Validação  

---

## ADR-001: Arquitetura Tecnológica da Aplicação e da API

### Status
**Aprovado**

### Contexto
O usuário solicitou explicitamente:
> *"quero um API feito somente em HTML , CSS e tailwind , java script . use o java script para o back-end"*

Ao mesmo tempo, as diretrizes da especificação técnica (`SPEC.md`) exigem:
1. Simplicidade pragmática, evitando over-engineering de frameworks pesados e bancos de dados externos antes de justificada a necessidade.
2. Isolamento rígido entre interface, modelo de dados, calendário e motor de simulação.
3. Segurança máxima: nenhuma planilha real, credencial ou dado pessoal de colaboradores pode ser trafegado para nuvem de terceiros ou versionado.
4. Portabilidade imediata e facilidade de execução em qualquer ambiente Node.js sem atrito de compilação ou vulnerabilidade de dependências.

### Decisão
1. **Back-end:** Desenvolvido em **JavaScript nativo (Node.js)** utilizando os módulos nativos do Node (`node:http`, `node:fs`, `node:path`, `node:test`).
   - Não depende de dezenas de pacotes externos no `node_modules` para inicializar a API.
   - Fornece roteamento HTTP REST limpo, tratamento de CORS, decodificação JSON, validação de payload e geração de respostas estruturadas.
   - Serviços divididos em: `store.js` (dados em memória e persistência segura em JSON local), `scheduleService.js` (cálculo de turnos, jornadas e ciclos de calendário), `simulationService.js` (motor de simulação com rastreabilidade) e `importValidator.js` (qualidade de dados).
2. **Front-end:** Interface moderna e interativa desenvolvida com **HTML5 semântico**, **CSS personalizado** e **Tailwind CSS** (via CDN oficial), com scripts em **JavaScript vanilla**.
   - Fornece painel completo: explorador de rotas da API em tempo real, visualizador de escalas e calendário interativo, catálogo de eventos com status de validação, comparador de cenários e relatório de qualidade de importação.
3. **Testes:** Runner nativo `node --test` integrado ao Node.js v24, garantindo testes rápidos, determinísticos e sem dependências pesadas.

### Consequências
- **Vantagens:**
  - Instalação e execução instantâneas com zero atrito (`node src/server.js` ou `npm start`).
  - Imunidade a falhas de segurança e depreciações decorrentes de cadeias complexas de dependências npm.
  - O código permanece legível, auditável e simples de manter.
  - Aderência total ao pedido do usuário ("HTML, CSS e tailwind, javascript no backend").
- **Mitigações:**
  - A persistência inicial ocorre em memória/JSON local; caso a empresa decida no futuro por banco de dados relacional (ex: PostgreSQL), o repositório de dados (`store.js`) atuará como camada de abstração de dados (Repository Pattern).

---

## ADR-002: Proteção de Dados e Anonimização

### Status
**Aprovado**

### Contexto
Folhas de pagamento corporativas contêm dados confidenciais regidos pela LGPD (nomes, CPFs, salários, benefícios). Publicar essas informações no GitHub resultaria em incidente grave de segurança e privacidade.

### Decisão
- O repositório conterá apenas dados de demonstração com identificadores fictícios e nomes claramente anonimizados.
- Arquivos de extensão `.xlsx`, `.xls`, `.csv`, `.key` e `.env` são sumariamente ignorados no `.gitignore`.
- O arquivo `.doc/meu_git.txt` foi protegido contra commit via regra explícita no `.gitignore`.
- Comandos `git commit` e `git push` não são executados de forma automatizada pelo agente; os comandos revisados são entregues para revisão humana e execução manual.

### Consequências
- Repositório seguro e pronto para publicação no GitHub sem risco de vazamento de informações sensíveis.

---

## ADR-003: Isolamento das Fórmulas de Folha e Tratamento de Pendências

### Status
**Aprovado**

### Contexto
O projeto ainda se encontra na Fase 1 (Levantamento). Nenhuma convenção coletiva ou regra definitiva de cálculo foi homologada pelo responsável da folha de pagamento da Malemi.

### Decisão
- O motor de simulação da API não inventará fórmulas prontas.
- Para eventos independentes (salário contratual), mantém o valor da referência.
- Para eventos dependentes cujas regras estejam em aberto (horas extras, adicional noturno, DSR), o motor calcula a projeção de horas da escala e emite um status explícito `PENDENTE_HOMOLOGACAO`, acompanhado de notas detalhadas no `auditTrail`.
- Nenhum evento desconhecido é zerado ou descartado.

### Consequências
- A ferramenta apoia a tomada de decisão com total transparência e sem criar falsas expectativas de conformidade jurídica antes da validação formal.
