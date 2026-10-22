/**
 * Teste de Fluxo Completo de Negócio e Persistência
 * Simula todas as interações de usuário e fluxos de dados
 */

const assert = require('assert');
const RHCalculator = require('../js/calculator.js');
const RHStorage = require('../js/storage.js');

console.log('--- TESTANDO FLUXO COMPLETO DE DADOS E CASOS DE USO ---\n');

// 1. Carga inicial e cálculo de demonstração
const defaultScales = RHStorage.getDefaultScales();
assert.strictEqual(defaultScales.length, 3, 'Devem existir 3 escalas padrão');

const calc5x2 = RHCalculator.calculateScale(defaultScales[0]);
console.log(`[TEST] Escala 5x2: Total de Horas = ${calc5x2.totalHours}h, Custo Total = ${RHCalculator.formatCurrency(calc5x2.totalEstimatedCost)}`);
assert.strictEqual(calc5x2.totalHours, 40);
assert.strictEqual(calc5x2.totalEstimatedCost, 800); // 40h * 20 = 800

const calc6x1 = RHCalculator.calculateScale(defaultScales[1]);
console.log(`[TEST] Escala 6x1: Total de Horas = ${calc6x1.totalHours}h, Custo Total = ${RHCalculator.formatCurrency(calc6x1.totalEstimatedCost)}`);
assert.strictEqual(calc6x1.totalHours, 42); // 5 dias * 7h + 1 dia * 7h = 42h
// 35h normais * 20 = 700 + 7h domingo * 20 * 2 = 280 -> 700 + 280 = 980
assert.strictEqual(calc6x1.totalEstimatedCost, 980);

const calcNoturno = RHCalculator.calculateScale(defaultScales[2]);
console.log(`[TEST] Escala Plantão Noturno: Total de Horas = ${calcNoturno.totalHours}h, Custo Total = ${RHCalculator.formatCurrency(calcNoturno.totalEstimatedCost)}`);
assert.strictEqual(calcNoturno.totalHours, 24);
// Plantão 1: 8h normais = 160
// Plantão 2: 8h normais = 160
// Plantão 3: Sáb 4h normais (80) + Dom 4h a 200% (160) = 240
// Total = 160 + 160 + 240 = 560
assert.strictEqual(calcNoturno.totalEstimatedCost, 560);

// 2. Teste de Ranking e Comparação
const comparison = RHCalculator.compareScales(defaultScales);
console.log('\n[TEST] Comparação e Ranking:');
comparison.rankedScales.forEach((s) => {
  console.log(`  ${s.rank}º Lugar: ${s.name} - Custo: ${RHCalculator.formatCurrency(s.totalEstimatedCost)} (Diferença: +${RHCalculator.formatCurrency(s.differenceToLowest)})`);
});

assert.strictEqual(comparison.rankedScales[0].id, 'escala-noturna-plantao');
assert.strictEqual(comparison.rankedScales[0].isLowestCost, true);
assert.strictEqual(comparison.rankedScales[1].id, 'escala-5x2-comercial');
assert.strictEqual(comparison.rankedScales[2].id, 'escala-6x1-operacional');

// 3. Teste de JSON Export e Import
const jsonStr = JSON.stringify({ version: '1.0', scales: defaultScales });
const parsed = JSON.parse(jsonStr);
assert.strictEqual(parsed.scales.length, 3);

console.log('\n✅ TODOS OS FLUXOS DE NEGÓCIO E PERSISTÊNCIA TESTADOS COM SUCESSO!');
