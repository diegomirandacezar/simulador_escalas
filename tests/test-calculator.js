/**
 * Bateria de Testes Automatizados — Validação Matemática do RHCalculator
 * Executa os 13 cenários obrigatórios da Seção 18 do SPEC.md
 */

const assert = require('assert');
const RHCalculator = require('../js/calculator.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`✅ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`❌ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('--- INICIANDO VALIDAÇÃO MATEMÁTICA E FUNCIONAL DOS CÁLCULOS ---\n');

// 1. Jornada comum inferior ao limite normal (6h trabalhadas com limite de 8h, R$ 20/h)
runTest('Cenário 1: Jornada comum inferior ao limite normal (6h com limite de 8h)', () => {
  const journey = {
    date: '2026-10-21', // Quarta-feira
    startTime: '08:00',
    endTime: '14:00',
    isHoliday: false
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.totalDuration, 6);
  assert.strictEqual(res.normalHours, 6);
  assert.strictEqual(res.overtimeHours, 0);
  assert.strictEqual(res.sundayHolidayHours, 0);
  assert.strictEqual(res.costNormal, 120);
  assert.strictEqual(res.costOvertime, 0);
  assert.strictEqual(res.costSundayHoliday, 0);
  assert.strictEqual(res.totalCost, 120);
});

// 2. Jornada comum exatamente no limite normal (8h com limite de 8h, R$ 20/h)
runTest('Cenário 2: Jornada comum exatamente no limite normal (8h com limite de 8h)', () => {
  const journey = {
    date: '2026-10-21', // Quarta-feira
    startTime: '08:00',
    endTime: '16:00',
    isHoliday: false
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.totalDuration, 8);
  assert.strictEqual(res.normalHours, 8);
  assert.strictEqual(res.overtimeHours, 0);
  assert.strictEqual(res.sundayHolidayHours, 0);
  assert.strictEqual(res.costNormal, 160);
  assert.strictEqual(res.costOvertime, 0);
  assert.strictEqual(res.totalCost, 160);
});

// 3. Jornada comum acima do limite normal (10h com limite de 8h, R$ 20/h - Exemplo SPEC 8.5)
runTest('Cenário 3: Jornada comum acima do limite normal (10h com limite de 8h — Exemplo SPEC 8.5)', () => {
  const journey = {
    date: '2026-10-21', // Quarta-feira
    startTime: '08:00',
    endTime: '18:00',
    isHoliday: false
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.totalDuration, 10);
  assert.strictEqual(res.normalHours, 8);
  assert.strictEqual(res.overtimeHours, 2);
  assert.strictEqual(res.sundayHolidayHours, 0);
  assert.strictEqual(res.costNormal, 160);
  assert.strictEqual(res.costOvertime, 60); // 2h * 20 * 1.5 = 60
  assert.strictEqual(res.totalCost, 220); // 160 + 60 = 220
});

// 4. Jornada em domingo (8h em domingo, R$ 20/h - Exemplo SPEC 8.5)
runTest('Cenário 4: Jornada em domingo (8h domingo — Exemplo SPEC 8.5)', () => {
  const journey = {
    date: '2026-10-25', // Domingo
    startTime: '08:00',
    endTime: '16:00',
    isHoliday: false
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.totalDuration, 8);
  assert.strictEqual(res.normalHours, 0);
  assert.strictEqual(res.overtimeHours, 0);
  assert.strictEqual(res.sundayHolidayHours, 8);
  assert.strictEqual(res.costNormal, 0);
  assert.strictEqual(res.costOvertime, 0);
  assert.strictEqual(res.costSundayHoliday, 320); // 8h * 20 * 2.0 = 320
  assert.strictEqual(res.totalCost, 320);
});

// 5. Jornada em feriado marcado manualmente (8h em quarta-feira feriado, R$ 20/h)
runTest('Cenário 5: Jornada em feriado marcado manualmente (8h feriado)', () => {
  const journey = {
    date: '2026-10-21', // Quarta-feira marcado como feriado
    startTime: '08:00',
    endTime: '16:00',
    isHoliday: true
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.totalDuration, 8);
  assert.strictEqual(res.normalHours, 0);
  assert.strictEqual(res.overtimeHours, 0);
  assert.strictEqual(res.sundayHolidayHours, 8);
  assert.strictEqual(res.costSundayHoliday, 320); // 8h * 20 * 2.0 = 320
  assert.strictEqual(res.totalCost, 320);
});

// 6. Jornada que atravessa a meia-noite em dias comuns (22:00 às 06:00 = 8h, Terça para Quarta)
runTest('Cenário 6: Jornada que atravessa a meia-noite em dias comuns (22:00 às 06:00 = 8h)', () => {
  const journey = {
    date: '2026-10-20', // Terça-feira
    startTime: '22:00',
    endTime: '06:00',
    isHoliday: false,
    isHolidayNextDay: false
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.totalDuration, 8);
  assert.strictEqual(res.isSplit, true);
  assert.strictEqual(res.segments.length, 2);
  // Tramo 1: 22h às 24h = 2h comuns
  assert.strictEqual(res.segments[0].durationHours, 2);
  assert.strictEqual(res.segments[0].normalHours, 2);
  // Tramo 2: 00h às 06h = 6h comuns
  assert.strictEqual(res.segments[1].durationHours, 6);
  assert.strictEqual(res.segments[1].normalHours, 6);

  assert.strictEqual(res.normalHours, 8);
  assert.strictEqual(res.overtimeHours, 0);
  assert.strictEqual(res.costNormal, 160);
  assert.strictEqual(res.totalCost, 160);
});

// 7. Jornada que atravessa de um dia comum para um domingo (Sábado 20:00 às 04:00 = 8h)
runTest('Cenário 7: Jornada atravessando de Sábado para Domingo (20:00 às 04:00)', () => {
  const journey = {
    date: '2026-10-24', // Sábado
    startTime: '20:00',
    endTime: '04:00',
    isHoliday: false,
    isHolidayNextDay: false
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.totalDuration, 8);
  assert.strictEqual(res.isSplit, true);
  // Tramo 1: Sábado (20:00 - 24:00 = 4h comuns normais) -> 4 * 20 = 80
  assert.strictEqual(res.segments[0].durationHours, 4);
  assert.strictEqual(res.segments[0].isSunday, false);
  assert.strictEqual(res.segments[0].normalHours, 4);
  assert.strictEqual(res.segments[0].costNormal, 80);

  // Tramo 2: Domingo (00:00 - 04:00 = 4h em domingo 200%) -> 4 * 20 * 2 = 160
  assert.strictEqual(res.segments[1].durationHours, 4);
  assert.strictEqual(res.segments[1].isSunday, true);
  assert.strictEqual(res.segments[1].sundayHolidayHours, 4);
  assert.strictEqual(res.segments[1].costSundayHoliday, 160);

  assert.strictEqual(res.normalHours, 4);
  assert.strictEqual(res.sundayHolidayHours, 4);
  assert.strictEqual(res.totalCost, 240); // 80 + 160 = 240
});

// 8. Jornada que atravessa de um dia comum para um feriado (20:00 às 04:00, dia seguinte é feriado)
runTest('Cenário 8: Jornada atravessando de dia comum para feriado (20:00 às 04:00)', () => {
  const journey = {
    date: '2026-10-20', // Terça comum
    startTime: '20:00',
    endTime: '04:00',
    isHoliday: false,
    isHolidayNextDay: true // Quarta feriado
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.totalDuration, 8);
  // Tramo 1: 4h comum = R$ 80
  assert.strictEqual(res.segments[0].normalHours, 4);
  assert.strictEqual(res.segments[0].costNormal, 80);
  // Tramo 2: 4h feriado = R$ 160
  assert.strictEqual(res.segments[1].sundayHolidayHours, 4);
  assert.strictEqual(res.segments[1].costSundayHoliday, 160);
  assert.strictEqual(res.totalCost, 240);
});

// 9. Comparação entre escalas com o mesmo valor por hora
runTest('Cenário 9: Comparação entre escalas com o mesmo valor por hora', () => {
  const scaleA = {
    id: 'scale-a',
    name: 'Escala 5x2 (40h semanais)',
    hourlyRate: 25,
    dailyNormalLimit: 8,
    journeys: [
      { date: '2026-10-19', startTime: '08:00', endTime: '16:00', isHoliday: false },
      { date: '2026-10-20', startTime: '08:00', endTime: '16:00', isHoliday: false },
      { date: '2026-10-21', startTime: '08:00', endTime: '16:00', isHoliday: false },
      { date: '2026-10-22', startTime: '08:00', endTime: '16:00', isHoliday: false },
      { date: '2026-10-23', startTime: '08:00', endTime: '16:00', isHoliday: false }
    ] // 5 * 8h = 40h normais * 25 = R$ 1.000,00
  };

  const scaleB = {
    id: 'scale-b',
    name: 'Escala 6x1 com Domingo',
    hourlyRate: 25,
    dailyNormalLimit: 8,
    journeys: [
      { date: '2026-10-19', startTime: '08:00', endTime: '16:00', isHoliday: false },
      { date: '2026-10-20', startTime: '08:00', endTime: '16:00', isHoliday: false },
      { date: '2026-10-21', startTime: '08:00', endTime: '16:00', isHoliday: false },
      { date: '2026-10-22', startTime: '08:00', endTime: '16:00', isHoliday: false },
      { date: '2026-10-25', startTime: '08:00', endTime: '16:00', isHoliday: false } // Domingo 8h * 25 * 2 = R$ 400
    ] // 4 * 8h normais * 25 = 800 + 400 = R$ 1.200,00
  };

  const comparison = RHCalculator.compareScales([scaleB, scaleA]);
  assert.strictEqual(comparison.rankedScales[0].id, 'scale-a');
  assert.strictEqual(comparison.rankedScales[0].totalEstimatedCost, 1000);
  assert.strictEqual(comparison.rankedScales[1].id, 'scale-b');
  assert.strictEqual(comparison.rankedScales[1].totalEstimatedCost, 1200);
  assert.strictEqual(comparison.rankedScales[1].differenceToLowest, 200);
  assert.strictEqual(comparison.rankedScales[1].percentageDifference, 20); // 200 / 1000 = 20%
  assert.strictEqual(comparison.hasRateDiscrepancy, false);
});

// 10. Comparação entre escalas com valores por hora diferentes
runTest('Cenário 10: Comparação entre escalas com valores por hora diferentes', () => {
  const scaleJunior = {
    id: 'junior',
    name: 'Escala Júnior',
    hourlyRate: 20,
    dailyNormalLimit: 8,
    journeys: [{ date: '2026-10-19', startTime: '08:00', endTime: '16:00', isHoliday: false }] // 8h * 20 = 160
  };

  const scaleSenior = {
    id: 'senior',
    name: 'Escala Sênior',
    hourlyRate: 50,
    dailyNormalLimit: 8,
    journeys: [{ date: '2026-10-19', startTime: '08:00', endTime: '16:00', isHoliday: false }] // 8h * 50 = 400
  };

  const comparison = RHCalculator.compareScales([scaleSenior, scaleJunior]);
  assert.strictEqual(comparison.hasRateDiscrepancy, true);
  assert.strictEqual(comparison.rankedScales[0].id, 'junior');
  assert.strictEqual(comparison.rankedScales[0].totalEstimatedCost, 160);
  assert.strictEqual(comparison.rankedScales[1].id, 'senior');
  assert.strictEqual(comparison.rankedScales[1].totalEstimatedCost, 400);
});

// 11. Validação de campos inválidos ou incompletos
runTest('Cenário 11: Validação defensiva de campos inválidos ou incompletos', () => {
  const scaleValidation = RHCalculator.validateScale({ name: '', hourlyRate: -5, dailyNormalLimit: 0 });
  assert.strictEqual(scaleValidation.isValid, false);
  assert.strictEqual(scaleValidation.errors.length >= 3, true);

  const journeyValidation = RHCalculator.validateJourney({ date: 'data-errada', startTime: '99:99', endTime: '99:99' });
  assert.strictEqual(journeyValidation.isValid, false);
  assert.strictEqual(journeyValidation.errors.length >= 2, true);

  // Duração nula (mesma entrada e saída)
  const nullDuration = RHCalculator.validateJourney({ date: '2026-10-21', startTime: '08:00', endTime: '08:00' });
  assert.strictEqual(nullDuration.isValid, false);
});

// 12. Teste de formatação e precisão monetária / horas
runTest('Cenário 12: Formatação monetária e de horas', () => {
  const currencyFormatted = RHCalculator.formatCurrency(1234.5);
  // Em pt-BR: R$ 1.234,50 (com espaço insecável ou comum)
  assert.strictEqual(currencyFormatted.includes('1.234,50'), true);

  const hoursFormatted = RHCalculator.formatHours(8.5);
  assert.strictEqual(hoursFormatted.includes('8,5'), true);
});

// 13. Teste de feriado que coincide com domingo (não duplica adicional)
runTest('Cenário 13: Feriado coincidente com domingo (adicional único de 100%)', () => {
  const journey = {
    date: '2026-10-25', // Domingo
    startTime: '08:00',
    endTime: '16:00',
    isHoliday: true // Também feriado
  };
  const config = { hourlyRate: 20, dailyNormalLimit: 8 };
  const res = RHCalculator.calculateJourney(journey, config);

  assert.strictEqual(res.segments[0].classification, 'domingo_feriado');
  assert.strictEqual(res.sundayHolidayHours, 8);
  assert.strictEqual(res.costSundayHoliday, 320); // 8h * 20 * 2.0 = 320 (não 400 nem 640)
  assert.strictEqual(res.totalCost, 320);
});

console.log(`\n==================================================`);
console.log(`TOTAL DE TESTES EXECUTADOS: ${totalTests}`);
console.log(`PASSARAM: ${passedTests}`);
console.log(`FALHARAM: ${failedTests}`);
console.log(`==================================================`);

if (failedTests > 0) {
  process.exit(1);
}
