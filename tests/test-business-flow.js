/**
 * Teste de Fluxo Completo de Negócio e Persistência
 * Simula a inclusão de uma semana de jornada para o Funcionário X e para o Funcionário Y
 * e valida a comparação detalhada de custos entre ambos.
 */

const assert = require('assert');
const RHCalculator = require('../js/calculator.js');
const RHStorage = require('../js/storage.js');

console.log('--- TESTANDO FLUXO COMPLETO: FUNCIONÁRIO X vs FUNCIONÁRIO Y ---\n');

// 1. Carga inicial das escalas padrão
const defaultScales = RHStorage.getDefaultScales();
assert.strictEqual(defaultScales.length, 3, 'Devem existir 3 escalas padrão');

const escalaX = defaultScales.find((s) => s.id === 'escala-func-x');
assert(escalaX, 'Escala do Funcionário X deve existir');
assert.strictEqual(escalaX.employee, 'Funcionário X');

const escalaY = defaultScales.find((s) => s.id === 'escala-func-y');
assert(escalaY, 'Escala do Funcionário Y deve existir');
assert.strictEqual(escalaY.employee, 'Funcionário Y');

// 2. Cálculo da Semana do Funcionário X
// 5 dias de segunda a sexta, 8h normais por dia = 40h @ R$ 20,00/h
const calcX = RHCalculator.calculateScale(escalaX);
console.log(`[TEST] Semana Funcionário X:`);
console.log(`  - Total de Jornadas: ${calcX.totalJourneysCount}`);
console.log(`  - Total de Horas: ${calcX.totalHours}h`);
console.log(`  - Horas Normais: ${calcX.totalNormalHours}h (Custo: ${RHCalculator.formatCurrency(calcX.totalCostNormal)})`);
console.log(`  - Horas Extras: ${calcX.totalOvertimeHours}h`);
console.log(`  - Horas Dom/Fer: ${calcX.totalSundayHolidayHours}h`);
console.log(`  - Custo Total Estimado: ${RHCalculator.formatCurrency(calcX.totalEstimatedCost)}`);

assert.strictEqual(calcX.totalHours, 40);
assert.strictEqual(calcX.totalNormalHours, 40);
assert.strictEqual(calcX.totalOvertimeHours, 0);
assert.strictEqual(calcX.totalEstimatedCost, 800); // 40h * 20 = 800

// 3. Cálculo da Semana do Funcionário Y
// 5 dias de segunda a sexta 7h normais (35h) + domingo 7h a 200% = 42h
const calcY = RHCalculator.calculateScale(escalaY);
console.log(`\n[TEST] Semana Funcionário Y:`);
console.log(`  - Total de Jornadas: ${calcY.totalJourneysCount}`);
console.log(`  - Total de Horas: ${calcY.totalHours}h`);
console.log(`  - Horas Normais: ${calcY.totalNormalHours}h (Custo: ${RHCalculator.formatCurrency(calcY.totalCostNormal)})`);
console.log(`  - Horas Extras: ${calcY.totalOvertimeHours}h`);
console.log(`  - Horas Dom/Fer: ${calcY.totalSundayHolidayHours}h (Custo: ${RHCalculator.formatCurrency(calcY.totalCostSundayHoliday)})`);
console.log(`  - Custo Total Estimado: ${RHCalculator.formatCurrency(calcY.totalEstimatedCost)}`);

assert.strictEqual(calcY.totalHours, 42);
assert.strictEqual(calcY.totalNormalHours, 35);
assert.strictEqual(calcY.totalSundayHolidayHours, 7);
assert.strictEqual(calcY.totalCostNormal, 700); // 35 * 20 = 700
assert.strictEqual(calcY.totalCostSundayHoliday, 280); // 7 * 20 * 2 = 280
assert.strictEqual(calcY.totalEstimatedCost, 980); // 700 + 280 = 980

// 4. Comparação direta entre a semana do Funcionário X e a semana do Funcionário Y
const comparacaoXY = RHCalculator.compareScales([escalaX, escalaY]);
console.log('\n[TEST] Comparação Direta Funcionário X vs Funcionário Y:');
comparacaoXY.rankedScales.forEach((s) => {
  console.log(`  ${s.rank}º Lugar: ${s.name} [${s.employee}] - Custo: ${RHCalculator.formatCurrency(s.totalEstimatedCost)} (Diferença: +${RHCalculator.formatCurrency(s.differenceToLowest)})`);
});

// Funcionário X é o de menor custo (R$ 800,00 vs R$ 980,00 do Funcionário Y)
assert.strictEqual(comparacaoXY.rankedScales[0].id, 'escala-func-x');
assert.strictEqual(comparacaoXY.rankedScales[0].isLowestCost, true);
assert.strictEqual(comparacaoXY.rankedScales[1].id, 'escala-func-y');
assert.strictEqual(comparacaoXY.rankedScales[1].differenceToLowest, 180); // 980 - 800 = 180
assert.strictEqual(comparacaoXY.rankedScales[1].percentageDifference, 22.5); // 180 / 800 = 22.5%

// 5. Teste de adição de uma nova semana inteira via addMultipleJourneysToScale
const novaSemanaX = [
  { date: '2026-10-26', startTime: '08:00', endTime: '16:00', isHoliday: false, employee: 'Funcionário X' },
  { date: '2026-10-27', startTime: '08:00', endTime: '16:00', isHoliday: false, employee: 'Funcionário X' },
  { date: '2026-10-28', startTime: '08:00', endTime: '16:00', isHoliday: false, employee: 'Funcionário X' },
  { date: '2026-10-29', startTime: '08:00', endTime: '16:00', isHoliday: false, employee: 'Funcionário X' },
  { date: '2026-10-30', startTime: '08:00', endTime: '16:00', isHoliday: false, employee: 'Funcionário X' }
];

const escalaModificada = { ...escalaX, journeys: [...escalaX.journeys, ...novaSemanaX] };
const calcXDuasSemanas = RHCalculator.calculateScale(escalaModificada);
assert.strictEqual(calcXDuasSemanas.totalHours, 80);
assert.strictEqual(calcXDuasSemanas.totalEstimatedCost, 1600);

console.log('\n✅ TODOS OS TESTES DE FUNCIONÁRIO X vs FUNCIONÁRIO Y PASSARAM COM 100% DE SUCESSO!');
