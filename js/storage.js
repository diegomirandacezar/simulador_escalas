/**
 * Módulo de Armazenamento Local — Simulador de Escalas e Custos de RH
 * Gerenciamento seguro no localStorage do navegador, com suporte a dados de demonstração,
 * importação/exportação e limpeza segura.
 *
 * Desenvolvedor: Diego Miranda Cezar
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RHStorage = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STORAGE_KEY = 'simulador_escalas_dados_v1';

  /**
   * Conjunto de dados de demonstração inicial para teste imediato e demonstração.
   */
  function getDefaultScales() {
    return [
      {
        id: 'escala-5x2-comercial',
        name: 'Escala 5x2 — Administrativa (Seg a Sex)',
        employee: 'Cenário Padrão 1',
        hourlyRate: 20.0,
        dailyNormalLimit: 8.0,
        overtimeMultiplier: 1.5,
        sundayHolidayMultiplier: 2.0,
        journeys: [
          {
            id: 'j-5x2-1',
            date: '2026-10-19', // Segunda
            startTime: '08:00',
            endTime: '16:00',
            isHoliday: false,
            notes: 'Jornada comercial padrão (8h)'
          },
          {
            id: 'j-5x2-2',
            date: '2026-10-20', // Terça
            startTime: '08:00',
            endTime: '16:00',
            isHoliday: false,
            notes: 'Jornada comercial padrão (8h)'
          },
          {
            id: 'j-5x2-3',
            date: '2026-10-21', // Quarta
            startTime: '08:00',
            endTime: '16:00',
            isHoliday: false,
            notes: 'Jornada comercial padrão (8h)'
          },
          {
            id: 'j-5x2-4',
            date: '2026-10-22', // Quinta
            startTime: '08:00',
            endTime: '16:00',
            isHoliday: false,
            notes: 'Jornada comercial padrão (8h)'
          },
          {
            id: 'j-5x2-5',
            date: '2026-10-23', // Sexta
            startTime: '08:00',
            endTime: '16:00',
            isHoliday: false,
            notes: 'Jornada comercial padrão (8h)'
          }
        ]
      },
      {
        id: 'escala-6x1-operacional',
        name: 'Escala 6x1 — Operacional (Inclui Domingo)',
        employee: 'Cenário Padrão 2',
        hourlyRate: 20.0,
        dailyNormalLimit: 8.0,
        overtimeMultiplier: 1.5,
        sundayHolidayMultiplier: 2.0,
        journeys: [
          {
            id: 'j-6x1-1',
            date: '2026-10-19', // Segunda
            startTime: '08:00',
            endTime: '15:00',
            isHoliday: false,
            notes: 'Turno diário (7h)'
          },
          {
            id: 'j-6x1-2',
            date: '2026-10-20', // Terça
            startTime: '08:00',
            endTime: '15:00',
            isHoliday: false,
            notes: 'Turno diário (7h)'
          },
          {
            id: 'j-6x1-3',
            date: '2026-10-21', // Quarta
            startTime: '08:00',
            endTime: '15:00',
            isHoliday: false,
            notes: 'Turno diário (7h)'
          },
          {
            id: 'j-6x1-4',
            date: '2026-10-22', // Quinta
            startTime: '08:00',
            endTime: '15:00',
            isHoliday: false,
            notes: 'Turno diário (7h)'
          },
          {
            id: 'j-6x1-5',
            date: '2026-10-23', // Sexta
            startTime: '08:00',
            endTime: '15:00',
            isHoliday: false,
            notes: 'Turno diário (7h)'
          },
          {
            id: 'j-6x1-6',
            date: '2026-10-25', // Domingo (adicional 100%)
            startTime: '08:00',
            endTime: '15:00',
            isHoliday: false,
            notes: 'Domingo trabalhado (7h a 200%)'
          }
        ]
      },
      {
        id: 'escala-noturna-plantao',
        name: 'Escala Plantão Noturno (Virada de Meia-Noite)',
        employee: 'Cenário Noturno 3',
        hourlyRate: 20.0,
        dailyNormalLimit: 8.0,
        overtimeMultiplier: 1.5,
        sundayHolidayMultiplier: 2.0,
        journeys: [
          {
            id: 'j-not-1',
            date: '2026-10-20', // Terça para Quarta
            startTime: '22:00',
            endTime: '06:00',
            isHoliday: false,
            isHolidayNextDay: false,
            notes: 'Plantão noturno 8h (22:00 às 06:00)'
          },
          {
            id: 'j-not-2',
            date: '2026-10-22', // Quinta para Sexta
            startTime: '22:00',
            endTime: '06:00',
            isHoliday: false,
            isHolidayNextDay: false,
            notes: 'Plantão noturno 8h (22:00 às 06:00)'
          },
          {
            id: 'j-not-3',
            date: '2026-10-24', // Sábado para Domingo (atravessa para domingo)
            startTime: '20:00',
            endTime: '04:00',
            isHoliday: false,
            isHolidayNextDay: false,
            notes: 'Virada de Sábado (4h) para Domingo (4h a 200%)'
          }
        ]
      }
    ];
  }

  /**
   * Verifica se o localStorage está disponível no navegador.
   * @returns {boolean}
   */
  function isStorageAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__rh_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Carrega a lista de escalas salvas no localStorage.
   * Se não houver dados, inicializa com o conjunto de demonstração.
   * @returns {Array<Object>}
   */
  function loadScales() {
    if (!isStorageAvailable()) {
      return getDefaultScales();
    }

    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (!data) {
        const defaults = getDefaultScales();
        saveScales(defaults);
        return defaults;
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return getDefaultScales();
    } catch (err) {
      console.warn('Erro ao carregar dados do localStorage:', err);
      return getDefaultScales();
    }
  }

  /**
   * Salva a lista de escalas no localStorage.
   * @param {Array<Object>} scales
   * @returns {boolean}
   */
  function saveScales(scales) {
    if (!isStorageAvailable()) {
      return false;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scales));
      return true;
    } catch (err) {
      console.error('Falha ao gravar no localStorage:', err);
      return false;
    }
  }

  /**
   * Adiciona uma nova escala.
   * @param {Object} scale
   * @returns {Array<Object>}
   */
  function addScale(scale) {
    const scales = loadScales();
    const newScale = {
      ...scale,
      id: scale.id || 'escala-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      journeys: Array.isArray(scale.journeys) ? scale.journeys : []
    };
    scales.push(newScale);
    saveScales(scales);
    return scales;
  }

  /**
   * Atualiza uma escala existente.
   * @param {string} scaleId
   * @param {Object} updatedData
   * @returns {Array<Object>}
   */
  function updateScale(scaleId, updatedData) {
    const scales = loadScales();
    const index = scales.findIndex((s) => s.id === scaleId);
    if (index !== -1) {
      scales[index] = {
        ...scales[index],
        ...updatedData,
        id: scaleId,
        journeys: updatedData.journeys || scales[index].journeys || []
      };
      saveScales(scales);
    }
    return scales;
  }

  /**
   * Exclui uma escala.
   * @param {string} scaleId
   * @returns {Array<Object>}
   */
  function deleteScale(scaleId) {
    let scales = loadScales();
    scales = scales.filter((s) => s.id !== scaleId);
    saveScales(scales);
    return scales;
  }

  /**
   * Adiciona uma jornada a uma escala específica.
   * @param {string} scaleId
   * @param {Object} journey
   * @returns {Array<Object>}
   */
  function addJourneyToScale(scaleId, journey) {
    const scales = loadScales();
    const scale = scales.find((s) => s.id === scaleId);
    if (!scale) throw new Error('Escala de destino não encontrada.');

    if (!Array.isArray(scale.journeys)) {
      scale.journeys = [];
    }

    const newJourney = {
      ...journey,
      id: journey.id || 'j-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)
    };

    scale.journeys.push(newJourney);
    saveScales(scales);
    return scales;
  }

  /**
   * Atualiza uma jornada dentro de uma escala.
   * @param {string} scaleId
   * @param {string} journeyId
   * @param {Object} updatedJourney
   * @returns {Array<Object>}
   */
  function updateJourneyInScale(scaleId, journeyId, updatedJourney) {
    const scales = loadScales();
    const scale = scales.find((s) => s.id === scaleId);
    if (!scale) throw new Error('Escala não encontrada.');

    const jIndex = scale.journeys.findIndex((j) => j.id === journeyId);
    if (jIndex !== -1) {
      scale.journeys[jIndex] = {
        ...scale.journeys[jIndex],
        ...updatedJourney,
        id: journeyId
      };
      saveScales(scales);
    }
    return scales;
  }

  /**
   * Remove uma jornada de uma escala.
   * @param {string} scaleId
   * @param {string} journeyId
   * @returns {Array<Object>}
   */
  function deleteJourneyFromScale(scaleId, journeyId) {
    const scales = loadScales();
    const scale = scales.find((s) => s.id === scaleId);
    if (!scale) throw new Error('Escala não encontrada.');

    scale.journeys = (scale.journeys || []).filter((j) => j.id !== journeyId);
    saveScales(scales);
    return scales;
  }

  /**
   * Limpa todos os dados armazenados localmente e redefine para array vazio.
   * @returns {boolean}
   */
  function clearAllData() {
    if (isStorageAvailable()) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return false;
  }

  /**
   * Restaura os dados padrão de demonstração.
   * @returns {Array<Object>}
   */
  function resetToSampleData() {
    const defaults = getDefaultScales();
    saveScales(defaults);
    return defaults;
  }

  /**
   * Exporta os dados como string JSON formatada.
   * @returns {string}
   */
  function exportDataAsJSON() {
    const scales = loadScales();
    return JSON.stringify(
      {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        scales
      },
      null,
      2
    );
  }

  /**
   * Importa dados a partir de uma string JSON com validação básica.
   * @param {string} jsonString
   * @returns {Array<Object>}
   */
  function importDataFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const scales = Array.isArray(parsed) ? parsed : parsed.scales;
      if (!Array.isArray(scales)) {
        throw new Error('O formato do arquivo JSON importado não contém uma lista válida de escalas.');
      }
      saveScales(scales);
      return scales;
    } catch (err) {
      throw new Error(`Erro ao importar dados: ${err.message}`);
    }
  }

  return {
    isStorageAvailable,
    getDefaultScales,
    loadScales,
    saveScales,
    addScale,
    updateScale,
    deleteScale,
    addJourneyToScale,
    updateJourneyInScale,
    deleteJourneyFromScale,
    clearAllData,
    resetToSampleData,
    exportDataAsJSON,
    importDataFromJSON
  };
});
