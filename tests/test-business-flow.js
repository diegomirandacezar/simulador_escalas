/**
 * Teste de Fluxo Completo de Negócio, Deduplicação e Ranking de Escalas
 * Valida o catálogo das 33 escalas únicas simuladas, ordenação crescente por custo (ranking)
 * e comparação detalhada entre cenários.
 */

const assert = require('assert');
const RHCalculator = require('../js/calculator.js');
const RHStorage = require('../js/storage.js');

console.log('--- TESTANDO CATÁLOGO DE 33 ESCALAS ÚNICAS, SIMULAÇÃO E RANKING ---\n');

// 1. Carga inicial das escalas padrão
const defaultScales = RHStorage.getDefaultScales();
assert.strictEqual(defaultScales.length, 33, 'Devem existir exatamente 33 escalas únicas deduplicadas');

// 2. Verifica ausência de códigos repetidos e presença de jornada mensal válida
const seenCodes = new Set();
defaultScales.forEach((scale) => {
  assert(scale.code, `Escala "${scale.name}" deve possuir código (CODHORARIO)`);
  assert(!seenCodes.has(scale.code), `Código duplicado encontrado: ${scale.code}`);
  seenCodes.add(scale.code);
  assert(scale.monthlyHours >= 120 && scale.monthlyHours <= 220, `Jornada mensal inválida em ${scale.code}: ${scale.monthlyHours}`);
  assert(Array.isArray(scale.journeys) && scale.journeys.length > 0, `Escala ${scale.code} deve ter jornadas simuladas`);
});
console.log(`✅ [PASS] 33 escalas únicas verificadas (zero repetições, todas com jornada mensal e jornadas simuladas)`);

// 3. Verifica que a ordem gravada no getDefaultScales() já está em ordem crescente de custo (ranking)
const calculated = defaultScales.map((s) => RHCalculator.calculateScale(s));
for (let i = 1; i < calculated.length; i++) {
  assert(
    calculated[i].totalEstimatedCost >= calculated[i - 1].totalEstimatedCost - 0.0001,
    `Ranking fora de ordem entre ${calculated[i - 1].code} (${calculated[i - 1].totalEstimatedCost}) e ${calculated[i].code} (${calculated[i].totalEstimatedCost})`
  );
}
console.log(`✅ [PASS] Escalas gravadas em ordem crescente de custo (1º: [${calculated[0].code}] ${RHCalculator.formatCurrency(calculated[0].totalEstimatedCost)} até 33º: [${calculated[32].code}] ${RHCalculator.formatCurrency(calculated[32].totalEstimatedCost)})`);

// 4. Verifica escala mais barata (0152 - 4h/dia - 120h/mês)
assert.strictEqual(calculated[0].code, '0152', 'A escala 0152 (4h/dia, 120h/mês) deve ocupar o 1º lugar no ranking');
assert.strictEqual(calculated[0].monthlyHours, 120);

// 5. Verifica consistência do compareScales
const comparacaoGeral = RHCalculator.compareScales(defaultScales);
assert.strictEqual(comparacaoGeral.rankedScales.length, 33);
assert.strictEqual(comparacaoGeral.hasRateDiscrepancy, false, 'Todas as escalas padrão usam o mesmo valor-hora base');
assert.strictEqual(comparacaoGeral.rankedScales[0].rank, 1);
assert.strictEqual(comparacaoGeral.rankedScales[0].isLowestCost, true);
assert.strictEqual(comparacaoGeral.rankedScales[32].rank, 33);
assert(comparacaoGeral.rankedScales[32].differenceToLowest > 0);
console.log(`✅ [PASS] Comparação geral validada (menor custo destacado e diferenças calculadas corretamente)`);

// 6. Valida reordenação automática ao alterar o valor-hora de uma escala
const simulacaoEditada = defaultScales.map((s) =>
  s.code === '0152' ? { ...s, hourlyRate: 90.0 } : s
);
const reordenadas = RHStorage.sortScalesByRanking(simulacaoEditada);
assert.strictEqual(reordenadas[reordenadas.length - 1].code, '0152', 'Após aumentar valor-hora, escala 0152 deve ir para o fim do ranking');
console.log(`✅ [PASS] Reordenação automática após edição de escala validada`);

// 7. Valida atualização em lote do valor-hora para todas as escalas
const atualizadas35 = RHStorage.updateAllHourlyRates(35.0);
assert.strictEqual(atualizadas35.length, 33);
assert(atualizadas35.every((s) => s.hourlyRate === 35.0), 'Todas as 33 escalas devem assumir R$ 35,00/h');
const calcPrimeiro35 = RHCalculator.calculateScale(atualizadas35[0]);
assert.strictEqual(calcPrimeiro35.code, '0152');
assert.strictEqual(calcPrimeiro35.totalEstimatedCost, 104 * 35); // 104h * R$ 35 = R$ 3.640,00
assert.throws(() => RHStorage.updateAllHourlyRates(0), /maior que zero/);
assert.throws(() => RHStorage.updateAllHourlyRates(-10), /maior que zero/);
console.log(`✅ [PASS] Atualização em lote do valor-hora para todas as escalas validada (R$ 35,00/h -> 1º lugar: ${RHCalculator.formatCurrency(calcPrimeiro35.totalEstimatedCost)})`);

// 8. Valida filtro por escala com coringa "%" (%6x1, BA%, %12x36, acentos e múltiplos)
const filtradas6x1 = RHCalculator.filterScales(defaultScales, '%6x1');
assert(filtradas6x1.length >= 10, `Esperado ao menos 10 escalas com %6x1, encontrado ${filtradas6x1.length}`);
assert(filtradas6x1.some((s) => s.code === '0223'), 'Deve incluir 0223 (SP ESCALA 6X1 PRIMEIRO TURNO)');
assert(filtradas6x1.some((s) => s.code === '0254'), 'Deve incluir 0254 (6X1 11:00 AS 20:00)');
assert(!filtradas6x1.some((s) => s.code === '0113'), 'Não deve incluir ADM 08:00 ÀS 17:00 em %6x1');

const filtradas6x1Direto = RHCalculator.filterScales(defaultScales, '6x1');
assert.strictEqual(filtradas6x1.length, filtradas6x1Direto.length, '"%6x1" e "6x1" devem retornar o mesmo conjunto de escalas');

const filtradas12x36 = RHCalculator.filterScales(defaultScales, '%12x36');
assert.strictEqual(filtradas12x36.length, 2, 'Deve encontrar as 2 escalas 12 X 36 mesmo digitando %12x36 sem espaços');

const filtradas3x2x2 = RHCalculator.filterScales(defaultScales, '%3x2x2');
assert.strictEqual(filtradas3x2x2.length, 1);
assert.strictEqual(filtradas3x2x2[0].code, '0231');

const filtradasAcento = RHCalculator.filterScales(defaultScales, '%laminacao');
assert.strictEqual(filtradasAcento.length, 1);
assert.strictEqual(filtradasAcento[0].code, '0232');

const filtradasComecaBA = RHCalculator.filterScales(defaultScales, 'BA%');
assert(filtradasComecaBA.length >= 3);
assert(filtradasComecaBA.every((s) =>
  RHCalculator.normalizeSearchText(s.name).startsWith('ba') ||
  RHCalculator.normalizeSearchText(s.employee).startsWith('ba') ||
  RHCalculator.normalizeSearchText(s.code).startsWith('ba')
));

const filtradasMultiplas = RHCalculator.filterScales(defaultScales, '%12x36; %4x4');
assert.strictEqual(filtradasMultiplas.length, 4, 'Deve combinar %12x36 (2) OU %4x4 (2) = 4 escalas');

console.log(`✅ [PASS] Filtro avançado por escala validado (%6x1=${filtradas6x1.length}, %12x36=${filtradas12x36.length}, BA%=${filtradasComecaBA.length}, múltiplos=${filtradasMultiplas.length})`);

// 9. Valida desativação global de hora extra em Domingos e Feriados (updateAllGlobalSettings)
const semDomFer = RHStorage.updateAllGlobalSettings({ paySundayExtra: false, payHolidayExtra: false });
assert.strictEqual(semDomFer.length, 33);
const calc12x36SemDom = RHCalculator.calculateScale(semDomFer.find((s) => s.code === '0303'));
assert.strictEqual(calc12x36SemDom.totalSundayHolidayHours, 0, '12x36 com Dom/Fer desativado deve ter 0h de Dom/Fer');
assert.strictEqual(calc12x36SemDom.totalNormalHours, 165, '12x36 (15 plantões x 11h) deve ter 165h normais');
assert.strictEqual(calc12x36SemDom.totalEstimatedCost, 165 * 20, 'Custo 12x36 sem adicional de domingo deve ser R$ 3.300,00');
console.log(`✅ [PASS] Regra global de Domingo/Feriado opcional validada (12x36 caiu de R$ 3.740,00 para ${RHCalculator.formatCurrency(calc12x36SemDom.totalEstimatedCost)})`);

// 10. Valida comparação clássica de 2 escalas (5x2 vs 6x1 com Domingo)
const escalaA = {
  id: 'escala-a',
  code: 'A001',
  name: '5x2 Comercial',
  monthlyHours: 200,
  hourlyRate: 20,
  dailyNormalLimit: 8,
  journeys: [
    { date: '2026-10-19', startTime: '08:00', endTime: '16:00', isHoliday: false },
    { date: '2026-10-20', startTime: '08:00', endTime: '16:00', isHoliday: false },
    { date: '2026-10-21', startTime: '08:00', endTime: '16:00', isHoliday: false },
    { date: '2026-10-22', startTime: '08:00', endTime: '16:00', isHoliday: false },
    { date: '2026-10-23', startTime: '08:00', endTime: '16:00', isHoliday: false }
  ]
};
const escalaB = {
  id: 'escala-b',
  code: 'B001',
  name: '6x1 com Domingo',
  monthlyHours: 220,
  hourlyRate: 20,
  dailyNormalLimit: 8,
  journeys: [
    { date: '2026-10-19', startTime: '08:00', endTime: '15:00', isHoliday: false },
    { date: '2026-10-20', startTime: '08:00', endTime: '15:00', isHoliday: false },
    { date: '2026-10-21', startTime: '08:00', endTime: '15:00', isHoliday: false },
    { date: '2026-10-22', startTime: '08:00', endTime: '15:00', isHoliday: false },
    { date: '2026-10-23', startTime: '08:00', endTime: '15:00', isHoliday: false },
    { date: '2026-10-25', startTime: '08:00', endTime: '15:00', isHoliday: false }
  ]
};
const compAB = RHCalculator.compareScales([escalaB, escalaA]);
assert.strictEqual(compAB.rankedScales[0].id, 'escala-a');
assert.strictEqual(compAB.rankedScales[0].totalEstimatedCost, 800);
assert.strictEqual(compAB.rankedScales[1].totalEstimatedCost, 980);
assert.strictEqual(compAB.rankedScales[1].differenceToLowest, 180);
console.log(`✅ [PASS] Comparação direta 5x2 vs 6x1 com Domingo validada`);

console.log('\n✅ TODOS OS TESTES DE NEGÓCIO, DEDUPLICAÇÃO E RANKING PASSARAM COM 100% DE SUCESSO!');
