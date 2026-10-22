/**
 * Controlador de Interface e Interações — Simulador de Escalas e Custos de RH
 * Vanilla JavaScript ES6+
 *
 * Desenvolvedor: Diego Miranda Cezar
 */

(function () {
  'use strict';

  // Estado da aplicação
  let state = {
    scales: [],
    activeScaleId: null,
    activeTab: 'escala', // 'escala' | 'comparacao'
    pendingAction: null // Usado pelo modal de confirmação
  };

  // Elementos do DOM
  const dom = {
    // Abas
    tabBtnEscala: document.getElementById('tabBtnEscala'),
    tabBtnComparacao: document.getElementById('tabBtnComparacao'),
    tabContentEscala: document.getElementById('tabContentEscala'),
    tabContentComparacao: document.getElementById('tabContentComparacao'),
    badgeQtdEscalas: document.getElementById('badgeQtdEscalas'),

    // Topo
    btnNovaEscala: document.getElementById('btnNovaEscala'),
    btnExportarImportar: document.getElementById('btnExportarImportar'),
    btnRestaurarExemplos: document.getElementById('btnRestaurarExemplos'),
    btnLimparDados: document.getElementById('btnLimparDados'),

    // Gestão da Escala Ativa
    selectEscalaAtiva: document.getElementById('selectEscalaAtiva'),
    btnEditarEscala: document.getElementById('btnEditarEscala'),
    btnExcluirEscala: document.getElementById('btnExcluirEscala'),

    // KPIs
    kpiValorHora: document.getElementById('kpiValorHora'),
    kpiLimiteDiario: document.getElementById('kpiLimiteDiario'),
    kpiHorasNormais: document.getElementById('kpiHorasNormais'),
    kpiCustoNormal: document.getElementById('kpiCustoNormal'),
    kpiHorasExtras: document.getElementById('kpiHorasExtras'),
    kpiCustoExtras: document.getElementById('kpiCustoExtras'),
    kpiHorasDomFer: document.getElementById('kpiHorasDomFer'),
    kpiCustoDomFer: document.getElementById('kpiCustoDomFer'),
    kpiCustoTotal: document.getElementById('kpiCustoTotal'),
    kpiTotalHorasGeral: document.getElementById('kpiTotalHorasGeral'),

    // Formulário Adicionar Jornada
    formAdicionarJornada: document.getElementById('formAdicionarJornada'),
    jornadaData: document.getElementById('jornadaData'),
    labelDiaSemanaPreview: document.getElementById('labelDiaSemanaPreview'),
    jornadaEntrada: document.getElementById('jornadaEntrada'),
    jornadaSaida: document.getElementById('jornadaSaida'),
    jornadaFeriado: document.getElementById('jornadaFeriado'),
    containerFeriadoDiaSeguinte: document.getElementById('containerFeriadoDiaSeguinte'),
    jornadaFeriadoSeguinte: document.getElementById('jornadaFeriadoSeguinte'),
    jornadaNotas: document.getElementById('jornadaNotas'),

    // Tabela de Jornadas
    contadorJornadas: document.getElementById('contadorJornadas'),
    tabelaJornadasBody: document.getElementById('tabelaJornadasBody'),
    estadoVazioJornadas: document.getElementById('estadoVazioJornadas'),

    // Comparação
    alertaDiscrepanciaTaxa: document.getElementById('alertaDiscrepanciaTaxa'),
    tabelaComparacaoBody: document.getElementById('tabelaComparacaoBody'),
    estadoVazioComparacao: document.getElementById('estadoVazioComparacao'),
    cardsComparativosContainer: document.getElementById('cardsComparativosContainer'),

    // Modais
    modalEscala: document.getElementById('modalEscala'),
    modalEscalaTitulo: document.getElementById('modalEscalaTitulo'),
    formModalEscala: document.getElementById('formModalEscala'),
    modalEscalaId: document.getElementById('modalEscalaId'),
    modalEscalaNome: document.getElementById('modalEscalaNome'),
    modalEscalaFuncionario: document.getElementById('modalEscalaFuncionario'),
    modalEscalaValorHora: document.getElementById('modalEscalaValorHora'),
    modalEscalaLimiteDiario: document.getElementById('modalEscalaLimiteDiario'),
    modalEscalaAdicionalExtra: document.getElementById('modalEscalaAdicionalExtra'),
    modalEscalaAdicionalDomFer: document.getElementById('modalEscalaAdicionalDomFer'),

    modalEditarJornada: document.getElementById('modalEditarJornada'),
    formModalEditarJornada: document.getElementById('formModalEditarJornada'),
    modalEditarJornadaId: document.getElementById('modalEditarJornadaId'),
    modalEditarJornadaData: document.getElementById('modalEditarJornadaData'),
    modalEditarDiaSemanaLabel: document.getElementById('modalEditarDiaSemanaLabel'),
    modalEditarJornadaEntrada: document.getElementById('modalEditarJornadaEntrada'),
    modalEditarJornadaSaida: document.getElementById('modalEditarJornadaSaida'),
    modalEditarJornadaFeriado: document.getElementById('modalEditarJornadaFeriado'),
    modalContainerFeriadoDiaSeguinte: document.getElementById('modalContainerFeriadoDiaSeguinte'),
    modalEditarJornadaFeriadoSeguinte: document.getElementById('modalEditarJornadaFeriadoSeguinte'),
    modalEditarJornadaNotas: document.getElementById('modalEditarJornadaNotas'),

    modalConfirmacao: document.getElementById('modalConfirmacao'),
    modalConfirmacaoTitulo: document.getElementById('modalConfirmacaoTitulo'),
    modalConfirmacaoMensagem: document.getElementById('modalConfirmacaoMensagem'),
    btnModalConfirmacaoCancelar: document.getElementById('btnModalConfirmacaoCancelar'),
    btnModalConfirmacaoExecutar: document.getElementById('btnModalConfirmacaoExecutar'),

    modalExportarImportar: document.getElementById('modalExportarImportar'),
    btnBaixarJSON: document.getElementById('btnBaixarJSON'),
    areaImportarJSON: document.getElementById('areaImportarJSON'),
    btnConfirmarImportacao: document.getElementById('btnConfirmarImportacao')
  };

  /**
   * Inicialização da aplicação
   */
  function init() {
    state.scales = RHStorage.loadScales();

    if (state.scales.length > 0) {
      state.activeScaleId = state.scales[0].id;
    }

    // Configura data padrão no formulário como hoje
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    dom.jornadaData.value = `${ano}-${mes}-${dia}`;
    atualizarPrevisaoDiaSemana(dom.jornadaData.value, dom.labelDiaSemanaPreview);

    vincularEventos();
    renderizarInterface();
  }

  /**
   * Vincula eventos aos elementos do DOM
   */
  function vincularEventos() {
    // Alternância de abas
    dom.tabBtnEscala.addEventListener('click', () => mudarAba('escala'));
    dom.tabBtnComparacao.addEventListener('click', () => mudarAba('comparacao'));

    // Mudança de escala selecionada
    dom.selectEscalaAtiva.addEventListener('change', (e) => {
      state.activeScaleId = e.target.value;
      renderizarEscalaAtiva();
    });

    // Monitora data e horários para previsão de domingos e virada de meia-noite
    dom.jornadaData.addEventListener('input', () => {
      atualizarPrevisaoDiaSemana(dom.jornadaData.value, dom.labelDiaSemanaPreview);
    });

    dom.jornadaEntrada.addEventListener('input', verificarViradaMeiaNoiteAdicionar);
    dom.jornadaSaida.addEventListener('input', verificarViradaMeiaNoiteAdicionar);

    dom.modalEditarJornadaData.addEventListener('input', () => {
      atualizarPrevisaoDiaSemana(dom.modalEditarJornadaData.value, dom.modalEditarDiaSemanaLabel);
    });
    dom.modalEditarJornadaEntrada.addEventListener('input', verificarViradaMeiaNoiteEditar);
    dom.modalEditarJornadaSaida.addEventListener('input', verificarViradaMeiaNoiteEditar);

    // Submissão do formulário de adição rápida de jornada
    dom.formAdicionarJornada.addEventListener('submit', tratarAdicionarJornada);

    // Botões de Escala
    dom.btnNovaEscala.addEventListener('click', abrirModalNovaEscala);
    dom.btnEditarEscala.addEventListener('click', abrirModalEditarEscala);
    dom.btnExcluirEscala.addEventListener('click', confirmarExclusaoEscala);
    dom.formModalEscala.addEventListener('submit', salvarModalEscala);

    // Modal de Edição de Jornada
    dom.formModalEditarJornada.addEventListener('submit', salvarModalEditarJornada);

    // Ações de Topo
    dom.btnRestaurarExemplos.addEventListener('click', confirmarRestaurarExemplos);
    dom.btnLimparDados.addEventListener('click', confirmarLimparTodosDados);
    dom.btnExportarImportar.addEventListener('click', () => abrirModal(dom.modalExportarImportar));
    dom.btnBaixarJSON.addEventListener('click', baixarArquivoJSON);
    dom.btnConfirmarImportacao.addEventListener('click', processarImportacaoJSON);

    // Modal de Confirmação
    dom.btnModalConfirmacaoCancelar.addEventListener('click', () => fecharModal(dom.modalConfirmacao));
    dom.btnModalConfirmacaoExecutar.addEventListener('click', () => {
      if (typeof state.pendingAction === 'function') {
        state.pendingAction();
      }
      fecharModal(dom.modalConfirmacao);
    });

    // Fechamento genérico de modais pelos botões de fechar ou clique no fundo
    document.querySelectorAll('.btnFecharModal').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) fecharModal(modal);
      });
    });

    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        fecharModal(e.target);
      }
    });

    // Fechamento de modal com ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(fecharModal);
      }
    });
  }

  /**
   * Alterna a exibição das abas
   * @param {'escala'|'comparacao'} aba
   */
  function mudarAba(aba) {
    state.activeTab = aba;

    if (aba === 'escala') {
      dom.tabBtnEscala.classList.add('border-sky-600', 'text-sky-700');
      dom.tabBtnEscala.classList.remove('border-transparent', 'text-slate-500');

      dom.tabBtnComparacao.classList.remove('border-sky-600', 'text-sky-700');
      dom.tabBtnComparacao.classList.add('border-transparent', 'text-slate-500');

      dom.tabContentEscala.classList.remove('hidden');
      dom.tabContentComparacao.classList.add('hidden');
      renderizarEscalaAtiva();
    } else {
      dom.tabBtnComparacao.classList.add('border-sky-600', 'text-sky-700');
      dom.tabBtnComparacao.classList.remove('border-transparent', 'text-slate-500');

      dom.tabBtnEscala.classList.remove('border-sky-600', 'text-sky-700');
      dom.tabBtnEscala.classList.add('border-transparent', 'text-slate-500');

      dom.tabContentComparacao.classList.remove('hidden');
      dom.tabContentEscala.classList.add('hidden');
      renderizarPainelComparacao();
    }
  }

  /**
   * Atualiza a label de identificação de Domingo e dia da semana
   */
  function atualizarPrevisaoDiaSemana(dataStr, elementoLabel) {
    if (!dataStr) {
      elementoLabel.textContent = 'Selecione uma data';
      elementoLabel.className = 'text-[11px] text-slate-500 mt-0.5 block font-medium';
      return;
    }

    try {
      const isSun = RHCalculator.isSunday(dataStr);
      const diaNome = RHCalculator.getDayOfWeekName(dataStr);

      if (isSun) {
        elementoLabel.textContent = `📅 ${diaNome} — Domingo (Remuneração estimada de 200%)`;
        elementoLabel.className = 'text-[11px] text-amber-700 font-bold mt-0.5 block';
      } else {
        elementoLabel.textContent = `📅 ${diaNome} (Dia comum da semana)`;
        elementoLabel.className = 'text-[11px] text-slate-600 font-medium mt-0.5 block';
      }
    } catch (err) {
      elementoLabel.textContent = 'Data inválida';
      elementoLabel.className = 'text-[11px] text-red-500 mt-0.5 block';
    }
  }

  /**
   * Exibe o campo de feriado no dia seguinte caso a jornada atravesse a meia-noite
   */
  function verificarViradaMeiaNoiteAdicionar() {
    const entrada = dom.jornadaEntrada.value;
    const saida = dom.jornadaSaida.value;
    if (entrada && saida && saida <= entrada) {
      dom.containerFeriadoDiaSeguinte.classList.remove('hidden');
    } else {
      dom.containerFeriadoDiaSeguinte.classList.add('hidden');
      dom.jornadaFeriadoSeguinte.checked = false;
    }
  }

  function verificarViradaMeiaNoiteEditar() {
    const entrada = dom.modalEditarJornadaEntrada.value;
    const saida = dom.modalEditarJornadaSaida.value;
    if (entrada && saida && saida <= entrada) {
      dom.modalContainerFeriadoDiaSeguinte.classList.remove('hidden');
    } else {
      dom.modalContainerFeriadoDiaSeguinte.classList.add('hidden');
      dom.modalEditarJornadaFeriadoSeguinte.checked = false;
    }
  }

  /**
   * Renderização geral da interface
   */
  function renderizarInterface() {
    atualizarSelectEscalas();
    if (state.activeTab === 'escala') {
      renderizarEscalaAtiva();
    } else {
      renderizarPainelComparacao();
    }
    dom.badgeQtdEscalas.textContent = state.scales.length;
  }

  /**
   * Atualiza o select de escalas
   */
  function atualizarSelectEscalas() {
    dom.selectEscalaAtiva.innerHTML = '';

    if (state.scales.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Nenhuma escala cadastrada';
      dom.selectEscalaAtiva.appendChild(opt);
      return;
    }

    state.scales.forEach((scale) => {
      const opt = document.createElement('option');
      opt.value = scale.id;
      opt.textContent = `${scale.name} (${RHCalculator.formatCurrency(scale.hourlyRate)}/h — Limite: ${scale.dailyNormalLimit}h)`;
      if (scale.id === state.activeScaleId) {
        opt.selected = true;
      }
      dom.selectEscalaAtiva.appendChild(opt);
    });
  }

  /**
   * Obtém o objeto da escala ativa
   * @returns {Object|null}
   */
  function getEscalaAtiva() {
    return state.scales.find((s) => s.id === state.activeScaleId) || null;
  }

  /**
   * Renderiza os dados e cálculos da escala ativa
   */
  function renderizarEscalaAtiva() {
    const escala = getEscalaAtiva();

    if (!escala) {
      dom.kpiValorHora.textContent = 'R$ 0,00';
      dom.kpiLimiteDiario.textContent = '0h';
      dom.kpiHorasNormais.textContent = '0h';
      dom.kpiCustoNormal.textContent = 'Custo: R$ 0,00';
      dom.kpiHorasExtras.textContent = '0h';
      dom.kpiCustoExtras.textContent = 'Custo: R$ 0,00';
      dom.kpiHorasDomFer.textContent = '0h';
      dom.kpiCustoDomFer.textContent = 'Custo: R$ 0,00';
      dom.kpiCustoTotal.textContent = 'R$ 0,00';
      dom.kpiTotalHorasGeral.textContent = 'Nenhuma escala selecionada';
      dom.tabelaJornadasBody.innerHTML = '';
      dom.estadoVazioJornadas.classList.remove('hidden');
      dom.contadorJornadas.textContent = '0';
      return;
    }

    // Calcula a escala completa
    const calculo = RHCalculator.calculateScale(escala);

    // Atualiza KPIs
    dom.kpiValorHora.textContent = RHCalculator.formatCurrency(calculo.hourlyRate);
    dom.kpiLimiteDiario.textContent = `${calculo.dailyNormalLimit.toFixed(1)}h`;

    dom.kpiHorasNormais.textContent = RHCalculator.formatHours(calculo.totalNormalHours);
    dom.kpiCustoNormal.textContent = `Custo: ${RHCalculator.formatCurrency(calculo.totalCostNormal)}`;

    dom.kpiHorasExtras.textContent = RHCalculator.formatHours(calculo.totalOvertimeHours);
    dom.kpiCustoExtras.textContent = `Custo: ${RHCalculator.formatCurrency(calculo.totalCostOvertime)}`;

    dom.kpiHorasDomFer.textContent = RHCalculator.formatHours(calculo.totalSundayHolidayHours);
    dom.kpiCustoDomFer.textContent = `Custo: ${RHCalculator.formatCurrency(calculo.totalCostSundayHoliday)}`;

    dom.kpiCustoTotal.textContent = RHCalculator.formatCurrency(calculo.totalEstimatedCost);
    dom.kpiTotalHorasGeral.textContent = `Total de ${RHCalculator.formatHours(calculo.totalHours)} em ${calculo.totalJourneysCount} jornada(s)`;

    dom.contadorJornadas.textContent = calculo.journeys.length;

    // Renderiza Tabela de Jornadas
    dom.tabelaJornadasBody.innerHTML = '';

    if (calculo.journeys.length === 0) {
      dom.estadoVazioJornadas.classList.remove('hidden');
      return;
    }

    dom.estadoVazioJornadas.classList.add('hidden');

    calculo.journeys.forEach((jornada, index) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition-colors border-b border-slate-100';

      // Badge de Classificação
      let badgeHtml = '';
      if (jornada.isSplit) {
        badgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Virada de Data</span>`;
      } else {
        const seg = jornada.segments[0];
        if (seg.classification === 'domingo_feriado') {
          badgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold badge-sunday-holiday">Dom + Feriado (200%)</span>`;
        } else if (seg.classification === 'domingo') {
          badgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold badge-sunday">Domingo (200%)</span>`;
        } else if (seg.classification === 'feriado') {
          badgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold badge-holiday">Feriado (200%)</span>`;
        } else {
          badgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium badge-common">Dia Comum</span>`;
        }
      }

      // Detalhamento de custo
      const custoDetalhado = `
        <div class="text-[11px] text-slate-500 font-mono space-y-0.5">
          ${jornada.costNormal > 0 ? `<div>Normais: ${RHCalculator.formatCurrency(jornada.costNormal)}</div>` : ''}
          ${jornada.costOvertime > 0 ? `<div class="text-amber-700">Extras: ${RHCalculator.formatCurrency(jornada.costOvertime)}</div>` : ''}
          ${jornada.costSundayHoliday > 0 ? `<div class="text-purple-700">Dom/Fer: ${RHCalculator.formatCurrency(jornada.costSundayHoliday)}</div>` : ''}
        </div>
      `;

      // Detalhe de segmentos se cruzou a meia-noite
      let detalhesTramos = '';
      if (jornada.isSplit) {
        detalhesTramos = `
          <div class="mt-1.5 pt-1.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
            ${jornada.segments
              .map(
                (s) => `
              <div class="flex items-center justify-between">
                <span>Tramo ${s.segmentIndex}: ${s.date} (${s.startTime} às ${s.endTime} - ${s.dayOfWeek})</span>
                <span class="font-mono font-medium">${RHCalculator.formatHours(s.durationHours)} • ${RHCalculator.formatCurrency(s.totalCost)}</span>
              </div>
            `
              )
              .join('')}
          </div>
        `;
      }

      tr.innerHTML = `
        <td class="py-3 px-3.5">
          <div class="font-semibold text-slate-900">${jornada.date}</div>
          <div class="text-[11px] text-slate-500">${jornada.dayOfWeek}</div>
          ${jornada.notes ? `<div class="text-[11px] text-slate-400 italic mt-0.5">${escapeHtml(jornada.notes)}</div>` : ''}
        </td>
        <td class="py-3 px-2.5 font-mono text-slate-800">
          ${jornada.startTime} → ${jornada.endTime}
          ${detalhesTramos}
        </td>
        <td class="py-3 px-2 text-center font-mono font-semibold text-slate-900">
          ${RHCalculator.formatHours(jornada.totalDuration)}
        </td>
        <td class="py-3 px-2.5">
          ${badgeHtml}
        </td>
        <td class="py-3 px-2 text-right font-mono text-slate-700">
          ${jornada.normalHours > 0 ? RHCalculator.formatHours(jornada.normalHours) : '-'}
        </td>
        <td class="py-3 px-2 text-right font-mono text-amber-700 font-semibold">
          ${jornada.overtimeHours > 0 ? RHCalculator.formatHours(jornada.overtimeHours) : '-'}
        </td>
        <td class="py-3 px-2 text-right font-mono text-purple-700 font-semibold">
          ${jornada.sundayHolidayHours > 0 ? RHCalculator.formatHours(jornada.sundayHolidayHours) : '-'}
        </td>
        <td class="py-3 px-3 text-right">
          ${custoDetalhado}
        </td>
        <td class="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
          ${RHCalculator.formatCurrency(jornada.totalCost)}
        </td>
        <td class="py-3 px-2.5 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button data-action="editar-jornada" data-id="${jornada.id}" class="p-1 rounded text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition-colors" title="Editar jornada">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button data-action="excluir-jornada" data-id="${jornada.id}" class="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors" title="Excluir jornada">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </td>
      `;

      dom.tabelaJornadasBody.appendChild(tr);
    });

    // Vincula ações dos botões da tabela
    dom.tabelaJornadasBody.querySelectorAll('[data-action="editar-jornada"]').forEach((btn) => {
      btn.addEventListener('click', () => abrirModalEditarJornada(btn.dataset.id));
    });

    dom.tabelaJornadasBody.querySelectorAll('[data-action="excluir-jornada"]').forEach((btn) => {
      btn.addEventListener('click', () => confirmarExclusaoJornada(btn.dataset.id));
    });
  }

  /**
   * Renderiza a aba de Comparação Geral de Escalas (SPEC 9)
   */
  function renderizarPainelComparacao() {
    const comparison = RHCalculator.compareScales(state.scales);

    // Alerta de discrepância de taxas horárias
    if (comparison.hasRateDiscrepancy) {
      dom.alertaDiscrepanciaTaxa.classList.remove('hidden');
    } else {
      dom.alertaDiscrepanciaTaxa.classList.add('hidden');
    }

    dom.tabelaComparacaoBody.innerHTML = '';
    dom.cardsComparativosContainer.innerHTML = '';

    if (comparison.rankedScales.length === 0) {
      dom.estadoVazioComparacao.classList.remove('hidden');
      return;
    }

    dom.estadoVazioComparacao.classList.add('hidden');

    comparison.rankedScales.forEach((scale) => {
      // Linha da tabela
      const tr = document.createElement('tr');
      tr.className = `hover:bg-slate-50 transition-colors border-b border-slate-100 ${
        scale.isLowestCost ? 'bg-emerald-50/40 font-medium' : ''
      }`;

      // Badge de Posição
      let rankBadge = '';
      if (scale.isLowestCost) {
        rankBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold badge-lowest-cost">
            🥇 1º (Menor Custo)
          </span>
        `;
      } else {
        rankBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">${scale.rank}º Lugar</span>`;
      }

      // Diferença
      let diffHtml = '';
      if (scale.isLowestCost) {
        diffHtml = `<span class="text-emerald-700 font-semibold text-xs">Referência</span>`;
      } else {
        diffHtml = `
          <div class="text-right font-mono">
            <span class="text-red-700 font-semibold">+${RHCalculator.formatCurrency(scale.differenceToLowest)}</span>
            <span class="text-[11px] text-slate-400 block">+${scale.percentageDifference.toFixed(1)}%</span>
          </div>
        `;
      }

      tr.innerHTML = `
        <td class="py-3.5 px-3 text-center">
          ${rankBadge}
        </td>
        <td class="py-3.5 px-3">
          <div class="font-bold text-slate-900">${escapeHtml(scale.name)}</div>
          ${scale.employee ? `<div class="text-[11px] text-slate-500">${escapeHtml(scale.employee)}</div>` : ''}
        </td>
        <td class="py-3.5 px-2 text-right font-mono text-slate-700">
          ${RHCalculator.formatCurrency(scale.hourlyRate)}
        </td>
        <td class="py-3.5 px-2 text-center font-mono">
          ${scale.totalJourneysCount}
        </td>
        <td class="py-3.5 px-2 text-right font-mono font-semibold text-slate-900">
          ${RHCalculator.formatHours(scale.totalHours)}
        </td>
        <td class="py-3.5 px-2 text-right font-mono text-slate-700">
          ${RHCalculator.formatHours(scale.totalNormalHours)}
        </td>
        <td class="py-3.5 px-2 text-right font-mono text-amber-700 font-semibold">
          ${RHCalculator.formatHours(scale.totalOvertimeHours)}
        </td>
        <td class="py-3.5 px-2 text-right font-mono text-purple-700 font-semibold">
          ${RHCalculator.formatHours(scale.totalSundayHolidayHours)}
        </td>
        <td class="py-3.5 px-3 text-right font-mono text-slate-600">
          ${RHCalculator.formatCurrency(scale.totalCostNormal)}
        </td>
        <td class="py-3.5 px-3 text-right font-mono text-amber-700">
          ${RHCalculator.formatCurrency(scale.totalCostOvertime)}
        </td>
        <td class="py-3.5 px-3 text-right font-mono text-purple-700">
          ${RHCalculator.formatCurrency(scale.totalCostSundayHoliday)}
        </td>
        <td class="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 text-sm bg-slate-100/50">
          ${RHCalculator.formatCurrency(scale.totalEstimatedCost)}
        </td>
        <td class="py-3.5 px-3 text-right">
          ${diffHtml}
        </td>
      `;

      dom.tabelaComparacaoBody.appendChild(tr);

      // Card comparativo individual
      const card = document.createElement('div');
      card.className = `bg-white rounded-xl border p-5 shadow-sm transition-card relative flex flex-col justify-between ${
        scale.isLowestCost ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-slate-200'
      }`;

      card.innerHTML = `
        <div>
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Classificação</span>
              <div class="mt-0.5">${rankBadge}</div>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400">Valor da Hora</span>
              <div class="font-mono font-bold text-slate-800">${RHCalculator.formatCurrency(scale.hourlyRate)}</div>
            </div>
          </div>

          <h3 class="font-bold text-slate-900 text-base mb-1">${escapeHtml(scale.name)}</h3>
          ${scale.employee ? `<p class="text-xs text-slate-500 mb-3">${escapeHtml(scale.employee)}</p>` : '<div class="mb-3"></div>'}

          <div class="space-y-2 py-3 border-y border-slate-100 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Total de Horas:</span>
              <span class="font-mono font-semibold text-slate-900">${RHCalculator.formatHours(scale.totalHours)}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Horas Normais (100%):</span>
              <span class="font-mono">${RHCalculator.formatHours(scale.totalNormalHours)}</span>
            </div>
            <div class="flex justify-between text-amber-700">
              <span>Horas Extras (150%):</span>
              <span class="font-mono font-semibold">${RHCalculator.formatHours(scale.totalOvertimeHours)}</span>
            </div>
            <div class="flex justify-between text-purple-700">
              <span>Dom / Feriados (200%):</span>
              <span class="font-mono font-semibold">${RHCalculator.formatHours(scale.totalSundayHolidayHours)}</span>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100">
          <div class="flex items-baseline justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-500">Custo Total:</span>
            <span class="text-xl font-extrabold font-mono text-slate-900">${RHCalculator.formatCurrency(scale.totalEstimatedCost)}</span>
          </div>
          ${
            !scale.isLowestCost
              ? `<div class="text-right text-xs text-red-600 font-medium mt-1">+${RHCalculator.formatCurrency(scale.differenceToLowest)} (+${scale.percentageDifference.toFixed(1)}% vs menor custo)</div>`
              : `<div class="text-right text-xs text-emerald-600 font-semibold mt-1">✓ Alternativa de menor custo estimado</div>`
          }
        </div>
      `;

      dom.cardsComparativosContainer.appendChild(card);
    });
  }

  /**
   * Trata a submissão do formulário de adição rápida de jornada
   */
  function tratarAdicionarJornada(e) {
    e.preventDefault();

    const escala = getEscalaAtiva();
    if (!escala) {
      alert('Selecione ou crie uma escala antes de adicionar jornadas.');
      return;
    }

    const novaJornada = {
      date: dom.jornadaData.value,
      startTime: dom.jornadaEntrada.value,
      endTime: dom.jornadaSaida.value,
      isHoliday: dom.jornadaFeriado.checked,
      isHolidayNextDay: dom.jornadaFeriadoSeguinte.checked,
      notes: dom.jornadaNotas.value.trim()
    };

    const validacao = RHCalculator.validateJourney(novaJornada);
    if (!validacao.isValid) {
      alert('Erros no preenchimento da jornada:\n\n• ' + validacao.errors.join('\n• '));
      return;
    }

    try {
      state.scales = RHStorage.addJourneyToScale(escala.id, novaJornada);
      renderizarEscalaAtiva();

      // Limpa os campos secundários mantendo a data para facilitar inclusão contínua
      dom.jornadaNotas.value = '';
      dom.jornadaFeriado.checked = false;
      dom.jornadaFeriadoSeguinte.checked = false;
      dom.containerFeriadoDiaSeguinte.classList.add('hidden');
    } catch (err) {
      alert('Erro ao salvar jornada: ' + err.message);
    }
  }

  /**
   * Modal de Escala: Novo ou Edição
   */
  function abrirModalNovaEscala() {
    dom.modalEscalaTitulo.textContent = 'Nova Escala de Trabalho';
    dom.modalEscalaId.value = '';
    dom.modalEscalaNome.value = '';
    dom.modalEscalaFuncionario.value = '';
    dom.modalEscalaValorHora.value = '20.00';
    dom.modalEscalaLimiteDiario.value = '8.0';
    dom.modalEscalaAdicionalExtra.value = '50';
    dom.modalEscalaAdicionalDomFer.value = '100';

    abrirModal(dom.modalEscala);
  }

  function abrirModalEditarEscala() {
    const escala = getEscalaAtiva();
    if (!escala) return;

    dom.modalEscalaTitulo.textContent = 'Configurar Parâmetros da Escala';
    dom.modalEscalaId.value = escala.id;
    dom.modalEscalaNome.value = escala.name;
    dom.modalEscalaFuncionario.value = escala.employee || '';
    dom.modalEscalaValorHora.value = escala.hourlyRate;
    dom.modalEscalaLimiteDiario.value = escala.dailyNormalLimit;
    dom.modalEscalaAdicionalExtra.value = Math.round(((escala.overtimeMultiplier || 1.5) - 1) * 100);
    dom.modalEscalaAdicionalDomFer.value = Math.round(((escala.sundayHolidayMultiplier || 2.0) - 1) * 100);

    abrirModal(dom.modalEscala);
  }

  function salvarModalEscala(e) {
    e.preventDefault();

    const id = dom.modalEscalaId.value;
    const nome = dom.modalEscalaNome.value.trim();
    const funcionario = dom.modalEscalaFuncionario.value.trim();
    const valorHora = parseFloat(dom.modalEscalaValorHora.value);
    const limiteDiario = parseFloat(dom.modalEscalaLimiteDiario.value);
    const extraPct = parseFloat(dom.modalEscalaAdicionalExtra.value) || 50;
    const domFerPct = parseFloat(dom.modalEscalaAdicionalDomFer.value) || 100;

    const scaleData = {
      name: nome,
      employee: funcionario,
      hourlyRate: valorHora,
      dailyNormalLimit: limiteDiario,
      overtimeMultiplier: 1 + extraPct / 100,
      sundayHolidayMultiplier: 1 + domFerPct / 100
    };

    const validacao = RHCalculator.validateScale(scaleData);
    if (!validacao.isValid) {
      alert('Erros no preenchimento da escala:\n\n• ' + validacao.errors.join('\n• '));
      return;
    }

    if (id) {
      // Edição
      state.scales = RHStorage.updateScale(id, scaleData);
    } else {
      // Criação
      state.scales = RHStorage.addScale(scaleData);
      state.activeScaleId = state.scales[state.scales.length - 1].id;
    }

    fecharModal(dom.modalEscala);
    renderizarInterface();
  }

  function confirmarExclusaoEscala() {
    const escala = getEscalaAtiva();
    if (!escala) return;

    abrirModalConfirmacao(
      'Excluir Escala',
      `Tem certeza que deseja excluir a escala "${escala.name}" e todas as suas jornadas? Esta ação não pode ser desfeita.`,
      () => {
        state.scales = RHStorage.deleteScale(escala.id);
        state.activeScaleId = state.scales.length > 0 ? state.scales[0].id : null;
        renderizarInterface();
      }
    );
  }

  /**
   * Modal de Edição de Jornada
   */
  function abrirModalEditarJornada(journeyId) {
    const escala = getEscalaAtiva();
    if (!escala) return;

    const jornada = (escala.journeys || []).find((j) => j.id === journeyId);
    if (!jornada) return;

    dom.modalEditarJornadaId.value = jornada.id;
    dom.modalEditarJornadaData.value = jornada.date;
    dom.modalEditarJornadaEntrada.value = jornada.startTime;
    dom.modalEditarJornadaSaida.value = jornada.endTime;
    dom.modalEditarJornadaFeriado.checked = Boolean(jornada.isHoliday);
    dom.modalEditarJornadaFeriadoSeguinte.checked = Boolean(jornada.isHolidayNextDay);
    dom.modalEditarJornadaNotas.value = jornada.notes || '';

    atualizarPrevisaoDiaSemana(jornada.date, dom.modalEditarDiaSemanaLabel);
    verificarViradaMeiaNoiteEditar();

    abrirModal(dom.modalEditarJornada);
  }

  function salvarModalEditarJornada(e) {
    e.preventDefault();

    const escala = getEscalaAtiva();
    if (!escala) return;

    const journeyId = dom.modalEditarJornadaId.value;
    const updatedJourney = {
      date: dom.modalEditarJornadaData.value,
      startTime: dom.modalEditarJornadaEntrada.value,
      endTime: dom.modalEditarJornadaSaida.value,
      isHoliday: dom.modalEditarJornadaFeriado.checked,
      isHolidayNextDay: dom.modalEditarJornadaFeriadoSeguinte.checked,
      notes: dom.modalEditarJornadaNotas.value.trim()
    };

    const validacao = RHCalculator.validateJourney(updatedJourney);
    if (!validacao.isValid) {
      alert('Erros no preenchimento da jornada:\n\n• ' + validacao.errors.join('\n• '));
      return;
    }

    state.scales = RHStorage.updateJourneyInScale(escala.id, journeyId, updatedJourney);
    fecharModal(dom.modalEditarJornada);
    renderizarEscalaAtiva();
  }

  function confirmarExclusaoJornada(journeyId) {
    const escala = getEscalaAtiva();
    if (!escala) return;

    abrirModalConfirmacao('Excluir Jornada', 'Deseja remover esta jornada da escala ativa?', () => {
      state.scales = RHStorage.deleteJourneyFromScale(escala.id, journeyId);
      renderizarEscalaAtiva();
    });
  }

  /**
   * Restauração de Exemplos e Limpeza Geral
   */
  function confirmarRestaurarExemplos() {
    abrirModalConfirmacao(
      'Restaurar Escalas de Exemplo',
      'Deseja recarregar o conjunto de escalas e jornadas padrão de demonstração? Isso substituirá as alterações não salvas externamente.',
      () => {
        state.scales = RHStorage.resetToSampleData();
        state.activeScaleId = state.scales.length > 0 ? state.scales[0].id : null;
        renderizarInterface();
      }
    );
  }

  function confirmarLimparTodosDados() {
    abrirModalConfirmacao(
      'Limpar Todos os Dados Salvos',
      'Deseja realmente limpar todas as escalas cadastradas no navegador? Seus dados locais serão apagados.',
      () => {
        RHStorage.clearAllData();
        state.scales = [];
        state.activeScaleId = null;
        renderizarInterface();
      }
    );
  }

  /**
   * Exportação e Importação de Arquivo JSON
   */
  function baixarArquivoJSON() {
    const jsonStr = RHStorage.exportDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulador_escalas_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function processarImportacaoJSON() {
    const jsonText = dom.areaImportarJSON.value.trim();
    if (!jsonText) {
      alert('Cole o conteúdo JSON no campo indicado antes de importar.');
      return;
    }

    try {
      state.scales = RHStorage.importDataFromJSON(jsonText);
      state.activeScaleId = state.scales.length > 0 ? state.scales[0].id : null;
      dom.areaImportarJSON.value = '';
      fecharModal(dom.modalExportarImportar);
      renderizarInterface();
      alert('Escalas importadas com sucesso!');
    } catch (err) {
      alert(err.message);
    }
  }

  /**
   * Utilitários de Modais
   */
  function abrirModal(modalElement) {
    modalElement.classList.remove('hidden');
  }

  function fecharModal(modalElement) {
    modalElement.classList.add('hidden');
  }

  function abrirModalConfirmacao(titulo, mensagem, onConfirm) {
    dom.modalConfirmacaoTitulo.textContent = titulo;
    dom.modalConfirmacaoMensagem.textContent = mensagem;
    state.pendingAction = onConfirm;
    abrirModal(dom.modalConfirmacao);
  }

  /**
   * Escape defensivo de caracteres HTML para prevenir XSS
   */
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Inicializa a aplicação assim que o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
