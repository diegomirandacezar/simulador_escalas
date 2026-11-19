/**
 * Módulo de Armazenamento Local — Simulador de Escalas e Custos de RH
 * Gerenciamento seguro no localStorage do navegador, com catálogo de 33 escalas
 * únicas deduplicadas (simuladas em mês-padrão de 30 dias e gravadas em ordem
 * de ranking do menor para o maior custo estimado), importação/exportação e
 * inclusão em lote de semanas de jornadas.
 *
 * Desenvolvedor: Diego Miranda Cezar
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./calculator.js'));
  } else {
    root.RHStorage = factory(root.RHCalculator || null);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (calculatorRef) {
  'use strict';

  const STORAGE_KEY = 'simulador_escalas_dados_v2';
  const REFERENCE_YEAR = 2026;
  const REFERENCE_MONTH = 6; // Junho/2026: 30 dias (01/06 Seg a 30/06 Ter — 22 Seg-Sex, 4 Sáb, 4 Dom)
  const REFERENCE_DAYS = 30;
  const DEFAULT_HOURLY_RATE = 20.0;

  /**
   * Obtém referência ao RHCalculator no navegador ou Node.
   */
  function getCalculator() {
    if (calculatorRef) return calculatorRef;
    if (typeof window !== 'undefined' && window.RHCalculator) return window.RHCalculator;
    return null;
  }

  /**
   * Ordena a lista de escalas em ordem crescente de custo estimado (ranking).
   * Preserva integralmente os dados originais de cada escala.
   * @param {Array<Object>} scales
   * @returns {Array<Object>}
   */
  function sortScalesByRanking(scales) {
    if (!Array.isArray(scales) || scales.length <= 1) {
      return Array.isArray(scales) ? scales : [];
    }

    const calc = getCalculator();
    if (!calc || typeof calc.compareScales !== 'function') {
      return scales;
    }

    try {
      const { rankedScales } = calc.compareScales(scales);
      const mapById = new Map(scales.map((s) => [s.id, s]));
      return rankedScales.map((ranked) => mapById.get(ranked.id)).filter(Boolean);
    } catch (err) {
      console.warn('Não foi possível ordenar escalas por ranking:', err);
      return scales;
    }
  }

  /**
   * Formata data de referência do mês simulado (YYYY-MM-DD).
   */
  function formatRefDate(day) {
    return `${REFERENCE_YEAR}-${String(REFERENCE_MONTH).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  /**
   * Retorna o dia da semana (0=Dom, 1=Seg, ..., 6=Sáb) para um dia do mês de referência.
   */
  function getRefDayOfWeek(day) {
    return new Date(REFERENCE_YEAR, REFERENCE_MONTH - 1, day).getDay();
  }

  /**
   * Gera as jornadas de 30 dias (Junho/2026) a partir de um perfil de escala.
   * @param {Object} profile
   * @returns {Array<Object>}
   */
  function buildMonthlyJourneys(profile) {
    const journeys = [];

    for (let day = 1; day <= REFERENCE_DAYS; day++) {
      const dow = getRefDayOfWeek(day); // 0=Dom, 1=Seg, ..., 6=Sáb
      const dateStr = formatRefDate(day);
      const dayIndex = day - 1; // 0..29
      let shift = null;

      switch (profile.pattern) {
        case '5x2': {
          if (dow >= 1 && dow <= 5) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: profile.note || 'Jornada fixa 5x2 (Seg a Sex)'
            };
          }
          break;
        }
        case '5x2_sex_curta': {
          // Seg-Qui horário estendido, Sex horário reduzido (ex.: 220h compensado)
          if (dow >= 1 && dow <= 4) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: 'Seg a Qui (compensação semanal 220h)'
            };
          } else if (dow === 5) {
            shift = {
              startTime: profile.fridayStartTime,
              endTime: profile.fridayEndTime,
              breakHours: profile.breakHours || 0,
              notes: 'Sexta-feira (saída reduzida)'
            };
          }
          break;
        }
        case '6x1': {
          // Seg a Sáb com folga fixa no Domingo
          if (dow >= 1 && dow <= 6) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: profile.note || 'Jornada 6x1 (Seg a Sáb)'
            };
          }
          break;
        }
        case '6x1_sab_diferente': {
          // Seg a Sex um horário, Sáb outro horário (folga no Domingo)
          if (dow >= 1 && dow <= 5) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: 'Seg a Sex (escala 6x1)'
            };
          } else if (dow === 6) {
            shift = {
              startTime: profile.satStartTime,
              endTime: profile.satEndTime,
              breakHours: profile.satBreakHours !== undefined ? profile.satBreakHours : profile.breakHours || 0,
              notes: 'Sábado (horário específico 6x1)'
            };
          }
          break;
        }
        case '6x1_revez_continuo': {
          // Ciclo contínuo 6 dias trabalho / 1 dia folga móvel (inclui domingos no rodízio)
          if (dayIndex % 7 !== 2) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: 'Revezamento contínuo 6x1 (folga móvel)'
            };
          }
          break;
        }
        case '6x2': {
          // Ciclo 6 dias trabalho / 2 dias folga (inclui domingos)
          if (dayIndex % 8 < 6) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: 'Revezamento 6x2 (6 trabalho / 2 folga)'
            };
          }
          break;
        }
        case '5x8_revez': {
          // Revezamento 5x8 contínuo: 5 trabalho / 2 folga com deslocamento (inclui domingos)
          // Inicia no dia 3 (Qua) para cobrir sábados e domingos no ciclo de revezamento
          if ((dayIndex + 5) % 7 < 5) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: 'Revezamento oficial 5x8 (turno contínuo)'
            };
          }
          break;
        }
        case '3x2x2': {
          // Ciclo 3 trabalho / 2 folga / 2 trabalho / 2 folga (período 9 dias — inclui domingos)
          const pos = dayIndex % 9;
          if (pos < 3 || (pos >= 5 && pos < 7)) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: 'Revezamento 3x2x2 (turno contínuo)'
            };
          }
          break;
        }
        case '12x36': {
          // Dia sim, dia não (15 plantões em 30 dias — inclui domingos)
          if (dayIndex % 2 === 0) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: profile.note || 'Plantão 12x36'
            };
          }
          break;
        }
        case '4x4': {
          // 4 dias trabalho / 4 dias folga (16 dias em 30 dias — inclui domingos)
          if (dayIndex % 8 < 4) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: profile.note || 'Escala 4x4 (4 trabalho / 4 folga)'
            };
          }
          break;
        }
        case '2x2': {
          // 2 dias trabalho / 2 dias folga (16 plantões em 30 dias — inclui domingos)
          if (dayIndex % 4 < 2) {
            shift = {
              startTime: profile.startTime,
              endTime: profile.endTime,
              breakHours: profile.breakHours || 0,
              notes: profile.note || 'Escala 2x2 (2 trabalho / 2 folga)'
            };
          }
          break;
        }
        case 'revez_2_turmas': {
          // Alternância semanal de 2 turmas (6x1 com rodízio de folga)
          const weekNum = Math.floor(dayIndex / 7);
          const isTurn1 = weekNum % 2 === 0;
          if (dayIndex % 7 !== 3) {
            shift = {
              startTime: isTurn1 ? profile.startTime : profile.altStartTime,
              endTime: isTurn1 ? profile.endTime : profile.altEndTime,
              breakHours: profile.breakHours || 0,
              notes: isTurn1 ? 'Revezamento 2 Turmas — 1º Turno' : 'Revezamento 2 Turmas — 2º Turno'
            };
          }
          break;
        }
        default:
          break;
      }

      if (shift) {
        journeys.push({
          id: `j-${profile.code}-${String(day).padStart(2, '0')}`,
          employee: profile.employee,
          date: dateStr,
          startTime: shift.startTime,
          endTime: shift.endTime,
          breakHours: shift.breakHours,
          isHoliday: false,
          isHolidayNextDay: false,
          notes: shift.notes
        });
      }
    }

    return journeys;
  }

  /**
   * Catálogo oficial das 33 escalas únicas deduplicadas (por CODHORARIO, usando
   * a jornada mensal predominante de cada código e descartando repetições e
   * inconsistências cadastrais como 1h no código 0113).
   */
  const CATALOG_PROFILES = [
    {
      code: '0034',
      monthlyHours: 210,
      name: 'BA ADM 07:45 ÀS 16:45',
      employee: 'BA • Administrativo 5x2',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '07:45',
      endTime: '16:45',
      breakHours: 0.6, // 36min intervalo -> 8h24/dia (42h/sem = 210h/mês)
      note: 'BA ADM 07:45 às 16:45 (8,4h efetivas)'
    },
    {
      code: '0113',
      monthlyHours: 200,
      name: 'ADM 08:00 ÀS 17:00',
      employee: 'Corporativo • ADM 5x2',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '08:00',
      endTime: '17:00',
      breakHours: 1.0,
      note: 'ADM 08:00 às 17:00 (1h intervalo)'
    },
    {
      code: '0125',
      monthlyHours: 210,
      name: 'SP FIX 5X2 07:00 ÀS 16:24',
      employee: 'SP • Fixo 5x2',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '07:00',
      endTime: '16:24',
      breakHours: 1.0, // 8h24 efetivas = 42h/sem = 210h/mês
      note: 'SP Fixo 5x2 07:00 às 16:24 (1h intervalo)'
    },
    {
      code: '0127',
      monthlyHours: 210,
      name: 'SP FIX 5X2 05:00 ÀS 14:16',
      employee: 'SP • Fixo 5x2',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '05:00',
      endTime: '14:16',
      breakHours: 1.0,
      note: 'SP Fixo 5x2 05:00 às 14:16 (1h intervalo)'
    },
    {
      code: '0129',
      monthlyHours: 210,
      name: 'SP FIX 5X2 14:00 ÀS 23:14',
      employee: 'SP • Fixo 5x2',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '14:00',
      endTime: '23:14',
      breakHours: 1.0,
      note: 'SP Fixo 5x2 14:00 às 23:14 (1h intervalo)'
    },
    {
      code: '0131',
      monthlyHours: 210,
      name: '22:00 00:00 01:00 05:21',
      employee: 'SP • Noturno 5x2',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '22:00',
      endTime: '05:21',
      breakHours: 1.0, // Intervalo 00:00 às 01:00
      note: 'Turno Noturno 22:00 às 05:21 (intervalo 00:00-01:00)'
    },
    {
      code: '0152',
      monthlyHours: 120,
      name: 'SP 4H 13:15 ÀS 17:15',
      employee: 'SP • Parcial 4h',
      dailyNormalLimit: 8.0,
      pattern: '6x1',
      startTime: '13:15',
      endTime: '17:15',
      breakHours: 0, // 4h/dia x 6 dias = 24h/sem = 120h/mês
      note: 'Jornada parcial 4h (13:15 às 17:15)'
    },
    {
      code: '0173',
      monthlyHours: 200,
      name: 'SP 8H 07:00 16:00',
      employee: 'SP • Fixo 8h (5x2)',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '07:00',
      endTime: '16:00',
      breakHours: 1.0,
      note: 'SP 8h 07:00 às 16:00 (1h intervalo)'
    },
    {
      code: '0199',
      monthlyHours: 180,
      name: 'SP 6H 08:00 ÀS 15:00',
      employee: 'SP • Jornada 6h',
      dailyNormalLimit: 8.0,
      pattern: '6x1',
      startTime: '08:00',
      endTime: '15:00',
      breakHours: 1.0, // 6h/dia x 6 dias = 36h/sem = 180h/mês
      note: 'SP 6h 08:00 às 15:00 (1h intervalo)'
    },
    {
      code: '0202',
      monthlyHours: 220,
      name: 'ES FIX 220 07:00 ÀS 17:00 / 16:00',
      employee: 'ES • Fixo 220h (5x2)',
      dailyNormalLimit: 8.0,
      pattern: '5x2_sex_curta',
      startTime: '07:00',
      endTime: '17:00',
      fridayStartTime: '07:00',
      fridayEndTime: '16:00',
      breakHours: 1.0
    },
    {
      code: '0221',
      monthlyHours: 200,
      name: 'SP 8H 09:00 13:00 14:00 18:00',
      employee: 'SP • Fixo 8h (5x2)',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '09:00',
      endTime: '18:00',
      breakHours: 1.0, // Intervalo explícito 13:00 às 14:00
      note: 'SP 8h 09:00 às 18:00 (intervalo 13:00-14:00)'
    },
    {
      code: '0223',
      monthlyHours: 220,
      name: 'SP ESCALA 6X1 PRIMEIRO TURNO',
      employee: 'SP • 6x1 1º Turno',
      dailyNormalLimit: 8.0,
      pattern: '6x1',
      startTime: '06:00',
      endTime: '14:20',
      breakHours: 1.0, // 7h20/dia x 6 dias = 44h/sem = 220h/mês
      note: '1º Turno 6x1 (06:00 às 14:20, 1h intervalo)'
    },
    {
      code: '0224',
      monthlyHours: 220,
      name: 'SP ESCALA 6X1 SEGUNDO TURNO',
      employee: 'SP • 6x1 2º Turno',
      dailyNormalLimit: 8.0,
      pattern: '6x1',
      startTime: '14:00',
      endTime: '22:20',
      breakHours: 1.0, // 7h20/dia x 6 dias = 44h/sem = 220h/mês
      note: '2º Turno 6x1 (14:00 às 22:20, 1h intervalo)'
    },
    {
      code: '0225',
      monthlyHours: 170,
      name: 'SP ESCALA 6X1 TERCEIRO TURNO',
      employee: 'SP • 6x1 3º Turno Noturno',
      dailyNormalLimit: 8.0,
      pattern: '6x1',
      startTime: '22:00',
      endTime: '05:00',
      breakHours: 1.0, // 6h relógio (~6h51 reduzidas) x 6 dias; Sáb->Dom pega horas de Domingo
      note: '3º Turno Noturno 6x1 (22:00 às 05:00, 1h intervalo)'
    },
    {
      code: '0229',
      monthlyHours: 210,
      name: 'ES REVEZ 2 TURMAS',
      employee: 'ES • Revezamento 2 Turmas',
      dailyNormalLimit: 8.0,
      pattern: 'revez_2_turmas',
      startTime: '06:00',
      endTime: '14:00',
      altStartTime: '14:00',
      altEndTime: '22:00',
      breakHours: 1.0 // 7h/dia x 6 dias = 42h/sem = 210h/mês com rodízio de domingo
    },
    {
      code: '0231',
      monthlyHours: 180,
      name: 'BAHIA ESCALA 3 X 2 X 2',
      employee: 'BA • Revezamento 3x2x2',
      dailyNormalLimit: 8.0,
      pattern: '3x2x2',
      startTime: '07:00',
      endTime: '16:00',
      breakHours: 1.0 // 8h/dia em ciclo 3x2x2 com domingos no rodízio
    },
    {
      code: '0232',
      monthlyHours: 180,
      name: 'LAMINAÇÃO',
      employee: 'BA • Operação Laminação',
      dailyNormalLimit: 8.0,
      pattern: '6x1_revez_continuo',
      startTime: '06:00',
      endTime: '13:00',
      breakHours: 1.0 // 6h/dia em revezamento contínuo 180h (inclui domingos)
    },
    {
      code: '0238',
      monthlyHours: 200,
      name: 'SP ESCALA 6X1 SUPERVISORES',
      employee: 'SP • Supervisores 6x1',
      dailyNormalLimit: 8.0,
      pattern: '6x1',
      startTime: '08:00',
      endTime: '15:40',
      breakHours: 1.0, // 6h40/dia x 6 dias = 40h/sem = 200h/mês
      note: 'Supervisores 6x1 (08:00 às 15:40, 1h intervalo)'
    },
    {
      code: '0239',
      monthlyHours: 200,
      name: 'SP ADM 07:00 as 16:00',
      employee: 'SP • Administrativo 5x2',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '07:00',
      endTime: '16:00',
      breakHours: 1.0,
      note: 'SP ADM 07:00 às 16:00 (1h intervalo)'
    },
    {
      code: '0240',
      monthlyHours: 200,
      name: 'SP ADM 09:00 as 18:00',
      employee: 'SP • Administrativo 5x2',
      dailyNormalLimit: 8.0,
      pattern: '5x2',
      startTime: '09:00',
      endTime: '18:00',
      breakHours: 1.0,
      note: 'SP ADM 09:00 às 18:00 (1h intervalo)'
    },
    {
      code: '0244',
      monthlyHours: 220,
      name: 'SP ESCALA 6X1 PRIMEIRO TURNO ( 08:00 - 17:00 )',
      employee: 'SP • 6x1 1º Turno',
      dailyNormalLimit: 8.0,
      pattern: '6x1_sab_diferente',
      startTime: '08:00',
      endTime: '17:00',
      satStartTime: '08:00',
      satEndTime: '12:00',
      breakHours: 1.0,
      satBreakHours: 0
    },
    {
      code: '0246',
      monthlyHours: 220,
      name: 'SP ESCALA 6X1 ADM ESPECIAL ( 08:00 as 17:00 - 05:00 as 14:00)',
      employee: 'SP • 6x1 ADM Especial',
      dailyNormalLimit: 8.0,
      pattern: '6x1_sab_diferente',
      startTime: '08:00',
      endTime: '17:00',
      satStartTime: '05:00',
      satEndTime: '14:00',
      breakHours: 1.0,
      satBreakHours: 1.0
    },
    {
      code: '0250',
      monthlyHours: 180,
      name: 'BA REVEZAMENTO OFICIAL 5x8',
      employee: 'BA • Revezamento 5x8',
      dailyNormalLimit: 8.0,
      pattern: '5x8_revez',
      startTime: '07:00',
      endTime: '16:00',
      breakHours: 1.0
    },
    {
      code: '0254',
      monthlyHours: 220,
      name: '6X1 (11:00 AS 20:00)',
      employee: 'SP • Escala 6x1',
      dailyNormalLimit: 8.0,
      pattern: '6x1_sab_diferente',
      startTime: '11:00',
      endTime: '20:00',
      satStartTime: '11:00',
      satEndTime: '15:00',
      breakHours: 1.0,
      satBreakHours: 0
    },
    {
      code: '0255',
      monthlyHours: 220,
      name: '6X1 (11:00 AS 20:00 - 08:00 AS 17:00)',
      employee: 'SP • Escala 6x1',
      dailyNormalLimit: 8.0,
      pattern: '6x1_sab_diferente',
      startTime: '11:00',
      endTime: '20:00',
      satStartTime: '08:00',
      satEndTime: '17:00',
      breakHours: 1.0,
      satBreakHours: 1.0
    },
    {
      code: '0282',
      monthlyHours: 220,
      name: 'SP ESCALA 6X1 (07:00 as 16:00 - 06:00 as 15:00)',
      employee: 'SP • Escala 6x1',
      dailyNormalLimit: 8.0,
      pattern: '6x1_sab_diferente',
      startTime: '07:00',
      endTime: '16:00',
      satStartTime: '06:00',
      satEndTime: '15:00',
      breakHours: 1.0,
      satBreakHours: 1.0
    },
    {
      code: '0286',
      monthlyHours: 220,
      name: 'ES HORARIO ELETRICISTAS 4X4',
      employee: 'ES • Eletricistas 4x4',
      dailyNormalLimit: 12.0,
      pattern: '4x4',
      startTime: '07:00',
      endTime: '19:00',
      breakHours: 0, // 12h plantão x 16 dias = 192h (com domingos no ciclo)
      note: 'Plantão Eletricistas 4x4 (07:00 às 19:00)'
    },
    {
      code: '0303',
      monthlyHours: 180,
      name: 'SP - REVEZAMENTO 12 X 36 - 06:00 as 18:00',
      employee: 'SP • Plantão 12x36 Diurno',
      dailyNormalLimit: 12.0,
      pattern: '12x36',
      startTime: '06:00',
      endTime: '18:00',
      breakHours: 1.0, // 11h efetivas x 15 plantões = 165h (inclui domingos)
      note: 'Plantão 12x36 Diurno (06:00 às 18:00, 1h intervalo)'
    },
    {
      code: '0304',
      monthlyHours: 180,
      name: 'SP - REVEZAMENTO 12 X 36 - 18:00 as 06:00',
      employee: 'SP • Plantão 12x36 Noturno',
      dailyNormalLimit: 12.0,
      pattern: '12x36',
      startTime: '18:00',
      endTime: '06:00',
      breakHours: 1.0, // 11h efetivas x 15 plantões (atravessa meia-noite)
      note: 'Plantão 12x36 Noturno (18:00 às 06:00, 1h intervalo)'
    },
    {
      code: '0319',
      monthlyHours: 220,
      name: 'SP ESCALA 6X1 ( 06:00 as 15:00 - 05:00 as 14:00)',
      employee: 'SP • Escala 6x1',
      dailyNormalLimit: 8.0,
      pattern: '6x1_sab_diferente',
      startTime: '06:00',
      endTime: '15:00',
      satStartTime: '05:00',
      satEndTime: '14:00',
      breakHours: 1.0,
      satBreakHours: 1.0
    },
    {
      code: '0326',
      monthlyHours: 210,
      name: 'ENFERMAGEM 2X2 (18:00 AS 06:00)',
      employee: 'SP • Enfermagem 2x2 Noturno',
      dailyNormalLimit: 12.0,
      pattern: '2x2',
      startTime: '18:00',
      endTime: '06:00',
      breakHours: 1.0, // 11h efetivas x 16 plantões (atravessa meia-noite)
      note: 'Plantão Enfermagem 2x2 (18:00 às 06:00, 1h intervalo)'
    },
    {
      code: '0327',
      monthlyHours: 180,
      name: '4X4 BAHIA',
      employee: 'BA • Revezamento 4x4',
      dailyNormalLimit: 12.0,
      pattern: '4x4',
      startTime: '07:00',
      endTime: '19:00',
      breakHours: 1.0, // 11h efetivas x 16 dias = 176h (inclui domingos)
      note: 'Revezamento 4x4 Bahia (07:00 às 19:00, 1h intervalo)'
    },
    {
      code: '6001',
      monthlyHours: 180,
      name: 'SP REVEZ 6X2',
      employee: 'SP • Revezamento 6x2',
      dailyNormalLimit: 8.0,
      pattern: '6x2',
      startTime: '06:00',
      endTime: '14:30',
      breakHours: 1.0 // 7,5h efetivas x 24 dias = 180h (inclui domingos)
    }
  ];

  /**
   * Gera as 33 escalas únicas simuladas e já ordenadas do menor para o maior custo (ranking).
   * @returns {Array<Object>}
   */
  function getDefaultScales() {
    const scales = CATALOG_PROFILES.map((profile) => ({
      id: `escala-${profile.code}`,
      code: profile.code,
      name: profile.name,
      employee: profile.employee,
      monthlyHours: profile.monthlyHours,
      hourlyRate: DEFAULT_HOURLY_RATE,
      dailyNormalLimit: profile.dailyNormalLimit,
      overtimeMultiplier: 1.5,
      sundayHolidayMultiplier: 2.0,
      paySundayExtra: true,
      payHolidayExtra: true,
      journeys: buildMonthlyJourneys(profile)
    }));

    return sortScalesByRanking(scales);
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
   * Carrega a lista de escalas salvas no localStorage (sempre ordenadas por ranking).
   * Se não houver dados, inicializa com as 33 escalas simuladas e ordenadas.
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
        return sortScalesByRanking(parsed);
      }
      return getDefaultScales();
    } catch (err) {
      console.warn('Erro ao carregar dados do localStorage:', err);
      return getDefaultScales();
    }
  }

  /**
   * Salva a lista de escalas no localStorage mantendo a ordenação por ranking (mais barato primeiro).
   * @param {Array<Object>} scales
   * @returns {boolean}
   */
  function saveScales(scales) {
    const ordered = sortScalesByRanking(scales);
    if (!isStorageAvailable()) {
      return false;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ordered));
      return true;
    } catch (err) {
      console.error('Falha ao gravar no localStorage:', err);
      return false;
    }
  }

  /**
   * Adiciona uma nova escala e persiste em ordem de ranking.
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
    const ordered = sortScalesByRanking(scales);
    saveScales(ordered);
    return ordered;
  }

  /**
   * Atualiza uma escala existente e persiste em ordem de ranking.
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
      const ordered = sortScalesByRanking(scales);
      saveScales(ordered);
      return ordered;
    }
    return scales;
  }

  /**
   * Atualiza o valor da hora trabalhada em todas as escalas cadastradas
   * e persiste o conjunto reordenado por ranking.
   * @param {number} newHourlyRate
   * @returns {Array<Object>}
   */
  function updateAllHourlyRates(newHourlyRate) {
    const rate = Number(newHourlyRate);
    if (isNaN(rate) || rate <= 0) {
      throw new Error('O valor da hora deve ser um número maior que zero.');
    }

    const scales = loadScales();
    const updated = scales.map((scale) => ({
      ...scale,
      hourlyRate: rate
    }));

    const ordered = sortScalesByRanking(updated);
    saveScales(ordered);
    return ordered;
  }

  /**
   * Atualiza parâmetros globais (valor-hora e/ou regra de adicional em domingos e feriados)
   * em todas as escalas cadastradas e persiste o conjunto reordenado por ranking.
   * @param {{ hourlyRate?: number, paySundayExtra?: boolean, payHolidayExtra?: boolean }} settings
   * @returns {Array<Object>}
   */
  function updateAllGlobalSettings(settings) {
    if (!settings || typeof settings !== 'object') {
      throw new Error('Parâmetros globais inválidos.');
    }

    const patch = {};
    if (settings.hourlyRate !== undefined && settings.hourlyRate !== null && settings.hourlyRate !== '') {
      const rate = Number(settings.hourlyRate);
      if (isNaN(rate) || rate <= 0) {
        throw new Error('O valor da hora deve ser um número maior que zero.');
      }
      patch.hourlyRate = rate;
    }

    if (typeof settings.paySundayExtra === 'boolean') {
      patch.paySundayExtra = settings.paySundayExtra;
    }

    if (typeof settings.payHolidayExtra === 'boolean') {
      patch.payHolidayExtra = settings.payHolidayExtra;
    }

    const scales = loadScales();
    const updated = scales.map((scale) => ({
      ...scale,
      ...patch
    }));

    const ordered = sortScalesByRanking(updated);
    saveScales(ordered);
    return ordered;
  }

  /**
   * Exclui uma escala e persiste em ordem de ranking.
   * @param {string} scaleId
   * @returns {Array<Object>}
   */
  function deleteScale(scaleId) {
    let scales = loadScales();
    scales = scales.filter((s) => s.id !== scaleId);
    const ordered = sortScalesByRanking(scales);
    saveScales(ordered);
    return ordered;
  }

  /**
   * Adiciona uma jornada a uma escala específica e reordena o ranking gravado.
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
      id: journey.id || 'j-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      employee: journey.employee || scale.employee || ''
    };

    scale.journeys.push(newJourney);
    const ordered = sortScalesByRanking(scales);
    saveScales(ordered);
    return ordered;
  }

  /**
   * Adiciona múltiplas jornadas de uma só vez a uma escala e reordena o ranking gravado.
   * @param {string} scaleId
   * @param {Array<Object>} journeysList
   * @returns {Array<Object>}
   */
  function addMultipleJourneysToScale(scaleId, journeysList) {
    const scales = loadScales();
    const scale = scales.find((s) => s.id === scaleId);
    if (!scale) throw new Error('Escala de destino não encontrada.');

    if (!Array.isArray(scale.journeys)) {
      scale.journeys = [];
    }

    journeysList.forEach((j) => {
      scale.journeys.push({
        ...j,
        id: j.id || 'j-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        employee: j.employee || scale.employee || ''
      });
    });

    const ordered = sortScalesByRanking(scales);
    saveScales(ordered);
    return ordered;
  }

  /**
   * Atualiza uma jornada dentro de uma escala e reordena o ranking gravado.
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
      const ordered = sortScalesByRanking(scales);
      saveScales(ordered);
      return ordered;
    }
    return scales;
  }

  /**
   * Remove uma jornada de uma escala e reordena o ranking gravado.
   * @param {string} scaleId
   * @param {string} journeyId
   * @returns {Array<Object>}
   */
  function deleteJourneyFromScale(scaleId, journeyId) {
    const scales = loadScales();
    const scale = scales.find((s) => s.id === scaleId);
    if (!scale) throw new Error('Escala não encontrada.');

    scale.journeys = (scale.journeys || []).filter((j) => j.id !== journeyId);
    const ordered = sortScalesByRanking(scales);
    saveScales(ordered);
    return ordered;
  }

  /**
   * Limpa todos os dados armazenados localmente e redefine para array vazio.
   * @returns {boolean}
   */
  function clearAllData() {
    if (isStorageAvailable()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        return true;
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    return false;
  }

  /**
   * Restaura as 33 escalas simuladas e ordenadas por ranking.
   * @returns {Array<Object>}
   */
  function resetToSampleData() {
    const defaults = getDefaultScales();
    saveScales(defaults);
    return defaults;
  }

  /**
   * Exporta os dados como string JSON formatada (em ordem de ranking).
   * @returns {string}
   */
  function exportDataAsJSON() {
    const scales = loadScales();
    return JSON.stringify(
      {
        version: '2.0',
        generatedAt: new Date().toISOString(),
        orderedBy: 'lowest_estimated_cost_asc',
        scales
      },
      null,
      2
    );
  }

  /**
   * Importa dados a partir de uma string JSON com validação básica e ordenação por ranking.
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
      const ordered = sortScalesByRanking(scales);
      saveScales(ordered);
      return ordered;
    } catch (err) {
      throw new Error(`Erro ao importar dados: ${err.message}`);
    }
  }

  return {
    isStorageAvailable,
    sortScalesByRanking,
    getDefaultScales,
    loadScales,
    saveScales,
    addScale,
    updateScale,
    updateAllHourlyRates,
    updateAllGlobalSettings,
    deleteScale,
    addJourneyToScale,
    addMultipleJourneysToScale,
    updateJourneyInScale,
    deleteJourneyFromScale,
    clearAllData,
    resetToSampleData,
    exportDataAsJSON,
    importDataFromJSON
  };
});
