/**
 * Lógica do Cliente Frontend (Vanilla JS)
 * Projeto: Simulador de Escalas e Custos de Folha - Malemi
 */

// Alternância entre abas
function switchTab(tabId) {
  const tabs = ['dashboard', 'api', 'calendario', 'eventos', 'simulador', 'validador'];
  
  tabs.forEach(id => {
    const pane = document.getElementById(`pane-${id}`);
    const btn = document.getElementById(`btn-tab-id` || `btn-tab-${id}`);
    if (pane) {
      if (id === tabId) {
        pane.classList.remove('hidden');
      } else {
        pane.classList.add('hidden');
      }
    }
    if (btn) {
      if (id === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  // Inicializações sob demanda
  if (tabId === 'calendario') {
    carregarCalendario();
  } else if (tabId === 'eventos') {
    carregarEventosERegras();
  }
}

// Verificação de Conexão com a API (Health Check)
async function verificarStatusApi() {
  const badge = document.getElementById('statusBadge');
  const text = document.getElementById('statusText');
  
  try {
    const start = performance.now();
    const res = await fetch('/api/health');
    const elapsed = Math.round(performance.now() - start);
    
    if (res.ok) {
      text.innerText = `API Online (${elapsed}ms)`;
      text.className = "text-emerald-400 font-medium";
    } else {
      text.innerText = `API Offline (${res.status})`;
      text.className = "text-red-400 font-medium";
    }
  } catch (err) {
    text.innerText = "API Offline";
    text.className = "text-red-400 font-medium";
  }
}

// Execução de Rotas no Explorador de API
async function executarRota(method, path, body = null) {
  const methodEl = document.getElementById('consoleMethod');
  const urlEl = document.getElementById('consoleUrl');
  const timeEl = document.getElementById('consoleTime');
  const outputEl = document.getElementById('consoleOutput');

  methodEl.innerText = method;
  methodEl.className = `px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
    method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
  }`;
  urlEl.innerText = path;
  outputEl.innerText = "Executando requisição...";

  try {
    const start = performance.now();
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(path, options);
    const data = await res.json();
    const elapsed = Math.round(performance.now() - start);

    timeEl.innerText = `${elapsed}ms (${res.status})`;
    outputEl.innerText = JSON.stringify(data, null, 2);
  } catch (err) {
    timeEl.innerText = "Erro";
    outputEl.innerText = `Erro ao conectar à rota: ${err.message}`;
  }
}

// Carregamento do Calendário Mensal
async function carregarCalendario() {
  const escalaId = document.getElementById('selectEscalaCal').value;
  const mes = Number(document.getElementById('selectMesCal').value);
  const ano = Number(document.getElementById('inputAnoCal').value);
  const grid = document.getElementById('calendarGrid');

  grid.innerHTML = '<div class="col-span-full py-8 text-center text-xs text-slate-400">Gerando calendário mensal da escala...</div>';

  try {
    const res = await fetch('/api/escalas/calendario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ano, mes, escalaId })
    });
    const data = await res.json();

    if (!res.ok) {
      grid.innerHTML = `<div class="col-span-full text-red-400 text-xs">${data.erro || 'Erro ao gerar calendário.'}</div>`;
      return;
    }

    // Atualizar sumário
    document.getElementById('sumDiasTrabalho').innerText = data.resumo.totalDiasTrabalho;
    document.getElementById('sumDiasFolga').innerText = data.resumo.totalDiasFolga;
    document.getElementById('sumHorasPlanejadas').innerText = `${data.resumo.totalHorasPlanejadas}h`;
    document.getElementById('sumHorasNoturnas').innerText = `${data.resumo.totalHorasNoturnas}h`;
    document.getElementById('sumDiasEspeciais').innerText = data.resumo.totalDiasEspeciais;

    // Renderizar cards de cada dia
    grid.innerHTML = '';
    data.dias.forEach(d => {
      let badgeClass = 'day-off';
      let statusLabel = 'Folga';

      if (d.tipoDia === 'TRABALHO') {
        badgeClass = 'day-work';
        statusLabel = 'Trabalho';
      } else if (d.tipoDia === 'DSR') {
        badgeClass = 'day-dsr';
        statusLabel = 'DSR';
      } else if (d.tipoDia === 'FERIADO' || d.tipoDia === 'ELEICAO') {
        badgeClass = 'day-special';
        statusLabel = d.tipoDia;
      }

      const card = document.createElement('div');
      card.className = `p-3 rounded-xl border flex flex-col justify-between h-28 transition glass-card ${badgeClass}`;
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-slate-200">Dia ${d.diaDoMes}</span>
          <span class="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${badgeClass}">${statusLabel}</span>
        </div>
        <div>
          <span class="text-[11px] block text-slate-400 font-medium">${d.diaDaSemanaNome}</span>
          <div class="flex items-baseline space-x-1.5 mt-1">
            <span class="text-sm font-bold">${d.horasPlanejadas}h</span>
            ${d.horasNoturnas > 0 ? `<span class="text-[10px] text-indigo-400 font-mono">(${d.horasNoturnas}h not)</span>` : ''}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    grid.innerHTML = `<div class="col-span-full text-red-400 text-xs">Erro ao carregar dados: ${err.message}</div>`;
  }
}

// Carregamento de Eventos e Regras
async function carregarEventosERegras() {
  const tbody = document.getElementById('eventosTableBody');
  const regrasList = document.getElementById('regrasList');

  tbody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-slate-400">Carregando catálogo de eventos...</td></tr>';
  regrasList.innerHTML = '<div class="col-span-full py-4 text-center text-slate-400">Carregando regras...</div>';

  try {
    const [resEv, resReg] = await Promise.all([
      fetch('/api/eventos'),
      fetch('/api/regras')
    ]);

    const eventosData = await resEv.json();
    const regrasData = await resReg.json();

    // Preencher Tabela de Eventos
    tbody.innerHTML = '';
    eventosData.dados.forEach(ev => {
      const tr = document.createElement('tr');
      tr.className = "hover:bg-slate-900/40 transition";
      
      const isIndependente = ev.classificacao === 'INDEPENDENTE';
      const badgeClass = isIndependente 
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        : 'bg-sky-500/10 text-sky-400 border border-sky-500/30';

      const statusBadge = ev.statusRegra === 'VALIDADO'
        ? '<span class="text-emerald-400 font-semibold">Validado</span>'
        : '<span class="text-amber-400 font-semibold">Pendente Homologação</span>';

      tr.innerHTML = `
        <td class="py-3 px-4 font-mono font-bold text-slate-200">${ev.codigo}</td>
        <td class="py-3 px-4 font-medium text-white">${ev.descricao}</td>
        <td class="py-3 px-4 text-slate-400">${ev.tipo}</td>
        <td class="py-3 px-4">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${badgeClass}">${ev.classificacao}</span>
        </td>
        <td class="py-3 px-4 text-[11px]">${statusBadge}</td>
        <td class="py-3 px-4 text-slate-400 text-[11px]">${ev.observacao || '--'}</td>
      `;
      tbody.appendChild(tr);
    });

    // Preencher Lista de Regras
    regrasList.innerHTML = '';
    regrasData.dados.forEach(reg => {
      const card = document.createElement('div');
      card.className = "glass-card p-4 rounded-xl border border-slate-800 space-y-2";
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-sky-400 font-mono">${reg.id}</span>
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">Pendente de CCT</span>
        </div>
        <h4 class="text-sm font-bold text-white">${reg.nome}</h4>
        <p class="text-xs text-slate-300"><strong>Hipótese de Levantamento:</strong> ${reg.hipotese}</p>
        <p class="text-[11px] text-slate-400"><strong>Impacto no Sistema:</strong> ${reg.impacto}</p>
      `;
      regrasList.appendChild(card);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-red-400">Erro: ${err.message}</td></tr>`;
  }
}

// Execução da Simulação Comparativa
async function executarSimulacao() {
  const filialId = document.getElementById('simFilial').value || undefined;
  const novaEscalaId = document.getElementById('simNovaEscala').value;
  const container = document.getElementById('simColaboradoresContainer');
  const cards = document.getElementById('simResumoCards');
  const list = document.getElementById('simColaboradoresList');

  list.innerHTML = '<div class="py-6 text-center text-xs text-slate-400">Processando motor de simulação de escalas...</div>';
  container.classList.remove('hidden');
  cards.classList.remove('hidden');

  try {
    const res = await fetch('/api/simulacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filialId,
        novaEscalaId,
        ano: 2026,
        mes: 10
      })
    });

    const data = await res.json();
    if (!res.ok) {
      list.innerHTML = `<div class="text-red-400 text-xs">${data.erro || 'Erro na simulação.'}</div>`;
      return;
    }

    // Preencher Cards Gerais
    document.getElementById('simHorasRef').innerText = `${data.resumoGeral.totalHorasReferencia}h`;
    document.getElementById('simHorasPropostas').innerText = `${data.resumoGeral.totalHorasSimuladas}h`;
    
    const deltaEl = document.getElementById('simDeltaHoras');
    const deltaVal = data.resumoGeral.deltaHorasTotal;
    deltaEl.innerText = `${deltaVal > 0 ? '+' : ''}${deltaVal}h`;
    deltaEl.className = `text-xl font-bold mt-1 ${deltaVal > 0 ? 'text-amber-400' : (deltaVal < 0 ? 'text-emerald-400' : 'text-slate-200')}`;

    document.getElementById('simHorasNoturnas').innerText = `${data.resumoGeral.totalHorasNoturnasSimuladas}h`;

    // Renderizar Colaboradores
    list.innerHTML = '';
    data.colaboradores.forEach(c => {
      const card = document.createElement('div');
      card.className = "glass-panel p-5 rounded-xl border border-slate-800 space-y-4";
      
      let eventosHtml = '';
      c.eventos.forEach(ev => {
        eventosHtml += `
          <div class="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-200">${ev.codigo} — ${ev.descricao}</span>
              <span class="text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                ev.statusRegra === 'VALIDADO' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }">${ev.statusRegra}</span>
            </div>
            <div class="text-[11px] text-slate-400">${ev.memoriaCalculo}</div>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-xs font-mono font-bold text-sky-400">${c.matricula}</span>
              <h4 class="text-sm font-bold text-white">${c.nome}</h4>
              <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">${c.regime} (${c.jornadaMensalRef}h)</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">${c.cargo}</p>
          </div>
          <div class="text-right">
            <span class="text-[11px] text-slate-400">Salário Base (Inalterado):</span>
            <p class="text-sm font-bold text-emerald-400 font-mono">R$ ${c.eventos[0].valorSimulado.toFixed(2)}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-slate-900/40 p-3 rounded-lg">
          <div>
            <span class="text-slate-400 block text-[11px]">Escala Original:</span>
            <span class="font-semibold text-slate-200">${c.escalaOriginal.nome} (${c.escalaOriginal.totalHoras}h)</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Nova Escala Proposta:</span>
            <span class="font-semibold text-sky-400">${c.escalaProposta.nome} (${c.escalaProposta.totalHoras}h)</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Variação de Jornada:</span>
            <span class="font-bold ${c.deltaHoras > 0 ? 'text-amber-400' : 'text-emerald-400'}">${c.deltaHoras > 0 ? '+' : ''}${c.deltaHoras}h</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">Horas Noturnas Est.:</span>
            <span class="font-bold text-indigo-400">${c.escalaProposta.totalHorasNoturnas}h</span>
          </div>
        </div>

        <div class="space-y-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rastreabilidade dos Eventos da Folha:</span>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            ${eventosHtml}
          </div>
        </div>
      `;
      list.appendChild(card);
    });

  } catch (err) {
    list.innerHTML = `<div class="text-red-400 text-xs">Erro ao processar: ${err.message}</div>`;
  }
}

// Validador de Importação
const EXEMPLO_VALIDO = [
  {
    matricula: "M901",
    nome: "Colaborador Fictício A",
    filialId: "FIL-01",
    cargo: "Assistente Administrativo",
    salarioBase: 3200.00,
    regime: "MENSALISTA",
    eventos: [{ codigo: "101", descricao: "Salário Base Contratual" }]
  },
  {
    matricula: "M902",
    nome: "Colaborador Fictício B",
    filialId: "FIL-02",
    cargo: "Operador de Máquinas",
    salarioBase: 2950.00,
    regime: "HORISTA",
    eventos: [{ codigo: "101", descricao: "Salário Base Contratual" }, { codigo: "201", descricao: "Horas Extras 50%" }]
  }
];

const EXEMPLO_COM_ERROS = [
  {
    matricula: "",
    nome: "Colaborador Sem Matrícula",
    salarioBase: 2500.00
  },
  {
    matricula: "M901",
    nome: "Colaborador Duplicado",
    salarioBase: -100.00
  },
  {
    matricula: "M903",
    nome: "Colaborador com Evento Desconhecido",
    salarioBase: 4200.00,
    eventos: [{ codigo: "999", descricao: "Premiação Especial Indefinida" }]
  }
];

function carregarExemploValido() {
  document.getElementById('importPayloadInput').value = JSON.stringify(EXEMPLO_VALIDO, null, 2);
}

function carregarExemploComErros() {
  document.getElementById('importPayloadInput').value = JSON.stringify(EXEMPLO_COM_ERROS, null, 2);
}

async function executarValidacaoImportacao() {
  const input = document.getElementById('importPayloadInput').value;
  const box = document.getElementById('importReportBox');

  let rows;
  try {
    rows = JSON.parse(input);
  } catch {
    box.innerHTML = '<div class="text-red-400 text-xs">JSON inválido. Corrija o formato antes de validar.</div>';
    return;
  }

  box.innerHTML = '<div class="text-slate-400 text-xs">Analisando dados e gerando relatório de auditoria...</div>';

  try {
    const res = await fetch('/api/importacao/validar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rows)
    });
    const report = await res.json();

    let errosHtml = '';
    if (report.erros.length > 0) {
      errosHtml = `
        <div class="mt-3 text-left space-y-1">
          <p class="text-xs font-bold text-red-400">Erros Bloqueantes Encontrados (${report.erros.length}):</p>
          <ul class="list-disc pl-4 text-[11px] text-red-300 space-y-0.5">
            ${report.erros.map(e => `<li>${e}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    let alertasHtml = '';
    if (report.alertas.length > 0) {
      alertasHtml = `
        <div class="mt-3 text-left space-y-1">
          <p class="text-xs font-bold text-amber-400">Alertas de Atenção / Eventos Pendentes (${report.alertas.length}):</p>
          <ul class="list-disc pl-4 text-[11px] text-amber-300 space-y-0.5">
            ${report.alertas.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    box.innerHTML = `
      <div class="text-left w-full space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <span class="text-xs font-bold uppercase tracking-wider ${report.valido ? 'text-emerald-400' : 'text-red-400'}">
            Status: ${report.resumoStatus}
          </span>
          <span class="text-[11px] text-slate-400">${report.linhasValidas}/${report.totalLinhas} Linhas Válidas</span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="bg-slate-900 p-2 rounded border border-slate-800">
            <span class="text-[10px] text-slate-400 block">Total:</span>
            <span class="font-bold text-white">${report.totalLinhas}</span>
          </div>
          <div class="bg-slate-900 p-2 rounded border border-slate-800">
            <span class="text-[10px] text-emerald-400 block">Válidas:</span>
            <span class="font-bold text-emerald-400">${report.linhasValidas}</span>
          </div>
          <div class="bg-slate-900 p-2 rounded border border-slate-800">
            <span class="text-[10px] text-red-400 block">Com Erro:</span>
            <span class="font-bold text-red-400">${report.linhasComErro}</span>
          </div>
        </div>

        ${errosHtml}
        ${alertasHtml}
      </div>
    `;

  } catch (err) {
    box.innerHTML = `<div class="text-red-400 text-xs">Erro na validação: ${err.message}</div>`;
  }
}

// Botão de Teste Rápido no Dashboard
function testarTudo() {
  switchTab('api');
  executarRota('GET', '/api/health');
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', () => {
  verificarStatusApi();
  carregarExemploValido();
});
