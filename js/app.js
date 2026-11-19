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
    activeTab: 'comparacao', // 'comparacao' | 'escala'
    filterText: '',
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
    kpiJornadaMensal: document.getElementById('kpiJornadaMensal'),
    kpiHorasNormais: document.getElementById('kpiHorasNormais'),
    kpiCustoNormal: document.getElementById('kpiCustoNormal'),
    kpiHorasExtras: document.getElementById('kpiHorasExtras'),
    kpiCustoExtras: document.getElementById('kpiCustoExtras'),
    kpiHorasDomFer: document.getElementById('kpiHorasDomFer'),
    kpiCustoDomFer: document.getElementById('kpiCustoDomFer'),
    kpiCustoTotal: document.getElementById('kpiCustoTotal'),
    kpiTotalHorasGeral: document.getElementById('kpiTotalHorasGeral'),

    // Formulário Adicionar Jornada
    btnAbrirSemanaCompleta: document.getElementById('btnAbrirSemanaCompleta'),
    formAdicionarJornada: document.getElementById('formAdicionarJornada'),
    jornadaEscalaSelect: document.getElementById('jornadaEscalaSelect'),
    jornadaFuncionario: document.getElementById('jornadaFuncionario'),
    jornadaData: document.getElementById('jornadaData'),
    labelDiaSemanaPreview: document.getElementById('labelDiaSemanaPreview'),
    jornadaEntrada: document.getElementById('jornadaEntrada'),
    jornadaSaida: document.getElementById('jornadaSaida'),
    jornadaFeriado: document.getElementById('jornadaFeriado'),
    containerFeriadoDiaSeguinte: document.getElementById('containerFeriadoDiaSeguinte'),
    jornadaFeriadoSeguinte: document.getElementById('jornadaFeriadoSeguinte'),
    jornadaIntervalo: document.getElementById('jornadaIntervalo'),
    jornadaNotas: document.getElementById('jornadaNotas'),

    // Tabela de Jornadas
    contadorJornadas: document.getElementById('contadorJornadas'),
    tabelaJornadasBody: document.getElementById('tabelaJornadasBody'),
    estadoVazioJornadas: document.getElementById('estadoVazioJornadas'),

    // Comparação
    formValorHoraGlobal: document.getElementById('formValorHoraGlobal'),
    inputValorHoraGlobal: document.getElementById('inputValorHoraGlobal'),
    btnAplicarValorHoraGlobal: document.getElementById('btnAplicarValorHoraGlobal'),
    feedbackValorHoraGlobal: document.getElementById('feedbackValorHoraGlobal'),
    checkGlobalDomingoExtra: document.getElementById('checkGlobalDomingoExtra'),
    checkGlobalFeriadoExtra: document.getElementById('checkGlobalFeriadoExtra'),
    alertaDiscrepanciaTaxa: document.getElementById('alertaDiscrepanciaTaxa'),
    inputFiltroRanking: document.getElementById('inputFiltroRanking'),
    btnLimparFiltroRanking: document.getElementById('btnLimparFiltroRanking'),
    contadorFiltroRanking: document.getElementById('contadorFiltroRanking'),
    containerChipsFiltro: document.getElementById('containerChipsFiltro'),
    tabelaComparacaoBody: document.getElementById('tabelaComparacaoBody'),
    estadoVazioComparacao: document.getElementById('estadoVazioComparacao'),
    cardsComparativosContainer: document.getElementById('cardsComparativosContainer'),

    // Modal Escala
    modalEscala: document.getElementById('modalEscala'),
    modalEscalaTitulo: document.getElementById('modalEscalaTitulo'),
    formModalEscala: document.getElementById('formModalEscala'),
    modalEscalaId: document.getElementById('modalEscalaId'),
    modalEscalaCodigo: document.getElementById('modalEscalaCodigo'),
    modalEscalaNome: document.getElementById('modalEscalaNome'),
    modalEscalaFuncionario: document.getElementById('modalEscalaFuncionario'),
    modalEscalaJornadaMensal: document.getElementById('modalEscalaJornadaMensal'),
    modalEscalaValorHora: document.getElementById('modalEscalaValorHora'),
    modalEscalaLimiteDiario: document.getElementById('modalEscalaLimiteDiario'),
    modalEscalaAdicionalExtra: document.getElementById('modalEscalaAdicionalExtra'),
    modalEscalaAdicionalDomFer: document.getElementById('modalEscalaAdicionalDomFer'),
    modalEscalaDomingoExtra: document.getElementById('modalEscalaDomingoExtra'),
    modalEscalaFeriadoExtra: document.getElementById('modalEscalaFeriadoExtra'),

    // Modal Editar Jornada
    modalEditarJornada: document.getElementById('modalEditarJornada'),
    formModalEditarJornada: document.getElementById('formModalEditarJornada'),
    modalEditarJornadaId: document.getElementById('modalEditarJornadaId'),
    modalEditarJornadaEscalaSelect: document.getElementById('modalEditarJornadaEscalaSelect'),
    modalEditarJornadaFuncionario: document.getElementById('modalEditarJornadaFuncionario'),
    modalEditarJornadaData: document.getElementById('modalEditarJornadaData'),
    modalEditarDiaSemanaLabel: document.getElementById('modalEditarDiaSemanaLabel'),
    modalEditarJornadaEntrada: document.getElementById('modalEditarJornadaEntrada'),
    modalEditarJornadaSaida: document.getElementById('modalEditarJornadaSaida'),
    modalEditarJornadaIntervalo: document.getElementById('modalEditarJornadaIntervalo'),
    modalEditarJornadaFeriado: document.getElementById('modalEditarJornadaFeriado'),
    modalContainerFeriadoDiaSeguinte: document.getElementById('modalContainerFeriadoDiaSeguinte'),
    modalEditarJornadaFeriadoSeguinte: document.getElementById('modalEditarJornadaFeriadoSeguinte'),
    modalEditarJornadaNotas: document.getElementById('modalEditarJornadaNotas'),

    // Modal Semana Completa
    modalSemanaCompleta: document.getElementById('modalSemanaCompleta'),
    formModalSemanaCompleta: document.getElementById('formModalSemanaCompleta'),
    semanaEscalaSelect: document.getElementById('semanaEscalaSelect'),
    semanaFuncionario: document.getElementById('semanaFuncionario'),
    semanaDataInicio: document.getElementById('semanaDataInicio'),
    semanaModelo: document.getElementById('semanaModelo'),
    semanaDiasContainer: document.getElementById('semanaDiasContainer'),
    semanaResumoHoras: document.getElementById('semanaResumoHoras'),
    btnSalvarSemanaCompleta: document.getElementById('btnSalvarSemanaCompleta'),

    // Modal Confirmação
    modalConfirmacao: document.getElementById('modalConfirmacao'),
    modalConfirmacaoTitulo: document.getElementById('modalConfirmacaoTitulo'),
    modalConfirmacaoMensagem: document.getElementById('modalConfirmacaoMensagem'),
    btnModalConfirmacaoCancelar: document.getElementById('btnModalConfirmacaoCancelar'),
    btnModalConfirmacaoExecutar: document.getElementById('btnModalConfirmacaoExecutar'),

    // Modal Exportar/Importar
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

    // Filtro rápido no Ranking (%texto, texto%, descrição livre)
    if (dom.inputFiltroRanking) {
      dom.inputFiltroRanking.addEventListener('input', (e) => {
        aplicarFiltroRanking(e.target.value, false);
      });
    }

    if (dom.btnLimparFiltroRanking) {
      dom.btnLimparFiltroRanking.addEventListener('click', () => {
        aplicarFiltroRanking('', true);
        if (dom.inputFiltroRanking) dom.inputFiltroRanking.focus();
      });
    }

    if (dom.containerChipsFiltro) {
      dom.containerChipsFiltro.querySelectorAll('.chip-filtro').forEach((chip) => {
        chip.addEventListener('click', () => {
          aplicarFiltroRanking(chip.dataset.filter || '', true);
        });
      });
    }

    // Alteração global de Valor-Hora e regras de Domingo/Feriado para todas as escalas
    if (dom.formValorHoraGlobal) {
      dom.formValorHoraGlobal.addEventListener('submit', tratarAplicarValorHoraGlobal);
    }
    if (dom.checkGlobalDomingoExtra) {
      dom.checkGlobalDomingoExtra.addEventListener('change', () => {
        aplicarRegraDomFerGlobal('domingo', dom.checkGlobalDomingoExtra.checked);
      });
    }
    if (dom.checkGlobalFeriadoExtra) {
      dom.checkGlobalFeriadoExtra.addEventListener('change', () => {
        aplicarRegraDomFerGlobal('feriado', dom.checkGlobalFeriadoExtra.checked);
      });
    }

    // Mudança de escala selecionada no topo
    dom.selectEscalaAtiva.addEventListener('change', (e) => {
      state.activeScaleId = e.target.value;
      if (dom.jornadaEscalaSelect) dom.jornadaEscalaSelect.value = state.activeScaleId;
      preencherFuncionarioPadrao();
      renderizarEscalaAtiva();
    });

    // Quando o usuário muda a escala diretamente no formulário de jornada
    if (dom.jornadaEscalaSelect) {
      dom.jornadaEscalaSelect.addEventListener('change', (e) => {
        state.activeScaleId = e.target.value;
        if (dom.selectEscalaAtiva) dom.selectEscalaAtiva.value = state.activeScaleId;
        preencherFuncionarioPadrao();
        renderizarEscalaAtiva();
      });
    }

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

    // Submissão do formulário de adição de jornada
    dom.formAdicionarJornada.addEventListener('submit', tratarAdicionarJornada);

    // Botão e formulário de Semana Completa
    if (dom.btnAbrirSemanaCompleta) {
      dom.btnAbrirSemanaCompleta.addEventListener('click', abrirModalSemanaCompleta);
    }
    if (dom.formModalSemanaCompleta) {
      dom.formModalSemanaCompleta.addEventListener('submit', salvarSemanaCompleta);
      dom.semanaEscalaSelect.addEventListener('change', () => {
        const esc = state.scales.find((s) => s.id === dom.semanaEscalaSelect.value);
        if (esc && esc.employee) dom.semanaFuncionario.value = esc.employee;
        gerarGradeSemana();
      });
      dom.semanaDataInicio.addEventListener('input', gerarGradeSemana);
      dom.semanaModelo.addEventListener('change', gerarGradeSemana);
    }

    // Botões de Escala
    dom.btnNovaEscala.addEventListener('click', abrirModalNovaEscala);
    dom.btnEditarEscala.addEventListener('click', () => abrirModalEditarEscala());
    dom.btnExcluirEscala.addEventListener('click', () => confirmarExclusaoEscala());
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
   * Preenche o campo de funcionário no formulário de jornada conforme a escala selecionada
   */
  function preencherFuncionarioPadrao() {
    const escala = getEscalaAtiva();
    if (escala && dom.jornadaFuncionario && (!dom.jornadaFuncionario.value || dom.jornadaFuncionario.value.startsWith('Funcionário') || dom.jornadaFuncionario.value.startsWith('Cenário'))) {
      dom.jornadaFuncionario.value = escala.employee || '';
    }
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
    preencherFuncionarioPadrao();

    if (state.activeTab === 'escala') {
      renderizarEscalaAtiva();
    } else {
      renderizarPainelComparacao();
    }
    dom.badgeQtdEscalas.textContent = state.scales.length;
  }

  /**
   * Atualiza os selects de escalas em toda a aplicação (ordenados pelo ranking)
   */
  function atualizarSelectEscalas() {
    const selects = [
      dom.selectEscalaAtiva,
      dom.jornadaEscalaSelect,
      dom.semanaEscalaSelect,
      dom.modalEditarJornadaEscalaSelect
    ];

    const comparison = RHCalculator.compareScales(state.scales);

    selects.forEach((sel) => {
      if (!sel) return;
      sel.innerHTML = '';

      if (comparison.rankedScales.length === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Nenhuma escala cadastrada';
        sel.appendChild(opt);
        return;
      }

      comparison.rankedScales.forEach((scale) => {
        const opt = document.createElement('option');
        opt.value = scale.id;
        const codeLabel = scale.code ? `[${scale.code}] ` : '';
        const monthlyLabel = scale.monthlyHours ? ` • ${scale.monthlyHours}h/mês` : '';
        opt.textContent = `${scale.rank}º — ${codeLabel}${scale.name}${monthlyLabel} (${RHCalculator.formatCurrency(scale.totalEstimatedCost)})`;
        if (scale.id === state.activeScaleId) {
          opt.selected = true;
        }
        sel.appendChild(opt);
      });
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
      if (dom.kpiJornadaMensal) dom.kpiJornadaMensal.textContent = '--';
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
    if (dom.kpiJornadaMensal) {
      const codText = calculo.code ? `Cód. ${calculo.code} • ` : '';
      const jmText = calculo.monthlyHours ? `${calculo.monthlyHours}h/mês` : 'Livre';
      dom.kpiJornadaMensal.textContent = `${codText}${jmText}`;
    }

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

    calculo.journeys.forEach((jornada) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50 transition-colors border-b border-slate-100';

      // Badge de Classificação
      let badgeHtml = '';
      if (jornada.isSplit) {
        badgeHtml = `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Virada de Data</span>`;
      } else {
        const seg = jornada.segments[0];
        if (seg.classification === 'domingo_feriado') {
          badgeHtml = seg.appliedSundayHolidayExtra
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold badge-sunday-holiday">Dom + Feriado (200%)</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium badge-common">Dom + Feriado (Normal)</span>`;
        } else if (seg.classification === 'domingo') {
          badgeHtml = seg.appliedSundayHolidayExtra
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold badge-sunday">Domingo (200%)</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium badge-common">Domingo (Normal)</span>`;
        } else if (seg.classification === 'feriado') {
          badgeHtml = seg.appliedSundayHolidayExtra
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold badge-holiday">Feriado (200%)</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium badge-common">Feriado (Normal)</span>`;
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

      const funcionarioExibido = jornada.employee || escala.employee || 'Não informado';

      tr.innerHTML = `
        <td class="py-3 px-3.5">
          <div class="font-semibold text-slate-900">${jornada.date}</div>
          <div class="text-[11px] text-slate-500">${jornada.dayOfWeek}</div>
          ${jornada.notes ? `<div class="text-[11px] text-slate-400 italic mt-0.5">${escapeHtml(jornada.notes)}</div>` : ''}
        </td>
        <td class="py-3 px-2.5">
          <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            <svg class="w-3.5 h-3.5 text-sky-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg>
            ${escapeHtml(funcionarioExibido)}
          </span>
        </td>
        <td class="py-3 px-2.5 font-mono text-slate-800">
          ${jornada.startTime} → ${jornada.endTime}
          ${jornada.breakHours > 0 ? `<span class="ml-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-sans font-medium bg-slate-100 text-slate-600 border border-slate-200">-${RHCalculator.formatHours(jornada.breakHours)} int.</span>` : ''}
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
   * Aplica filtro de escalas na aba de Ranking e sincroniza chips/botão limpar
   * @param {string} valor
   * @param {boolean} atualizarInput
   */
  function aplicarFiltroRanking(valor, atualizarInput) {
    state.filterText = String(valor || '').trim();
    if (atualizarInput && dom.inputFiltroRanking) {
      dom.inputFiltroRanking.value = state.filterText;
    }

    if (dom.btnLimparFiltroRanking) {
      if (state.filterText) {
        dom.btnLimparFiltroRanking.classList.remove('hidden');
      } else {
        dom.btnLimparFiltroRanking.classList.add('hidden');
      }
    }

    if (dom.containerChipsFiltro) {
      const normalizedCurrent = RHCalculator.normalizeSearchText(state.filterText);
      dom.containerChipsFiltro.querySelectorAll('.chip-filtro').forEach((chip) => {
        const chipVal = RHCalculator.normalizeSearchText(chip.dataset.filter || '');
        const ativo = chipVal === normalizedCurrent;
        chip.classList.toggle('bg-sky-600', ativo);
        chip.classList.toggle('text-white', ativo);
        chip.classList.toggle('border-sky-600', ativo);
        chip.classList.toggle('bg-white', !ativo);
        chip.classList.toggle('text-slate-700', !ativo);
        chip.classList.toggle('border-slate-300', !ativo);
      });
    }

    renderizarPainelComparacao();
  }

  /**
   * Renderiza a aba de Comparação Geral e Ranking de Escalas (SPEC 9)
   */
  function renderizarPainelComparacao() {
    const comparison = RHCalculator.compareScales(state.scales);

    // Alerta de discrepância de taxas horárias e sincronização do valor-hora global
    if (comparison.hasRateDiscrepancy) {
      dom.alertaDiscrepanciaTaxa.classList.remove('hidden');
    } else {
      dom.alertaDiscrepanciaTaxa.classList.add('hidden');
      if (
        dom.inputValorHoraGlobal &&
        document.activeElement !== dom.inputValorHoraGlobal &&
        comparison.rankedScales.length > 0
      ) {
        dom.inputValorHoraGlobal.value = Number(comparison.rankedScales[0].hourlyRate).toFixed(2);
      }
    }

    // Sincroniza checkboxes globais de Domingo/Feriado (com suporte a estado misto)
    if (dom.checkGlobalDomingoExtra && comparison.rankedScales.length > 0) {
      const allSun = comparison.rankedScales.every((s) => s.paySundayExtra !== false);
      const noneSun = comparison.rankedScales.every((s) => s.paySundayExtra === false);
      dom.checkGlobalDomingoExtra.checked = allSun;
      dom.checkGlobalDomingoExtra.indeterminate = !allSun && !noneSun;
    }
    if (dom.checkGlobalFeriadoExtra && comparison.rankedScales.length > 0) {
      const allHol = comparison.rankedScales.every((s) => s.payHolidayExtra !== false);
      const noneHol = comparison.rankedScales.every((s) => s.payHolidayExtra === false);
      dom.checkGlobalFeriadoExtra.checked = allHol;
      dom.checkGlobalFeriadoExtra.indeterminate = !allHol && !noneHol;
    }

    dom.tabelaComparacaoBody.innerHTML = '';
    dom.cardsComparativosContainer.innerHTML = '';

    const filtro = state.filterText || '';
    const escalasFiltradas = RHCalculator.filterScales(comparison.rankedScales, filtro);

    if (dom.contadorFiltroRanking) {
      const total = comparison.rankedScales.length;
      const exibidas = escalasFiltradas.length;
      dom.contadorFiltroRanking.textContent = filtro
        ? `Filtro ativo: ${exibidas} de ${total} escala(s)`
        : `Exibindo ${total} de ${total} escalas`;
    }

    if (dom.btnLimparFiltroRanking) {
      dom.btnLimparFiltroRanking.classList.toggle('hidden', !filtro);
    }

    if (escalasFiltradas.length === 0) {
      dom.estadoVazioComparacao.classList.remove('hidden');
      dom.estadoVazioComparacao.querySelector('p').textContent =
        comparison.rankedScales.length === 0
          ? 'Nenhuma escala cadastrada para comparação.'
          : `Nenhuma escala encontrada para o filtro "${state.filterText}".`;
      return;
    }

    dom.estadoVazioComparacao.classList.add('hidden');

    escalasFiltradas.forEach((scale) => {
      // Linha da tabela
      const tr = document.createElement('tr');
      tr.className = `hover:bg-slate-50 transition-colors border-b border-slate-100 ${
        scale.isLowestCost ? 'bg-emerald-50/40 font-medium' : ''
      }`;

      // Badge de Posição
      let rankBadge = '';
      if (scale.isLowestCost) {
        rankBadge = `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold badge-lowest-cost whitespace-nowrap">
            🥇 1º (Mais Barata)
          </span>
        `;
      } else {
        rankBadge = `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">${scale.rank}º Lugar</span>`;
      }

      // Badge de Código e Jornada Mensal
      const codeBadge = scale.code
        ? `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-white mr-1.5">${escapeHtml(scale.code)}</span>`
        : '';

      const monthlyBadge = scale.monthlyHours
        ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 whitespace-nowrap">${scale.monthlyHours}h/mês</span>`
        : `<span class="text-slate-400 text-xs">-</span>`;

      let domFerRuleBadge = '';
      if (!scale.paySundayExtra && !scale.payHolidayExtra) {
        domFerRuleBadge = `<span class="inline-flex items-center mt-1 ml-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Dom/Fer: Normal</span>`;
      } else if (!scale.paySundayExtra) {
        domFerRuleBadge = `<span class="inline-flex items-center mt-1 ml-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Dom: Normal</span>`;
      } else if (!scale.payHolidayExtra) {
        domFerRuleBadge = `<span class="inline-flex items-center mt-1 ml-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">Feriado: Normal</span>`;
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
          <div class="font-bold text-slate-900 flex items-center flex-wrap gap-y-1">
            ${codeBadge}
            <span>${escapeHtml(scale.name)}</span>
          </div>
          <div class="flex flex-wrap items-center">
            ${
              scale.employee
                ? `<span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">${escapeHtml(scale.employee)}</span>`
                : ''
            }
            ${domFerRuleBadge}
          </div>
        </td>
        <td class="py-3.5 px-2 text-center">
          ${monthlyBadge}
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
        <td class="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 text-sm bg-slate-100/50 whitespace-nowrap">
          ${RHCalculator.formatCurrency(scale.totalEstimatedCost)}
        </td>
        <td class="py-3.5 px-3 text-right whitespace-nowrap">
          ${diffHtml}
        </td>
        <td class="py-3.5 px-3 text-center whitespace-nowrap">
          <div class="inline-flex items-center justify-center gap-1.5">
            <button type="button" data-action="detalhar-escala" data-id="${scale.id}" class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors" title="Ver jornadas desta escala">
              Jornadas
            </button>
            <button type="button" data-action="editar-escala" data-id="${scale.id}" class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors" title="Editar parâmetros desta escala">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Editar
            </button>
            <button type="button" data-action="excluir-escala" data-id="${scale.id}" class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors" title="Excluir esta escala">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Excluir
            </button>
          </div>
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
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Ranking</span>
              <div class="mt-0.5">${rankBadge}</div>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-400">Jornada Mensal</span>
              <div class="mt-0.5">${monthlyBadge}</div>
            </div>
          </div>

          <h3 class="font-bold text-slate-900 text-sm mb-1.5 leading-snug">
            ${codeBadge}${escapeHtml(scale.name)}
          </h3>
          <div class="mb-3 flex flex-wrap items-center gap-1">
            ${
              scale.employee
                ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">${escapeHtml(scale.employee)}</span>`
                : ''
            }
            ${domFerRuleBadge}
          </div>

          <div class="space-y-1.5 py-3 border-y border-slate-100 text-xs">
            <div class="flex justify-between text-slate-600">
              <span>Valor-Hora / Limite Diário:</span>
              <span class="font-mono font-semibold text-slate-800">${RHCalculator.formatCurrency(scale.hourlyRate)}/h • ${scale.dailyNormalLimit.toFixed(1)}h</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Total Trabalhado (${scale.totalJourneysCount} dias):</span>
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

          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button type="button" data-action="detalhar-escala" data-id="${scale.id}" class="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors">
              Ver Jornadas
            </button>
            <button type="button" data-action="editar-escala" data-id="${scale.id}" class="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Editar
            </button>
            <button type="button" data-action="excluir-escala" data-id="${scale.id}" class="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Excluir
            </button>
          </div>
        </div>
      `;

      dom.cardsComparativosContainer.appendChild(card);
    });

    // Vincula ações de Detalhar, Editar e Excluir tanto na tabela quanto nos cards
    [dom.tabelaComparacaoBody, dom.cardsComparativosContainer].forEach((container) => {
      container.querySelectorAll('[data-action="detalhar-escala"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.activeScaleId = btn.dataset.id;
          atualizarSelectEscalas();
          preencherFuncionarioPadrao();
          mudarAba('escala');
        });
      });

      container.querySelectorAll('[data-action="editar-escala"]').forEach((btn) => {
        btn.addEventListener('click', () => abrirModalEditarEscala(btn.dataset.id));
      });

      container.querySelectorAll('[data-action="excluir-escala"]').forEach((btn) => {
        btn.addEventListener('click', () => confirmarExclusaoEscala(btn.dataset.id));
      });
    });
  }

  /**
   * Exibe mensagem temporária de confirmação na barra de parâmetros globais
   * @param {string} mensagem
   */
  function mostrarFeedbackGlobal(mensagem) {
    if (!dom.feedbackValorHoraGlobal) return;
    dom.feedbackValorHoraGlobal.textContent = mensagem;
    dom.feedbackValorHoraGlobal.classList.remove('hidden');
    clearTimeout(dom.feedbackValorHoraGlobal._hideTimer);
    dom.feedbackValorHoraGlobal._hideTimer = setTimeout(() => {
      dom.feedbackValorHoraGlobal.classList.add('hidden');
    }, 4500);
  }

  /**
   * Aplica o valor-hora global (e regras de domingo/feriado) em todas as escalas cadastradas
   */
  function tratarAplicarValorHoraGlobal(e) {
    e.preventDefault();

    if (state.scales.length === 0) {
      alert('Nenhuma escala cadastrada para atualizar.');
      return;
    }

    const novoValor = parseFloat(dom.inputValorHoraGlobal.value);
    if (isNaN(novoValor) || novoValor <= 0) {
      alert('Informe um valor por hora válido e maior que zero.');
      return;
    }

    const settings = { hourlyRate: novoValor };
    if (dom.checkGlobalDomingoExtra && !dom.checkGlobalDomingoExtra.indeterminate) {
      settings.paySundayExtra = dom.checkGlobalDomingoExtra.checked;
    }
    if (dom.checkGlobalFeriadoExtra && !dom.checkGlobalFeriadoExtra.indeterminate) {
      settings.payHolidayExtra = dom.checkGlobalFeriadoExtra.checked;
    }

    try {
      state.scales = RHStorage.updateAllGlobalSettings(settings);
      renderizarInterface();
      mostrarFeedbackGlobal(`✓ ${RHCalculator.formatCurrency(novoValor)}/h aplicado em ${state.scales.length} escala(s)`);
    } catch (err) {
      alert('Erro ao atualizar parâmetros globais: ' + err.message);
    }
  }

  /**
   * Aplica imediatamente em todas as escalas a escolha de considerar ou não
   * Domingos ou Feriados como hora extra (200%)
   * @param {'domingo'|'feriado'} tipo
   * @param {boolean} considerarExtra
   */
  function aplicarRegraDomFerGlobal(tipo, considerarExtra) {
    if (state.scales.length === 0) return;

    const settings = tipo === 'domingo'
      ? { paySundayExtra: considerarExtra }
      : { payHolidayExtra: considerarExtra };

    try {
      state.scales = RHStorage.updateAllGlobalSettings(settings);
      renderizarInterface();
      const rotulo = tipo === 'domingo' ? 'Domingos' : 'Feriados';
      const modo = considerarExtra ? 'hora extra (200%)' : 'jornada normal';
      mostrarFeedbackGlobal(`✓ ${rotulo} definidos como ${modo} em ${state.scales.length} escala(s)`);
    } catch (err) {
      alert('Erro ao atualizar regra global: ' + err.message);
    }
  }

  /**
   * Trata a submissão do formulário de adição de jornada
   */
  function tratarAdicionarJornada(e) {
    e.preventDefault();

    const targetScaleId = dom.jornadaEscalaSelect.value || state.activeScaleId;
    const escala = state.scales.find((s) => s.id === targetScaleId);

    if (!escala) {
      alert('Selecione ou crie uma escala antes de adicionar jornadas.');
      return;
    }

    const funcionario = dom.jornadaFuncionario.value.trim() || escala.employee || '';

    const intervalo = dom.jornadaIntervalo ? parseFloat(dom.jornadaIntervalo.value) || 0 : 0;

    const novaJornada = {
      date: dom.jornadaData.value,
      employee: funcionario,
      startTime: dom.jornadaEntrada.value,
      endTime: dom.jornadaSaida.value,
      breakHours: intervalo > 0 ? intervalo : 0,
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
      state.activeScaleId = escala.id;
      if (dom.selectEscalaAtiva) dom.selectEscalaAtiva.value = escala.id;

      renderizarInterface();

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
   * Assistente de Semana Completa de Jornadas
   */
  function abrirModalSemanaCompleta() {
    atualizarSelectEscalas();
    const escala = getEscalaAtiva();

    if (escala) {
      dom.semanaEscalaSelect.value = escala.id;
      dom.semanaFuncionario.value = escala.employee || 'Funcionário X';
    } else {
      dom.semanaFuncionario.value = 'Funcionário X';
    }

    // Calcula a segunda-feira da semana corrente
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = Domingo, 1 = Segunda, ...
    const diffParaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
    const segundaFeira = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + diffParaSegunda);

    const ano = segundaFeira.getFullYear();
    const mes = String(segundaFeira.getMonth() + 1).padStart(2, '0');
    const dia = String(segundaFeira.getDate()).padStart(2, '0');
    dom.semanaDataInicio.value = `${ano}-${mes}-${dia}`;

    gerarGradeSemana();
    abrirModal(dom.modalSemanaCompleta);
  }

  /**
   * Gera a grade interativa de 7 dias no modal de semana completa
   */
  function gerarGradeSemana() {
    const dataInicioStr = dom.semanaDataInicio.value;
    if (!dataInicioStr) return;

    let dataBase;
    try {
      const p = RHCalculator.parseDateSafe(dataInicioStr);
      dataBase = p.dateObj;
    } catch (e) {
      return;
    }

    const modelo = dom.semanaModelo.value;
    dom.semanaDiasContainer.innerHTML = '';

    const nomesDias = [
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
      'Domingo'
    ];

    let totalHorasPrevistas = 0;

    for (let i = 0; i < 7; i++) {
      const diaObj = new Date(dataBase.getFullYear(), dataBase.getMonth(), dataBase.getDate() + i);
      const diaStr = `${diaObj.getFullYear()}-${String(diaObj.getMonth() + 1).padStart(2, '0')}-${String(diaObj.getDate()).padStart(2, '0')}`;
      const isDom = diaObj.getDay() === 0;
      const isSab = diaObj.getDay() === 6;

      let trabalhado = true;
      let entrada = '08:00';
      let saida = '16:00';

      if (modelo === '5x2_8h') {
        if (isSab || isDom) trabalhado = false;
        else {
          entrada = '08:00';
          saida = '16:00';
        }
      } else if (modelo === '6x1_dom') {
        if (isSab) trabalhado = false;
        else if (isDom) {
          entrada = '08:00';
          saida = '15:00';
        } else {
          entrada = '08:00';
          saida = '15:00';
        }
      } else if (modelo === '5x2_extras') {
        if (isSab || isDom) trabalhado = false;
        else {
          entrada = '08:00';
          saida = '18:00'; // 10h
        }
      } else if (modelo === '6x1_44h') {
        if (isDom) trabalhado = false;
        else if (isSab) {
          entrada = '08:00';
          saida = '12:00'; // 4h
        } else {
          entrada = '08:00';
          saida = '16:00'; // 8h
        }
      }

      let horasDia = 0;
      if (trabalhado) {
        horasDia = RHCalculator.calculateJourneyDuration(entrada, saida);
        totalHorasPrevistas += horasDia;
      }

      const row = document.createElement('div');
      row.className = `p-2.5 flex flex-wrap items-center justify-between gap-2 ${
        isDom ? 'bg-amber-50/50' : 'bg-white'
      }`;

      row.innerHTML = `
        <div class="flex items-center gap-2 min-w-[150px]">
          <input type="checkbox" id="semanaDiaTrabalhado_${i}" ${trabalhado ? 'checked' : ''} class="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 border-slate-300">
          <div>
            <div class="font-bold text-slate-800 text-xs">${nomesDias[i]}</div>
            <div class="text-[11px] text-slate-500 font-mono">${diaStr} ${isDom ? '• <strong class="text-amber-700">Domingo</strong>' : ''}</div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div>
            <label class="text-[10px] text-slate-400 block font-semibold">Entrada</label>
            <input type="time" id="semanaDiaEntrada_${i}" value="${entrada}" ${!trabalhado ? 'disabled' : ''} class="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono text-slate-800 disabled:opacity-40">
          </div>
          <div>
            <label class="text-[10px] text-slate-400 block font-semibold">Saída</label>
            <input type="time" id="semanaDiaSaida_${i}" value="${saida}" ${!trabalhado ? 'disabled' : ''} class="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-mono text-slate-800 disabled:opacity-40">
          </div>
        </div>

        <div class="flex items-center gap-2">
          <label class="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
            <input type="checkbox" id="semanaDiaFeriado_${i}" class="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5 border-slate-300">
            <span>Feriado</span>
          </label>
        </div>

        <div class="w-16 text-right font-mono font-bold text-xs text-slate-800" id="semanaDiaHoras_${i}">
          ${trabalhado ? RHCalculator.formatHours(horasDia) : '<span class="text-slate-400 font-normal">Folga</span>'}
        </div>
      `;

      dom.semanaDiasContainer.appendChild(row);

      // Eventos de alteração dos inputs de cada dia para recalcular
      const chk = row.querySelector(`#semanaDiaTrabalhado_${i}`);
      const inEnt = row.querySelector(`#semanaDiaEntrada_${i}`);
      const inSai = row.querySelector(`#semanaDiaSaida_${i}`);

      const atualizarLinha = () => {
        inEnt.disabled = !chk.checked;
        inSai.disabled = !chk.checked;
        recalcularTotalSemana();
      };

      chk.addEventListener('change', atualizarLinha);
      inEnt.addEventListener('input', recalcularTotalSemana);
      inSai.addEventListener('input', recalcularTotalSemana);
    }

    dom.semanaResumoHoras.textContent = `Total Previsto: ${RHCalculator.formatHours(totalHorasPrevistas)}`;
  }

  function recalcularTotalSemana() {
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const chk = document.getElementById(`semanaDiaTrabalhado_${i}`);
      const inEnt = document.getElementById(`semanaDiaEntrada_${i}`);
      const inSai = document.getElementById(`semanaDiaSaida_${i}`);
      const lblHoras = document.getElementById(`semanaDiaHoras_${i}`);

      if (chk && chk.checked && inEnt && inSai) {
        try {
          const h = RHCalculator.calculateJourneyDuration(inEnt.value, inSai.value);
          total += h;
          if (lblHoras) lblHoras.textContent = RHCalculator.formatHours(h);
        } catch (e) {
          if (lblHoras) lblHoras.textContent = 'Erro';
        }
      } else if (lblHoras) {
        lblHoras.innerHTML = '<span class="text-slate-400 font-normal">Folga</span>';
      }
    }
    dom.semanaResumoHoras.textContent = `Total Previsto: ${RHCalculator.formatHours(total)}`;
  }

  function salvarSemanaCompleta(e) {
    e.preventDefault();

    const targetScaleId = dom.semanaEscalaSelect.value;
    const funcionario = dom.semanaFuncionario.value.trim();
    const dataInicioStr = dom.semanaDataInicio.value;

    if (!targetScaleId) {
      alert('Selecione uma escala de destino.');
      return;
    }

    if (!dataInicioStr) {
      alert('Informe a data de início da semana.');
      return;
    }

    let dataBase;
    try {
      const p = RHCalculator.parseDateSafe(dataInicioStr);
      dataBase = p.dateObj;
    } catch (err) {
      alert('Data de início inválida: ' + err.message);
      return;
    }

    const novasJornadas = [];

    for (let i = 0; i < 7; i++) {
      const chk = document.getElementById(`semanaDiaTrabalhado_${i}`);
      if (chk && chk.checked) {
        const diaObj = new Date(dataBase.getFullYear(), dataBase.getMonth(), dataBase.getDate() + i);
        const diaStr = `${diaObj.getFullYear()}-${String(diaObj.getMonth() + 1).padStart(2, '0')}-${String(diaObj.getDate()).padStart(2, '0')}`;
        const entrada = document.getElementById(`semanaDiaEntrada_${i}`).value;
        const saida = document.getElementById(`semanaDiaSaida_${i}`).value;
        const feriado = document.getElementById(`semanaDiaFeriado_${i}`).checked;

        novasJornadas.push({
          date: diaStr,
          employee: funcionario,
          startTime: entrada,
          endTime: saida,
          isHoliday: feriado,
          isHolidayNextDay: false,
          notes: `Semana gerada para ${funcionario}`
        });
      }
    }

    if (novasJornadas.length === 0) {
      alert('Nenhum dia de trabalho marcado na semana.');
      return;
    }

    try {
      state.scales = RHStorage.addMultipleJourneysToScale(targetScaleId, novasJornadas);
      state.activeScaleId = targetScaleId;
      if (dom.selectEscalaAtiva) dom.selectEscalaAtiva.value = targetScaleId;

      fecharModal(dom.modalSemanaCompleta);
      renderizarInterface();
      alert(`Sucesso! ${novasJornadas.length} jornadas da semana foram inseridas para "${funcionario}".`);
    } catch (err) {
      alert('Erro ao salvar semana de jornadas: ' + err.message);
    }
  }

  /**
   * Modal de Escala: Novo ou Edição
   */
  function abrirModalNovaEscala() {
    dom.modalEscalaTitulo.textContent = 'Nova Escala de Trabalho';
    dom.modalEscalaId.value = '';
    if (dom.modalEscalaCodigo) dom.modalEscalaCodigo.value = '';
    dom.modalEscalaNome.value = '';
    dom.modalEscalaFuncionario.value = '';
    if (dom.modalEscalaJornadaMensal) dom.modalEscalaJornadaMensal.value = '200';
    const valorPadrao = dom.inputValorHoraGlobal && parseFloat(dom.inputValorHoraGlobal.value) > 0
      ? parseFloat(dom.inputValorHoraGlobal.value).toFixed(2)
      : '20.00';
    dom.modalEscalaValorHora.value = valorPadrao;
    dom.modalEscalaLimiteDiario.value = '8.0';
    dom.modalEscalaAdicionalExtra.value = '50';
    dom.modalEscalaAdicionalDomFer.value = '100';
    if (dom.modalEscalaDomingoExtra) {
      dom.modalEscalaDomingoExtra.checked = dom.checkGlobalDomingoExtra ? dom.checkGlobalDomingoExtra.checked : true;
    }
    if (dom.modalEscalaFeriadoExtra) {
      dom.modalEscalaFeriadoExtra.checked = dom.checkGlobalFeriadoExtra ? dom.checkGlobalFeriadoExtra.checked : true;
    }

    abrirModal(dom.modalEscala);
  }

  function abrirModalEditarEscala(scaleId) {
    const escala = scaleId
      ? state.scales.find((s) => s.id === scaleId)
      : getEscalaAtiva();
    if (!escala) return;

    dom.modalEscalaTitulo.textContent = 'Editar Escala e Parâmetros';
    dom.modalEscalaId.value = escala.id;
    if (dom.modalEscalaCodigo) dom.modalEscalaCodigo.value = escala.code || '';
    dom.modalEscalaNome.value = escala.name;
    dom.modalEscalaFuncionario.value = escala.employee || '';
    if (dom.modalEscalaJornadaMensal) dom.modalEscalaJornadaMensal.value = escala.monthlyHours || '';
    dom.modalEscalaValorHora.value = escala.hourlyRate;
    dom.modalEscalaLimiteDiario.value = escala.dailyNormalLimit;
    dom.modalEscalaAdicionalExtra.value = Math.round(((escala.overtimeMultiplier || 1.5) - 1) * 100);
    dom.modalEscalaAdicionalDomFer.value = Math.round(((escala.sundayHolidayMultiplier || 2.0) - 1) * 100);
    if (dom.modalEscalaDomingoExtra) dom.modalEscalaDomingoExtra.checked = escala.paySundayExtra !== false;
    if (dom.modalEscalaFeriadoExtra) dom.modalEscalaFeriadoExtra.checked = escala.payHolidayExtra !== false;

    abrirModal(dom.modalEscala);
  }

  function salvarModalEscala(e) {
    e.preventDefault();

    const id = dom.modalEscalaId.value;
    const codigo = dom.modalEscalaCodigo ? dom.modalEscalaCodigo.value.trim() : '';
    const nome = dom.modalEscalaNome.value.trim();
    const funcionario = dom.modalEscalaFuncionario.value.trim();
    const jornadaMensalRaw = dom.modalEscalaJornadaMensal ? dom.modalEscalaJornadaMensal.value.trim() : '';
    const jornadaMensal = jornadaMensalRaw !== '' ? parseFloat(jornadaMensalRaw) : null;
    const valorHora = parseFloat(dom.modalEscalaValorHora.value);
    const limiteDiario = parseFloat(dom.modalEscalaLimiteDiario.value);
    const extraPct = parseFloat(dom.modalEscalaAdicionalExtra.value);
    const domFerPct = parseFloat(dom.modalEscalaAdicionalDomFer.value);
    const paySundayExtra = dom.modalEscalaDomingoExtra ? dom.modalEscalaDomingoExtra.checked : true;
    const payHolidayExtra = dom.modalEscalaFeriadoExtra ? dom.modalEscalaFeriadoExtra.checked : true;

    const scaleData = {
      code: codigo,
      name: nome,
      employee: funcionario,
      monthlyHours: jornadaMensal,
      hourlyRate: valorHora,
      dailyNormalLimit: limiteDiario,
      overtimeMultiplier: 1 + (isNaN(extraPct) ? 50 : extraPct) / 100,
      sundayHolidayMultiplier: 1 + (isNaN(domFerPct) ? 100 : domFerPct) / 100,
      paySundayExtra,
      payHolidayExtra
    };

    const validacao = RHCalculator.validateScale(scaleData);
    if (!validacao.isValid) {
      alert('Erros no preenchimento da escala:\n\n• ' + validacao.errors.join('\n• '));
      return;
    }

    if (id) {
      // Edição
      state.scales = RHStorage.updateScale(id, scaleData);
      state.activeScaleId = id;
    } else {
      // Criação com ID conhecido antes da ordenação por ranking
      const newId = 'escala-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
      state.scales = RHStorage.addScale({ ...scaleData, id: newId });
      state.activeScaleId = newId;
    }

    fecharModal(dom.modalEscala);
    renderizarInterface();
  }

  function confirmarExclusaoEscala(scaleId) {
    const escala = scaleId
      ? state.scales.find((s) => s.id === scaleId)
      : getEscalaAtiva();
    if (!escala) return;

    const rotulo = escala.code ? `[${escala.code}] ${escala.name}` : escala.name;

    abrirModalConfirmacao(
      'Excluir Escala',
      `Tem certeza que deseja excluir a escala "${rotulo}" e todas as suas jornadas? Esta ação não pode ser desfeita.`,
      () => {
        state.scales = RHStorage.deleteScale(escala.id);
        if (state.activeScaleId === escala.id || !state.scales.some((s) => s.id === state.activeScaleId)) {
          state.activeScaleId = state.scales.length > 0 ? state.scales[0].id : null;
        }
        renderizarInterface();
      }
    );
  }

  /**
   * Modal de Edição de Jornada
   */
  function abrirModalEditarJornada(journeyId) {
    atualizarSelectEscalas();
    const escala = getEscalaAtiva();
    if (!escala) return;

    const jornada = (escala.journeys || []).find((j) => j.id === journeyId);
    if (!jornada) return;

    dom.modalEditarJornadaId.value = jornada.id;
    if (dom.modalEditarJornadaEscalaSelect) dom.modalEditarJornadaEscalaSelect.value = escala.id;
    if (dom.modalEditarJornadaFuncionario) dom.modalEditarJornadaFuncionario.value = jornada.employee || escala.employee || '';
    dom.modalEditarJornadaData.value = jornada.date;
    dom.modalEditarJornadaEntrada.value = jornada.startTime;
    dom.modalEditarJornadaSaida.value = jornada.endTime;
    if (dom.modalEditarJornadaIntervalo) dom.modalEditarJornadaIntervalo.value = jornada.breakHours || 0;
    dom.modalEditarJornadaFeriado.checked = Boolean(jornada.isHoliday);
    dom.modalEditarJornadaFeriadoSeguinte.checked = Boolean(jornada.isHolidayNextDay);
    dom.modalEditarJornadaNotas.value = jornada.notes || '';

    atualizarPrevisaoDiaSemana(jornada.date, dom.modalEditarDiaSemanaLabel);
    verificarViradaMeiaNoiteEditar();

    abrirModal(dom.modalEditarJornada);
  }

  function salvarModalEditarJornada(e) {
    e.preventDefault();

    const escalaAtual = getEscalaAtiva();
    if (!escalaAtual) return;

    const journeyId = dom.modalEditarJornadaId.value;
    const destinoEscalaId = dom.modalEditarJornadaEscalaSelect ? dom.modalEditarJornadaEscalaSelect.value : escalaAtual.id;
    const funcionario = dom.modalEditarJornadaFuncionario ? dom.modalEditarJornadaFuncionario.value.trim() : '';
    const intervalo = dom.modalEditarJornadaIntervalo ? parseFloat(dom.modalEditarJornadaIntervalo.value) || 0 : 0;

    const updatedJourney = {
      date: dom.modalEditarJornadaData.value,
      employee: funcionario,
      startTime: dom.modalEditarJornadaEntrada.value,
      endTime: dom.modalEditarJornadaSaida.value,
      breakHours: intervalo > 0 ? intervalo : 0,
      isHoliday: dom.modalEditarJornadaFeriado.checked,
      isHolidayNextDay: dom.modalEditarJornadaFeriadoSeguinte.checked,
      notes: dom.modalEditarJornadaNotas.value.trim()
    };

    const validacao = RHCalculator.validateJourney(updatedJourney);
    if (!validacao.isValid) {
      alert('Erros no preenchimento da jornada:\n\n• ' + validacao.errors.join('\n• '));
      return;
    }

    if (destinoEscalaId === escalaAtual.id) {
      state.scales = RHStorage.updateJourneyInScale(escalaAtual.id, journeyId, updatedJourney);
    } else {
      // Moveu de escala
      RHStorage.deleteJourneyFromScale(escalaAtual.id, journeyId);
      state.scales = RHStorage.addJourneyToScale(destinoEscalaId, updatedJourney);
      state.activeScaleId = destinoEscalaId;
    }

    fecharModal(dom.modalEditarJornada);
    renderizarInterface();
  }

  function confirmarExclusaoJornada(journeyId) {
    const escala = getEscalaAtiva();
    if (!escala) return;

    abrirModalConfirmacao('Excluir Jornada', 'Deseja remover esta jornada da escala ativa?', () => {
      state.scales = RHStorage.deleteJourneyFromScale(escala.id, journeyId);
      renderizarInterface();
    });
  }

  /**
   * Restauração de Escalas e Limpeza Geral
   */
  function confirmarRestaurarExemplos() {
    abrirModalConfirmacao(
      'Restaurar Catálogo de Escalas',
      'Deseja recarregar todas as 33 escalas únicas simuladas e ordenadas pelo ranking de menor custo? Isso substituirá as alterações locais atuais.',
      () => {
        state.scales = RHStorage.resetToSampleData();
        state.activeScaleId = state.scales.length > 0 ? state.scales[0].id : null;
        aplicarFiltroRanking('', true);
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
    if (modalElement) modalElement.classList.remove('hidden');
  }

  function fecharModal(modalElement) {
    if (modalElement) modalElement.classList.add('hidden');
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
