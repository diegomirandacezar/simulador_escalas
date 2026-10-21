/**
 * Serviço de Gerenciamento de Escalas e Calendário
 * Projeto: Simulador de Escalas e Custos de Folha - Malemi
 */

import { store } from '../models/store.js';

/**
 * Valida os parâmetros de uma escala de trabalho.
 * @param {Object} escala 
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export function validateSchedule(escala) {
  const errors = [];

  if (!escala.nome || typeof escala.nome !== 'string' || escala.nome.trim().length === 0) {
    errors.push("O nome da escala é obrigatório.");
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!escala.horarioEntrada || !timeRegex.test(escala.horarioEntrada)) {
    errors.push("O horário de entrada deve estar no formato válido HH:mm (00:00 a 23:59).");
  }

  if (!escala.horarioSaida || !timeRegex.test(escala.horarioSaida)) {
    errors.push("O horário de saída deve estar no formato válido HH:mm (00:00 a 23:59).");
  }

  if (escala.intervaloMinutos === undefined || escala.intervaloMinutos === null || escala.intervaloMinutos < 0) {
    errors.push("O intervalo intrajornada deve ser informado em minutos (não negativo).");
  }

  // Verificação de jornada > 6h sem intervalo mínimo de 60 min (ou acordo)
  const [inHour, inMin] = (escala.horarioEntrada || "00:00").split(':').map(Number);
  const [outHour, outMin] = (escala.horarioSaida || "00:00").split(':').map(Number);

  let grossMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
  if (grossMinutes <= 0) {
    // Atravessa meia-noite
    grossMinutes += 24 * 60;
  }

  const grossHours = grossMinutes / 60;
  if (grossHours > 6 && (escala.intervaloMinutos || 0) < 60) {
    errors.push("Alerta normativo: Jornadas brutas superiores a 6 horas exigem intervalo mínimo de 60 minutos (CLT art. 71), salvo convenção autorizada.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calcula horas noturnas no intervalo das 22h às 05h.
 * @param {string} entrada "HH:mm"
 * @param {string} saida "HH:mm"
 * @returns {number} horas noturnas estimadas
 */
export function calculateNightHours(entrada, saida) {
  const [inH, inM] = entrada.split(':').map(Number);
  const [outH, outM] = saida.split(':').map(Number);

  let inMin = inH * 60 + inM;
  let outMin = outH * 60 + outM;

  if (outMin <= inMin) {
    outMin += 24 * 60;
  }

  // Intervalo noturno: 22h (1320 min) às 05h do dia seguinte (29 * 60 = 1740 min)
  const nightStart = 22 * 60; // 1320
  const nightEnd = 29 * 60;   // 1740 (05h do dia seguinte)

  const overlapStart = Math.max(inMin, nightStart);
  const overlapEnd = Math.min(outMin, nightEnd);

  if (overlapEnd > overlapStart) {
    return Number(((overlapEnd - overlapStart) / 60).toFixed(2));
  }

  return 0;
}

/**
 * Gera o calendário mensal projetado para um ano, mês e escala.
 * @param {Object} params
 * @param {number} params.year - Ex: 2026
 * @param {number} params.month - 1 a 12
 * @param {string} params.escalaId
 * @param {Array} [params.manualAdjustments]
 * @returns {Object} Calendário detalhado dia a dia e sumário
 */
export function generateMonthlyCalendar({ year, month, escalaId, manualAdjustments = [] }) {
  const escala = store.escalas.find(e => e.id === escalaId);
  if (!escala) {
    throw new Error(`Escala com ID '${escalaId}' não encontrada.`);
  }

  const daysInMonth = new Date(year, month, 0).getDate();
  const dias = [];

  let totalPlannedHours = 0;
  let totalWorkDays = 0;
  let totalOffDays = 0;
  let totalNightHours = 0;
  let totalSpecialDays = 0;

  const [inH, inM] = escala.horarioEntrada.split(':').map(Number);
  const [outH, outM] = escala.horarioSaida.split(':').map(Number);
  let dailyGrossMinutes = (outH * 60 + outM) - (inH * 60 + inM);
  if (dailyGrossMinutes <= 0) dailyGrossMinutes += 24 * 60;
  const netDailyHours = Math.max(0, (dailyGrossMinutes - escala.intervaloMinutos) / 60);
  const nightHoursPerWorkday = calculateNightHours(escala.horarioEntrada, escala.horarioSaida);

  const adjustmentsMap = new Map();
  for (const adj of manualAdjustments) {
    if (adj.data) adjustmentsMap.set(adj.data, adj);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Domingo, 6 = Sábado
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    let isWorkDay = false;
    let diaTipo = "FOLGA";

    // Lógica por ciclo de escala
    if (escala.tipoCiclo === "SEMANAL") {
      if (escala.diasTrabalho === 5) {
        // 5x2 padrão: segunda (1) a sexta (5) trabalha
        isWorkDay = dayOfWeek >= 1 && dayOfWeek <= 5;
        diaTipo = isWorkDay ? "TRABALHO" : (dayOfWeek === 0 ? "DSR" : "FOLGA");
      } else if (escala.diasTrabalho === 6) {
        // 6x1 padrão: segunda (1) a sábado (6) trabalha, domingo DSR
        isWorkDay = dayOfWeek !== 0;
        diaTipo = isWorkDay ? "TRABALHO" : "DSR";
      }
    } else if (escala.tipoCiclo === "CICLICO_DIAS") {
      // 12x36: dias alternados
      isWorkDay = day % 2 !== 0;
      diaTipo = isWorkDay ? "TRABALHO" : (dayOfWeek === 0 ? "DSR" : "FOLGA");
    }

    let hoursThisDay = isWorkDay ? Number(netDailyHours.toFixed(2)) : 0;
    let nightHoursThisDay = isWorkDay ? nightHoursPerWorkday : 0;
    let isManual = false;
    let note = "";

    // Aplicação de ajuste manual do usuário se existir
    if (adjustmentsMap.has(dateStr)) {
      const adj = adjustmentsMap.get(dateStr);
      isManual = true;
      diaTipo = adj.tipoDia || diaTipo;
      if (diaTipo === "TRABALHO") {
        isWorkDay = true;
        hoursThisDay = adj.horasTrabalhadas !== undefined ? Number(adj.horasTrabalhadas) : netDailyHours;
      } else {
        isWorkDay = false;
        hoursThisDay = 0;
        nightHoursThisDay = 0;
      }
      note = adj.observacao || "Ajuste manual aplicado pelo usuário";
    }

    if (diaTipo === "FERIADO" || diaTipo === "ELEICAO") {
      totalSpecialDays++;
    }

    if (isWorkDay) {
      totalWorkDays++;
      totalPlannedHours += hoursThisDay;
      totalNightHours += nightHoursThisDay;
    } else {
      totalOffDays++;
    }

    dias.push({
      data: dateStr,
      diaDoMes: day,
      diaDaSemanaNumero: dayOfWeek,
      diaDaSemanaNome: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][dayOfWeek],
      tipoDia: diaTipo,
      horasPlanejadas: hoursThisDay,
      horasNoturnas: nightHoursThisDay,
      ajusteManual: isManual,
      observacao: note
    });
  }

  return {
    ano: year,
    mes: month,
    escalaId: escala.id,
    escalaNome: escala.nome,
    diasNoMes: daysInMonth,
    resumo: {
      totalDiasTrabalho: totalWorkDays,
      totalDiasFolga: totalOffDays,
      totalHorasPlanejadas: Number(totalPlannedHours.toFixed(2)),
      totalHorasNoturnas: Number(totalNightHours.toFixed(2)),
      totalDiasEspeciais: totalSpecialDays
    },
    dias
  };
}
