# Simulador de Escalas e Custos de RH

Aplicação web estática voltada a Recursos Humanos (RH), Departamento Pessoal e Gestão Operacional, projetada para cadastrar diferentes jornadas de trabalho, calcular de forma transparente as horas e os adicionais legais/simulados e comparar alternativas de escalas para identificar a opção de **menor custo estimado para a empresa**.

> **Identificação do Desenvolvedor:**  
> **Desenvolvedor: Diego Miranda Cezar**

---

## 1. Objetivo do Projeto

O objetivo principal desta ferramenta é apoiar o planejamento e a tomada de decisão operacional sobre alocação de equipes e formatação de escalas, permitindo:

- Cadastrar e parametrizar diferentes escalas de trabalho (com valor-hora e limite diário configuráveis).
- Registrar jornadas detalhadas com data, horário de entrada, horário de saída e marcação de feriados.
- Identificar automaticamente os domingos do calendário civil e permitir marcação manual de feriados.
- Calcular a duração real das jornadas, inclusive com tratamento especializado para **jornadas noturnas que atravessam a meia-noite**, dividindo os períodos para aplicar a remuneração exata de cada dia civil (ex.: sábado comum virando para domingo remunerado a 200%).
- Apurar horas normais (100%), horas extras comuns (adicional de 50%) e domingos/feriados (remuneração estimada a 200% com adicional de 100%).
- Comparar múltiplas escalas em um ranking ordenado do menor para o maior custo estimado, destacando a alternativa mais econômica e alertando caso haja divergência no valor da hora entre os cenários.
- Persistir dados no navegador do usuário via `localStorage` e disponibilizar backup/restauração via arquivo JSON.

---

## 2. Tecnologias Utilizadas e Restrições Técnicas

O projeto foi rigorosamente concebido como uma **aplicação estática cliente (client-side pura)**, respeitando todas as diretrizes do `SPEC.md`:

- **HTML5:** Estrutura semântica, acessível e otimizada.
- **CSS3:** Estilização moderna, transições suaves, tipografia refinada e suporte responsivo (mobile e desktop).
- **Tailwind CSS:** Carregado via CDN para agilidade visual e utilitários de layout.
- **JavaScript Puro (Vanilla JS ES6+):** Lógica desacoplada em funções puras, sem dependência de frameworks ou transpiladores.
- **localStorage:** Mecanismo de persistência local no navegador.

### Restrições Arquiteturais Cumpridas
- ❌ **Sem Node.js em tempo de execução.**
- ❌ **Sem backend próprio ou servidor HTTP.**
- ❌ **Sem banco de dados.**
- ❌ **Sem frameworks JS adicionais (React, Vue, Angular, Svelte, jQuery).**
- ❌ **Sem processos de build, compilação ou empacotadores.**

---

## 3. Estrutura de Arquivos do Projeto

```text
Simulador de Escalas/
├── index.html                   # Página principal da aplicação estática
├── SPEC.md                      # Especificação funcional e técnica de referência
├── README.md                    # Manual do usuário, documentação técnica e de negócio
├── simulador-escalas-plan.md    # Plano de implementação estruturado
├── .gitignore                   # Regras de segurança e exclusão do Git
├── css/
│   └── styles.css               # Estilos complementares, animações e responsividade
├── js/
│   ├── calculator.js            # Módulo puro de cálculos de RH e regras de negócio
│   ├── storage.js               # Gerenciador de persistência e dados no localStorage
│   └── app.js                   # Controlador de interface, renderização e eventos
├── docs/
│   ├── regras-calculo.md        # Catálogo formal de fórmulas, premissas e limitações
│   └── testes.md                # Registro de execução e validação dos 13 cenários
└── tests/
    ├── test-calculator.js       # Script de validação matemática dos 13 cenários obrigatórios
    ├── test-business-flow.js    # Script de validação de fluxo de dados e persistência
    └── verify-dom-ids.js        # Script de auditoria de consistência entre DOM e JavaScript
```

---

## 4. Como Executar a Aplicação

A execução é extremamente simples e não requer nenhuma instalação:

1. Baixe ou clone o repositório em seu computador.
2. Dê um duplo clique no arquivo **`index.html`** (ou abra-o em qualquer navegador web moderno: Chrome, Edge, Firefox, Safari ou Opera).
3. A aplicação carregará imediatamente com três cenários de exemplo pré-configurados para testes e demonstração.

> *Nota sobre conexão:* O Tailwind CSS e as fontes Google Fonts utilizam CDNs públicas para carregar estilos. Para visualização com o layout estilizado completo, mantenha conexão com a internet. A lógica de cálculo funciona 100% offline.

---

## 5. Como Cadastrar e Comparar Escalas

### 5.1. Criando ou Editando uma Escala
1. No cabeçalho, clique no botão **"Nova Escala"** (ou em **"Configurar Parâmetros"** para alterar a escala ativa).
2. Informe o **Nome da Escala** (ex.: *Escala Semanal — Funcionário X*, *Escala Semanal — Funcionário Y*).
3. Opcionalmente, informe o **Cenário / Colaborador** (ex.: *Funcionário X*, *Funcionário Y*).
4. Configure os parâmetros da simulação:
   - **Valor da Hora Normal (R$)** (ex.: R$ 20,00).
   - **Limite Diário de Horas Normais** (ex.: 8,0 horas).
   - **Adicional de Horas Extras Comuns** (padrão: 50%).
   - **Remuneração para Domingos e Feriados** (padrão: 100% de adicional = 200%).
5. Clique em **Salvar Escala**.

### 5.2. Adicionando Jornadas (Individual ou Semana Completa)
Você pode adicionar jornadas de duas formas:

#### Opção A: Inclusão Dia a Dia com Seleção de Escala e Funcionário
1. No formulário de cadastro rápido:
   - **Escala de Destino:** Escolha a qual escala aquela jornada pertence.
   - **Funcionário (Fictício):** Digite ou selecione uma sugestão (ex.: *Funcionário X*, *Funcionário Y*).
   - **Data da Jornada:** Selecione a data (domingos são identificados automaticamente).
   - **Entrada e Saída:** Digite os horários (ex.: `08:00` às `16:00` ou `22:00` às `06:00` para plantão noturno).
   - **Feriado:** Marque se for feriado (ou se o dia seguinte após 00:00 for feriado).
2. Clique em **"Adicionar Jornada"**.

#### Opção B: Assistente de Semana Completa (7 dias em 1 clique)
1. Clique no botão **"📅 Incluir Semana Completa (7 dias)"**.
2. Selecione a **Escala de Destino** e informe o **Funcionário Fictício** (ex.: *Funcionário X* ou *Funcionário Y*).
3. Informe a **Segunda-feira de Início da Semana**.
4. Escolha o modelo de jornada semanal (ex.: *5x2 Comercial*, *6x1 com Domingo*, *5x2 com Horas Extras* ou personalize cada um dos 7 dias).
5. Clique em **"Gerar e Salvar 7 Jornadas"**. O sistema cadastra a semana inteira de uma só vez!

### 5.3. Comparando a Semana do Funcionário X vs Funcionário Y
1. Cadastre a semana de jornadas do **Funcionário X** (ex.: 5x2 Comercial, 40h @ R$ 20/h = R$ 800,00).
2. Cadastre a semana de jornadas do **Funcionário Y** (ex.: 6x1 com Domingo, 42h @ R$ 20/h = R$ 980,00).
3. Clique na aba **"Comparação Geral de Escalas"**.
4. A tela apresentará:
   - A **Tabela Ranqueada** com todas as escalas, indicando claramente o colaborador (`👤 Funcionário X` vs `👤 Funcionário Y`).
   - O selo **"1º (Menor Custo)"** na alternativa mais econômica (Funcionário X como referência de menor custo).
   - O cálculo da **Diferença (+R$ 180,00 / +22,5%)** do Funcionário Y em relação ao Funcionário X.
   - **Cards Resumo** de cada escala com os totais de horas normais, extras e domingos/feriados.

---

## 6. Fórmulas e Regras de Negócio de RH

### 6.1. Duração da Jornada
- Saída > Entrada: $\text{Duração} = \text{Saída} - \text{Entrada}$
- Saída $\le$ Entrada (atravessa meia-noite):
  $$\text{Duração} = (24\text{h} - \text{Entrada}) + \text{Saída}$$
  A jornada é fracionada em dois tramos de calendário civil: antes da meia-noite (data inicial) e após a meia-noite (data seguinte).

### 6.2. Horas Normais em Dias Comuns
$$\text{Horas Normais} = \min(\text{Horas Trabalhadas}, \text{Limite Diário})$$
$$\text{Custo Normal} = \text{Horas Normais} \times \text{Valor da Hora}$$

### 6.3. Horas Extras com Adicional de 50% em Dias Comuns
$$\text{Horas Extras} = \max(0, \text{Horas Trabalhadas} - \text{Limite Diário})$$
$$\text{Custo Extras} = \text{Horas Extras} \times \text{Valor da Hora} \times 1{,}50$$

### 6.4. Domingos e Feriados (Adicional de 100%)
$$\text{Custo Domingos e Feriados} = \text{Horas Elegíveis} \times \text{Valor da Hora} \times 2{,}00$$
- *Premissa da simulação:* Não há acúmulo de 50% com 100%. Feriados coincidentes com domingo aplicam o multiplicador de 2,0x uma única vez.

### 6.5. Exemplo do SPEC (Seção 8.5)
- **Valor da hora:** R$ 20,00 | **Limite:** 8h | **Jornada em dia comum:** 10h
  - Horas normais: $8\text{h} \times \text{R\$} 20,00 = \text{R\$} 160,00$
  - Horas extras: $2\text{h} \times \text{R\$} 20,00 \times 1{,}5 = \text{R\$} 60,00$
  - **Custo total:** $\text{R\$} 220,00$
- **Jornada de 8h em domingo:**
  - $8\text{h} \times \text{R\$} 20,00 \times 2{,}0 = \text{R\$} 320,00$

---

## 7. Limitações Conhecidas da Simulação

Em conformidade com a Seção 15 do `SPEC.md`, esta versão **não** calcula:
1. Encargos patronais e tributários (FGTS, INSS, RAT, Terceiros/Sistema S).
2. Descanso Semanal Remunerado (DSR) e seus reflexos sobre horas extras.
3. Adicional noturno (20%) e hora ficta noturna de 52min30s (art. 73 da CLT).
4. Férias, 13º salário ou verbas rescisórias.
5. Regras particulares de acordos ou convenções coletivas de trabalho.
6. Intervalos intrajornada obrigatórios para repouso e alimentação.

---

## 8. Persistência Local dos Dados (`localStorage`)

- Os dados das escalas e jornadas ficam salvos **exclusivamente na memória local do navegador** em que foram cadastrados, sob a chave `simulador_escalas_dados_v1`.
- Não há envio ou sincronização com servidores externos ou bancos de dados remotos.
- Limpar os dados de navegação ou cache removerá os registros locais.
- A aplicação oferece a funcionalidade **"Dados (JSON)"** no topo para exportar um arquivo de backup `.json` a qualquer momento ou restaurar dados em outro computador.

---

## 9. Bateria de Testes Executados

Foram executados e validados com 100% de sucesso os 13 cenários obrigatórios do `SPEC.md`:

| Nº | Cenário Testado | Resultado Esperado | Resultado Obtido | Status |
|:--:|---|---|---|:--:|
| 1 | Jornada inferior ao limite (6h com limite 8h) | R$ 120,00 | R$ 120,00 | ✅ APROVADO |
| 2 | Jornada exatamente no limite (8h com limite 8h) | R$ 160,00 | R$ 160,00 | ✅ APROVADO |
| 3 | Jornada acima do limite (10h com limite 8h - SPEC 8.5) | R$ 220,00 | R$ 220,00 | ✅ APROVADO |
| 4 | Jornada em domingo (8h domingo - SPEC 8.5) | R$ 320,00 | R$ 320,00 | ✅ APROVADO |
| 5 | Jornada em feriado manual (8h feriado) | R$ 320,00 | R$ 320,00 | ✅ APROVADO |
| 6 | Jornada atravessando meia-noite em dia comum (22h às 06h) | R$ 160,00 (8h normais) | R$ 160,00 | ✅ APROVADO |
| 7 | Jornada de Sábado para Domingo (20h às 04h) | R$ 240,00 (4h normais + 4h dom) | R$ 240,00 | ✅ APROVADO |
| 8 | Jornada de dia comum para feriado (20h às 04h) | R$ 240,00 (4h normais + 4h fer) | R$ 240,00 | ✅ APROVADO |
| 9 | Comparação com mesmo valor por hora | Identificação da 5x2 como menor custo | R$ 1.000 vs R$ 1.200 | ✅ APROVADO |
| 10 | Comparação com valores-hora distintos | Emissão de alerta de discrepância | Alerta exibido com sucesso | ✅ APROVADO |
| 11 | Validação defensiva de campos inválidos | Rejeição amigável em pt-BR | Validado | ✅ APROVADO |
| 12 | Persistência e exclusão no localStorage | Manutenção e limpeza com confirmação | Validado | ✅ APROVADO |
| 13 | Feriado coincidente com domingo | Adicional único de 100% (200% total) | R$ 320,00 (não 400 nem 640) | ✅ APROVADO |

O detalhamento completo pode ser consultado em [docs/testes.md](docs/testes.md).

---

## 10. Sugestão de Comandos Git para Execução Manual

Conforme estipulado nas diretrizes do projeto (Seção 9 do prompt e Seção 19 do SPEC), **nenhum comando de commit ou push foi executado automaticamente**.

Para revisar o estado dos arquivos e realizar o versionamento manualmente:

```bash
# 1. Verificar os arquivos alterados e não monitorados
git status

# 2. Adicionar as modificações e novos arquivos estáticos
git add index.html SPEC.md README.md .gitignore css/ js/ docs/ tests/

# 3. Criar o commit com mensagem padronizada
git commit -m "feat: implementar simulador estatico de escalas de RH com comparacao de custos e testes"

# 4. Enviar para o repositorio remoto (quando autorizado)
git push origin main
```
