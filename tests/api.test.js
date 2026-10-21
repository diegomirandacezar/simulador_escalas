/**
 * Suíte de Testes Automatizados da API e Serviços
 * Projeto: Simulador de Escalas e Custos de Folha - Malemi
 * Runner: Node.js Test Runner Nativo (node:test)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateSchedule, calculateNightHours, generateMonthlyCalendar } from '../src/services/scheduleService.js';
import { runSimulation } from '../src/services/simulationService.js';
import { validateImportedData } from '../src/services/importValidator.js';
import { store } from '../src/models/store.js';

describe('1. Validação de Escalas e Turnos (scheduleService)', () => {

  it('deve aprovar uma escala comercial 5x2 válida', () => {
    const escala = {
      nome: 'Comercial 5x2 Padrão',
      horarioEntrada: '08:00',
      horarioSaida: '17:00',
      intervaloMinutos: 60
    };
    const resultado = validateSchedule(escala);
    assert.strictEqual(resultado.isValid, true);
    assert.strictEqual(resultado.errors.length, 0);
  });

  it('deve rejeitar escala com formato de horário inválido', () => {
    const escala = {
      nome: 'Escala Invalida',
      horarioEntrada: '25:70',
      horarioSaida: '17:00',
      intervaloMinutos: 60
    };
    const resultado = validateSchedule(escala);
    assert.strictEqual(resultado.isValid, false);
    assert.ok(resultado.errors.some(e => e.includes('HH:mm')));
  });

  it('deve alertar sobre jornada > 6h sem intervalo intrajornada mínimo', () => {
    const escala = {
      nome: 'Turno Longo Sem Almoço',
      horarioEntrada: '08:00',
      horarioSaida: '16:00',
      intervaloMinutos: 15 // menos que 60 min para jornada de 8h
    };
    const resultado = validateSchedule(escala);
    assert.strictEqual(resultado.isValid, false);
    assert.ok(resultado.errors.some(e => e.includes('intervalo mínimo de 60 minutos')));
  });

  it('deve calcular corretamente horas noturnas em turno que atravessa a meia-noite', () => {
    // Turno das 19:00 às 07:00 do dia seguinte
    // Horário noturno legal: 22:00 às 05:00 = 7 horas
    const horasNoturnas = calculateNightHours('19:00', '07:00');
    assert.strictEqual(horasNoturnas, 7);
  });

  it('deve retornar 0 horas noturnas para turno estritamente diurno', () => {
    const horasNoturnas = calculateNightHours('08:00', '17:00');
    assert.strictEqual(horasNoturnas, 0);
  });

});

describe('2. Geração de Calendário Mensal (scheduleService)', () => {

  it('deve gerar 31 dias para o mês de Outubro/2026', () => {
    const calendario = generateMonthlyCalendar({
      year: 2026,
      month: 10,
      escalaId: 'ESC-5X2-COM'
    });

    assert.strictEqual(calendario.diasNoMes, 31);
    assert.strictEqual(calendario.dias.length, 31);
    assert.ok(calendario.resumo.totalDiasTrabalho > 0);
    assert.ok(calendario.resumo.totalDiasFolga > 0);
  });

  it('deve aplicar ajuste manual do usuário sem descaracterizar a escala base', () => {
    const ajustes = [
      {
        data: '2026-10-15',
        tipoDia: 'FERIADO',
        observacao: 'Feriado Municipal Facultativo'
      }
    ];

    const calendario = generateMonthlyCalendar({
      year: 2026,
      month: 10,
      escalaId: 'ESC-5X2-COM',
      manualAdjustments: ajustes
    });

    const dia15 = calendario.dias.find(d => d.data === '2026-10-15');
    assert.ok(dia15);
    assert.strictEqual(dia15.tipoDia, 'FERIADO');
    assert.strictEqual(dia15.ajusteManual, true);
    assert.strictEqual(dia15.observacao, 'Feriado Municipal Facultativo');
  });

});

describe('3. Motor de Simulação e Auditoria (simulationService)', () => {

  it('deve preservar o salário base inalterado para eventos independentes', () => {
    const resultado = runSimulation({
      funcionarioId: 'FUNC-101',
      novaEscalaId: 'ESC-12X36-DIA',
      ano: 2026,
      mes: 10
    });

    assert.strictEqual(resultado.colaboradores.length, 1);
    const colab = resultado.colaboradores[0];
    const eventoSalario = colab.eventos.find(e => e.codigo === '101');

    assert.ok(eventoSalario);
    assert.strictEqual(eventoSalario.classificacao, 'INDEPENDENTE');
    assert.strictEqual(eventoSalario.statusRegra, 'VALIDADO');
    assert.strictEqual(eventoSalario.valorReferencia, eventoSalario.valorSimulado);
  });

  it('deve marcar eventos dependentes sem regra homologada como PENDENTE_HOMOLOGACAO', () => {
    const resultado = runSimulation({
      novaEscalaId: 'ESC-12X36-NOT',
      ano: 2026,
      mes: 10
    });

    assert.ok(resultado.colaboradores.length > 0);
    const primeiro = resultado.colaboradores[0];
    const eventoHe = primeiro.eventos.find(e => e.codigo === '201');
    const eventoNoturno = primeiro.eventos.find(e => e.codigo === '203');

    assert.strictEqual(eventoHe.statusRegra, 'PENDENTE_HOMOLOGACAO');
    assert.strictEqual(eventoNoturno.statusRegra, 'PENDENTE_HOMOLOGACAO');
    assert.strictEqual(eventoHe.valorSimulado, null); // Não inventa fórmula sem aprovação
    assert.ok(resultado.auditTrail.regrasPendentes.length > 0);
  });

});

describe('4. Qualidade de Importação de Dados (importValidator)', () => {

  it('deve aprovar dados com todos os campos obrigatórios preenchidos', () => {
    const dados = [
      {
        matricula: 'M1001',
        nome: 'Colaborador Teste',
        filialId: 'FIL-01',
        salarioBase: 3500.00
      }
    ];

    const relatorio = validateImportedData(dados);
    assert.strictEqual(relatorio.valido, true);
    assert.strictEqual(relatorio.linhasValidas, 1);
    assert.strictEqual(relatorio.linhasComErro, 0);
  });

  it('deve acusar erro para matrícula ausente e salário negativo', () => {
    const dados = [
      {
        matricula: '',
        nome: 'Sem Matrícula',
        salarioBase: -50.00
      }
    ];

    const relatorio = validateImportedData(dados);
    assert.strictEqual(relatorio.valido, false);
    assert.strictEqual(relatorio.linhasComErro, 1);
    assert.ok(relatorio.erros.some(e => e.includes('matricula')));
    assert.ok(relatorio.erros.some(e => e.includes('estritamente positivo')));
  });

  it('deve acusar erro para matrículas duplicadas na mesma importação', () => {
    const dados = [
      { matricula: 'DUP-01', nome: 'Pessoa 1', salarioBase: 2000 },
      { matricula: 'DUP-01', nome: 'Pessoa 2', salarioBase: 2500 }
    ];

    const relatorio = validateImportedData(dados);
    assert.strictEqual(relatorio.valido, false);
    assert.ok(relatorio.erros.some(e => e.includes('duplicada')));
  });

  it('deve gerar alerta de atenção para evento de folha não catalogado', () => {
    const dados = [
      {
        matricula: 'M2001',
        nome: 'Pessoa com Evento Novo',
        salarioBase: 4000,
        eventos: [{ codigo: '999', descricao: 'Evento Desconhecido' }]
      }
    ];

    const relatorio = validateImportedData(dados);
    assert.strictEqual(relatorio.valido, true); // Não bloqueia, mas alerta
    assert.ok(relatorio.alertas.some(a => a.includes('não reconhecido no catálogo')));
  });

});
