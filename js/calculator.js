/**
 * Módulo de Cálculo — Simulador de Escalas e Custos de RH
 * Funções puras, centralizadas e desacopladas da interface.
 * Compatível com navegadores modernos (ES6+) e ambientes de teste.
 *
 * Desenvolvedor: Diego Miranda Cezar
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RHCalculator = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Converte string de hora 'HH:MM' em minutos e valida o formato.
   * @param {string} timeStr - Horário no formato HH:MM
   * @returns {{hours: number, minutes: number, totalMinutes: number}}
   */
  function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
      throw new Error('Horário inválido ou não informado.');
    }

    const match = timeStr.trim().match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) {
      throw new Error(`Formato de horário inválido: "${timeStr}". Utilize o formato HH:MM (00:00 a 23:59).`);
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return {
      hours,
      minutes,
      totalMinutes: hours * 60 + minutes
    };
  }

  /**
   * Converte string de data 'YYYY-MM-DD' em componentes seguros de calendário civil
   * evitando divergências de fuso horário causadas pelo parse UTC nativo.
   * @param {string} dateStr - Data no formato YYYY-MM-DD
   * @returns {{year: number, month: number, day: number, dateObj: Date}}
   */
  function parseDateSafe(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') {
      throw new Error('Data inválida ou não informada.');
    }

    const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new Error(`Formato de data inválido: "${dateStr}". Utilize o formato AAAA-MM-DD.`);
    }

    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10); // 1 a 12
    const day = parseInt(match[3], 10);

    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      throw new Error(`Data civil inexistente no calendário: "${dateStr}".`);
    }

    return { year, month, day, dateObj };
  }

  /**
   * Retorna a string da data seguinte no formato YYYY-MM-DD.
   * @param {string} dateStr
   * @returns {string}
   */
  function getNextDateStr(dateStr) {
    const { year, month, day } = parseDateSafe(dateStr);
    const nextDate = new Date(year, month - 1, day + 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nextDay = String(nextDate.getDate()).padStart(2, '0');
    return `${nextYear}-${nextMonth}-${nextDay}`;
  }

  /**
   * Verifica se uma data corresponde a um Domingo.
   * @param {string} dateStr - Formato YYYY-MM-DD
   * @returns {boolean}
   */
  function isSunday(dateStr) {
    const { dateObj } = parseDateSafe(dateStr);
    return dateObj.getDay() === 0;
  }

  /**
   * Retorna o nome amigável do dia da semana em português.
   * @param {string} dateStr
   * @returns {string}
   */
  function getDayOfWeekName(dateStr) {
    const names = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado'
    ];
    const { dateObj } = parseDateSafe(dateStr);
    return names[dateObj.getDay()];
  }

  /**
   * Formata número para moeda corrente (Real - R$).
   * Arredonda valores monetários estritamente na apresentação final.
   * @param {number} value
   * @returns {string}
   */
  function formatCurrency(value) {
    const num = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  /**
   * Formata quantidade de horas com 2 casas decimais e notação legível.
   * @param {number} hoursDecimal
   * @returns {string}
   */
  function formatHours(hoursDecimal) {
    const num = Number(hoursDecimal) || 0;
    return `${num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}h`;
  }

  /**
   * Calcula a duração em horas entre entrada e saída, considerando se atravessa a meia-noite.
   * @param {string} startTime - HH:MM
   * @param {string} endTime - HH:MM
   * @returns {number} Duração em horas decimais
   */
  function calculateJourneyDuration(startTime, endTime) {
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    let diffMinutes;
    if (end.totalMinutes > start.totalMinutes) {
      diffMinutes = end.totalMinutes - start.totalMinutes;
    } else if (end.totalMinutes < start.totalMinutes) {
      // Cruzou a meia-noite
      diffMinutes = (1440 - start.totalMinutes) + end.totalMinutes;
    } else {
      // Mesma hora de entrada e saída: jornada de 24h ou 0h?
      // Por segurança, sem marcação explícita de plantão 24h contínuo, duração idêntica = 0
      diffMinutes = 0;
    }

    return diffMinutes / 60;
  }

  /**
   * Divide uma jornada em tramos de calendário civil caso atravesse a meia-noite.
   * Permite tratar cada dia com sua classificação correta (dia comum, domingo ou feriado).
   *
   * @param {string} dateStr - YYYY-MM-DD
   * @param {string} startTime - HH:MM
   * @param {string} endTime - HH:MM
   * @param {boolean} isHoliday - Feriado no dia 1
   * @param {boolean} isHolidayNextDay - Feriado no dia 2 (opcional)
   * @returns {Array<Object>} Tramos com data, horário, duração e classificação
   */
  function splitJourneyIntoSegments(dateStr, startTime, endTime, isHoliday = false, isHolidayNextDay = false) {
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    if (start.totalMinutes === end.totalMinutes) {
      throw new Error('Horário de entrada e saída não podem ser idênticos (duração nula).');
    }

    const crossesMidnight = end.totalMinutes < start.totalMinutes;

    if (!crossesMidnight) {
      const durationHours = (end.totalMinutes - start.totalMinutes) / 60;
      const sunday = isSunday(dateStr);
      const holiday = Boolean(isHoliday);

      let classification = 'comum';
      if (sunday && holiday) classification = 'domingo_feriado';
      else if (sunday) classification = 'domingo';
      else if (holiday) classification = 'feriado';

      return [
        {
          date: dateStr,
          dayOfWeek: getDayOfWeekName(dateStr),
          startTime,
          endTime,
          durationHours,
          isSunday: sunday,
          isHoliday: holiday,
          classification,
          crossesMidnight: false
        }
      ];
    }

    // Caso atravesse a meia-noite:
    // Tramo 1: data original, das startTime às 24:00
    const duration1 = (1440 - start.totalMinutes) / 60;
    const sunday1 = isSunday(dateStr);
    const holiday1 = Boolean(isHoliday);
    let class1 = 'comum';
    if (sunday1 && holiday1) class1 = 'domingo_feriado';
    else if (sunday1) class1 = 'domingo';
    else if (holiday1) class1 = 'feriado';

    // Tramo 2: dia seguinte, das 00:00 às endTime
    const nextDate = getNextDateStr(dateStr);
    const duration2 = end.totalMinutes / 60;
    const sunday2 = isSunday(nextDate);
    const holiday2 = Boolean(isHolidayNextDay);
    let class2 = 'comum';
    if (sunday2 && holiday2) class2 = 'domingo_feriado';
    else if (sunday2) class2 = 'domingo';
    else if (holiday2) class2 = 'feriado';

    return [
      {
        date: dateStr,
        dayOfWeek: getDayOfWeekName(dateStr),
        startTime,
        endTime: '24:00',
        durationHours: duration1,
        isSunday: sunday1,
        isHoliday: holiday1,
        classification: class1,
        crossesMidnight: true,
        segmentIndex: 1
      },
      {
        date: nextDate,
        dayOfWeek: getDayOfWeekName(nextDate),
        startTime: '00:00',
        endTime,
        durationHours: duration2,
        isSunday: sunday2,
        isHoliday: holiday2,
        classification: class2,
        crossesMidnight: true,
        segmentIndex: 2
      }
    ];
  }

  /**
   * Calcula os custos de uma jornada com base nos parâmetros configurados.
   *
   * Premissas do SPEC:
   * - Dias Comuns: Horas normais até o limite configurado (100%).
   * - Dias Comuns: Horas excedentes ao limite a 150% (adicional 50%).
   * - Domingos e Feriados: Remuneração a 200% (adicional 100%).
   * - Sem cumulação de 50% sobre 100%.
   *
   * @param {Object} journey - Dados da jornada
   * @param {Object} config - Configurações da escala
   * @returns {Object} Detalhamento completo dos cálculos da jornada
   */
  function calculateJourney(journey, config) {
    if (!journey) throw new Error('Dados da jornada não informados.');
    if (!config) throw new Error('Parâmetros de configuração não informados.');

    const hourlyRate = Number(config.hourlyRate);
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      throw new Error('Valor da hora deve ser um número maior que zero.');
    }

    const dailyLimit = Number(config.dailyNormalLimit);
    if (isNaN(dailyLimit) || dailyLimit <= 0) {
      throw new Error('Limite de horas normais diárias deve ser maior que zero.');
    }

    const overtimeMultiplier = Number(config.overtimeMultiplier) || 1.5;
    const sundayHolidayMultiplier = Number(config.sundayHolidayMultiplier) || 2.0;

    const segments = splitJourneyIntoSegments(
      journey.date,
      journey.startTime,
      journey.endTime,
      journey.isHoliday,
      journey.isHolidayNextDay
    );

    let totalDuration = 0;
    let normalHoursTotal = 0;
    let overtimeHoursTotal = 0;
    let sundayHolidayHoursTotal = 0;

    let costNormalTotal = 0;
    let costOvertimeTotal = 0;
    let costSundayHolidayTotal = 0;

    const detailedSegments = segments.map((seg) => {
      totalDuration += seg.durationHours;

      let segNormalHours = 0;
      let segOvertimeHours = 0;
      let segSundayHolidayHours = 0;

      let segCostNormal = 0;
      let segCostOvertime = 0;
      let segCostSundayHoliday = 0;

      const isEligibleForSundayHoliday = seg.isSunday || seg.isHoliday;

      if (isEligibleForSundayHoliday) {
        // Horas em domingos ou feriados são calculadas integralmente a 200%
        segSundayHolidayHours = seg.durationHours;
        segCostSundayHoliday = segSundayHolidayHours * hourlyRate * sundayHolidayMultiplier;
      } else {
        // Dia comum: apura horas normais até o limite e horas extras excedentes
        segNormalHours = Math.min(seg.durationHours, dailyLimit);
        segOvertimeHours = Math.max(0, seg.durationHours - dailyLimit);

        segCostNormal = segNormalHours * hourlyRate;
        segCostOvertime = segOvertimeHours * hourlyRate * overtimeMultiplier;
      }

      const segTotalCost = segCostNormal + segCostOvertime + segCostSundayHoliday;

      normalHoursTotal += segNormalHours;
      overtimeHoursTotal += segOvertimeHours;
      sundayHolidayHoursTotal += segSundayHolidayHours;

      costNormalTotal += segCostNormal;
      costOvertimeTotal += segCostOvertime;
      costSundayHolidayTotal += segCostSundayHoliday;

      return {
        ...seg,
        normalHours: segNormalHours,
        overtimeHours: segOvertimeHours,
        sundayHolidayHours: segSundayHolidayHours,
        costNormal: segCostNormal,
        costOvertime: segCostOvertime,
        costSundayHoliday: segCostSundayHoliday,
        totalCost: segTotalCost
      };
    });

    const totalCost = costNormalTotal + costOvertimeTotal + costSundayHolidayTotal;

    return {
      id: journey.id || null,
      date: journey.date,
      dayOfWeek: getDayOfWeekName(journey.date),
      startTime: journey.startTime,
      endTime: journey.endTime,
      isHoliday: Boolean(journey.isHoliday),
      isHolidayNextDay: Boolean(journey.isHolidayNextDay),
      notes: journey.notes || '',
      hourlyRate,
      dailyLimit,
      totalDuration,
      segments: detailedSegments,
      normalHours: normalHoursTotal,
      overtimeHours: overtimeHoursTotal,
      sundayHolidayHours: sundayHolidayHoursTotal,
      costNormal: costNormalTotal,
      costOvertime: costOvertimeTotal,
      costSundayHoliday: costSundayHolidayTotal,
      totalCost,
      isSplit: detailedSegments.length > 1
    };
  }

  /**
   * Consolida todos os cálculos de uma escala completa.
   * @param {Object} scale - Objeto de escala com jornadas e parâmetros
   * @returns {Object} Escala calculada com totais e lista detalhada de jornadas
   */
  function calculateScale(scale) {
    if (!scale) throw new Error('Escala não informada.');

    const hourlyRate = Number(scale.hourlyRate);
    const dailyLimit = Number(scale.dailyNormalLimit);

    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      throw new Error(`Escala "${scale.name || 'Sem nome'}": Valor da hora deve ser maior que zero.`);
    }

    if (isNaN(dailyLimit) || dailyLimit <= 0) {
      throw new Error(`Escala "${scale.name || 'Sem nome'}": Limite de horas normais deve ser maior que zero.`);
    }

    const journeys = Array.isArray(scale.journeys) ? scale.journeys : [];
    const config = {
      hourlyRate,
      dailyNormalLimit: dailyLimit,
      overtimeMultiplier: scale.overtimeMultiplier || 1.5,
      sundayHolidayMultiplier: scale.sundayHolidayMultiplier || 2.0
    };

    let totalHours = 0;
    let totalNormalHours = 0;
    let totalOvertimeHours = 0;
    let totalSundayHolidayHours = 0;

    let totalCostNormal = 0;
    let totalCostOvertime = 0;
    let totalCostSundayHoliday = 0;

    const calculatedJourneys = journeys.map((j) => {
      const calc = calculateJourney(j, config);
      totalHours += calc.totalDuration;
      totalNormalHours += calc.normalHours;
      totalOvertimeHours += calc.overtimeHours;
      totalSundayHolidayHours += calc.sundayHolidayHours;

      totalCostNormal += calc.costNormal;
      totalCostOvertime += calc.costOvertime;
      totalCostSundayHoliday += calc.costSundayHoliday;

      return calc;
    });

    const totalEstimatedCost = totalCostNormal + totalCostOvertime + totalCostSundayHoliday;

    return {
      id: scale.id,
      name: scale.name || 'Escala Sem Nome',
      employee: scale.employee || '',
      hourlyRate,
      dailyNormalLimit: dailyLimit,
      overtimeMultiplier: config.overtimeMultiplier,
      sundayHolidayMultiplier: config.sundayHolidayMultiplier,
      totalJourneysCount: journeys.length,
      totalHours,
      totalNormalHours,
      totalOvertimeHours,
      totalSundayHolidayHours,
      totalCostNormal,
      totalCostOvertime,
      totalCostSundayHoliday,
      totalEstimatedCost,
      journeys: calculatedJourneys
    };
  }

  /**
   * Compara duas ou mais escalas, ordenando do menor para o maior custo estimado.
   * Calcula as diferenças monetárias e percentuais e sinaliza discrepância de valor-hora.
   *
   * @param {Array<Object>} scales - Lista de escalas cadastradas
   * @returns {{ rankedScales: Array<Object>, hasRateDiscrepancy: boolean, lowestCostScale: Object|null }}
   */
  function compareScales(scales) {
    if (!Array.isArray(scales) || scales.length === 0) {
      return {
        rankedScales: [],
        hasRateDiscrepancy: false,
        lowestCostScale: null
      };
    }

    // Calcula cada escala
    const calculatedScales = scales.map((s) => calculateScale(s));

    // Ordena do menor para o maior custo estimado
    calculatedScales.sort((a, b) => a.totalEstimatedCost - b.totalEstimatedCost);

    const lowestCostScale = calculatedScales[0];
    const lowestCost = lowestCostScale ? lowestCostScale.totalEstimatedCost : 0;

    // Verifica se há variação de taxa horária entre as escalas comparadas
    const firstRate = calculatedScales.length > 0 ? calculatedScales[0].hourlyRate : 0;
    const hasRateDiscrepancy = calculatedScales.some((s) => Math.abs(s.hourlyRate - firstRate) > 0.001);

    const rankedScales = calculatedScales.map((scale, index) => {
      const differenceToLowest = scale.totalEstimatedCost - lowestCost;
      const percentageDifference = lowestCost > 0 ? (differenceToLowest / lowestCost) * 100 : 0;

      return {
        ...scale,
        rank: index + 1,
        isLowestCost: index === 0,
        differenceToLowest,
        percentageDifference
      };
    });

    return {
      rankedScales,
      hasRateDiscrepancy,
      lowestCostScale
    };
  }

  /**
   * Validação de campos obrigatórios de uma Escala.
   * @param {Object} scale
   * @returns {{isValid: boolean, errors: string[]}}
   */
  function validateScale(scale) {
    const errors = [];
    if (!scale) {
      return { isValid: false, errors: ['Escala inválida ou não informada.'] };
    }

    if (!scale.name || scale.name.trim() === '') {
      errors.push('O nome ou identificação da escala é obrigatório.');
    }

    const hourlyRate = Number(scale.hourlyRate);
    if (isNaN(hourlyRate) || hourlyRate <= 0) {
      errors.push('O valor da hora trabalhada deve ser um número maior que zero.');
    }

    const limit = Number(scale.dailyNormalLimit);
    if (isNaN(limit) || limit <= 0 || limit > 24) {
      errors.push('O limite diário de horas normais deve estar entre 0,1 e 24 horas.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validação de campos obrigatórios de uma Jornada.
   * @param {Object} journey
   * @returns {{isValid: boolean, errors: string[]}}
   */
  function validateJourney(journey) {
    const errors = [];
    if (!journey) {
      return { isValid: false, errors: ['Jornada inválida ou não informada.'] };
    }

    try {
      parseDateSafe(journey.date);
    } catch (err) {
      errors.push(err.message);
    }

    try {
      parseTime(journey.startTime);
    } catch (err) {
      errors.push(`Horário de entrada: ${err.message}`);
    }

    try {
      parseTime(journey.endTime);
    } catch (err) {
      errors.push(`Horário de saída: ${err.message}`);
    }

    if (journey.startTime && journey.endTime && journey.startTime === journey.endTime) {
      errors.push('O horário de saída não pode ser igual ao de entrada (duração nula).');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  return {
    parseTime,
    parseDateSafe,
    getNextDateStr,
    isSunday,
    getDayOfWeekName,
    formatCurrency,
    formatHours,
    calculateJourneyDuration,
    splitJourneyIntoSegments,
    calculateJourney,
    calculateScale,
    compareScales,
    validateScale,
    validateJourney
  };
});
