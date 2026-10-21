/**
 * Motor de Simulação de Escalas e Custos de Folha
 * Projeto: Simulador de Escalas e Custos de Folha - Malemi
 * Diretriz: Auditoria, Rastreabilidade e Não Presunção de Regras Legais Não Homologadas.
 */

import { store } from '../models/store.js';
import { generateMonthlyCalendar } from './scheduleService.js';

/**
 * Executa a simulação comparativa entre a Escala Base/Referência e a Escala Proposta.
 * @param {Object} params
 * @param {string} [params.filialId] - Opcional para filtrar por filial
 * @param {string} [params.funcionarioId] - Opcional para filtrar por colaborador
 * @param {string} params.novaEscalaId - ID da escala alternativa a simular
 * @param {number} [params.ano=2026]
 * @param {number} [params.mes=10]
 * @param {Array} [params.ajustesManuais]
 * @returns {Object} Resultado detalhado da simulação e memória de cálculo
 */
export function runSimulation({
  filialId,
  funcionarioId,
  novaEscalaId,
  ano = 2026,
  mes = 10,
  ajustesManuais = []
}) {
  const novaEscala = store.escalas.find(e => e.id === novaEscalaId);
  if (!novaEscala) {
    throw new Error(`Escala proposta '${novaEscalaId}' não encontrada.`);
  }

  // Filtragem dos funcionários para a simulação
  let colaboradores = store.funcionarios;
  if (filialId) {
    colaboradores = colaboradores.filter(f => f.filialId === filialId);
  }
  if (funcionarioId) {
    colaboradores = colaboradores.filter(f => f.id === funcionarioId);
  }

  if (colaboradores.length === 0) {
    throw new Error("Nenhum colaborador localizado com os filtros fornecidos.");
  }

  // Gerar calendário da nova escala para o mês
  const calendarioProposto = generateMonthlyCalendar({
    year: ano,
    month: mes,
    escalaId: novaEscalaId,
    manualAdjustments: ajustesManuais
  });

  const resultadosColaboradores = [];
  let totalSalarioBaseReferencia = 0;
  let totalSalarioBaseSimulado = 0;
  let totalHorasReferencia = 0;
  let totalHorasSimuladas = 0;
  let totalHorasNoturnasSimuladas = 0;
  const pendenciasRegistradas = new Set();

  for (const func of colaboradores) {
    const escalaOriginal = store.escalas.find(e => e.id === func.escalaId) || novaEscala;
    
    // Calendário de referência original
    const calOriginal = generateMonthlyCalendar({
      year: ano,
      month: mes,
      escalaId: escalaOriginal.id
    });

    const horasRef = calOriginal.resumo.totalHorasPlanejadas;
    const horasSim = calendarioProposto.resumo.totalHorasPlanejadas;
    const deltaHoras = Number((horasSim - horasRef).toFixed(2));

    // Salário base: evento fixo independente da escala para mensalistas
    const salarioBase = func.salarioBase;
    totalSalarioBaseReferencia += salarioBase;
    totalSalarioBaseSimulado += salarioBase;
    totalHorasReferencia += horasRef;
    totalHorasSimuladas += horasSim;
    totalHorasNoturnasSimuladas += calendarioProposto.resumo.totalHorasNoturnas;

    // Levantamento dos eventos com rastreabilidade auditável
    const eventosMapeados = [
      {
        codigo: "101",
        descricao: "Salário Base Contratual",
        tipo: "PROVENTO",
        classificacao: "INDEPENDENTE",
        valorReferencia: salarioBase,
        valorSimulado: salarioBase,
        deltaValor: 0,
        statusRegra: "VALIDADO",
        memoriaCalculo: "Evento inalterado pela escala. Manutenção integral da folha de referência."
      },
      {
        codigo: "201",
        descricao: "Horas Extras 50% (Dias Úteis)",
        tipo: "PROVENTO",
        classificacao: "DEPENDENTE",
        valorReferencia: 0.00,
        valorSimulado: null, // Não inventar valor sem homologação da CCT
        deltaValor: null,
        statusRegra: "PENDENTE_HOMOLOGACAO",
        horasEstimadas: deltaHoras > 0 ? deltaHoras : 0,
        memoriaCalculo: `Projeção de ${deltaHoras > 0 ? deltaHoras : 0}h adicionais. Valor financeiro em aberto: aguardando confirmação do divisor contratual (${func.jornadaMensalRef}h) e percentuais de convenção coletiva.`
      },
      {
        codigo: "203",
        descricao: "Adicional Noturno (22h às 05h)",
        tipo: "PROVENTO",
        classificacao: "DEPENDENTE",
        valorReferencia: 0.00,
        valorSimulado: null,
        deltaValor: null,
        statusRegra: "PENDENTE_HOMOLOGACAO",
        horasEstimadas: calendarioProposto.resumo.totalHorasNoturnas,
        memoriaCalculo: `Projeção de ${calendarioProposto.resumo.totalHorasNoturnas}h no horário noturno. Valor financeiro em aberto: aguardando validação de redução da hora ficta e percentual da CCT.`
      }
    ];

    pendenciasRegistradas.add("Divisor contratual para cálculo de salário-hora ainda não homologado.");
    pendenciasRegistradas.add("Definição dos encargos patronais para exibição de Custo Total pendente.");

    resultadosColaboradores.push({
      funcionarioId: func.id,
      matricula: func.matricula,
      nome: func.nome,
      cargo: func.cargo,
      filialId: func.filialId,
      regime: func.regime,
      jornadaMensalRef: func.jornadaMensalRef,
      escalaOriginal: {
        id: escalaOriginal.id,
        nome: escalaOriginal.nome,
        totalHoras: horasRef
      },
      escalaProposta: {
        id: novaEscala.id,
        nome: novaEscala.nome,
        totalHoras: horasSim,
        totalHorasNoturnas: calendarioProposto.resumo.totalHorasNoturnas
      },
      deltaHoras,
      eventos: eventosMapeados
    });
  }

  return {
    simulacaoId: `SIM-${Date.now()}`,
    dataExecucao: new Date().toISOString(),
    competencia: `${ano}-${String(mes).padStart(2, '0')}`,
    filtros: {
      filialId: filialId || "TODAS",
      funcionarioId: funcionarioId || "TODOS",
      novaEscalaId
    },
    resumoGeral: {
      totalColaboradoresProcessados: colaboradores.length,
      totalHorasReferencia: Number(totalHorasReferencia.toFixed(2)),
      totalHorasSimuladas: Number(totalHorasSimuladas.toFixed(2)),
      deltaHorasTotal: Number((totalHorasSimuladas - totalHorasReferencia).toFixed(2)),
      totalHorasNoturnasSimuladas: Number(totalHorasNoturnasSimuladas.toFixed(2)),
      salarioBaseTotalReferencia: Number(totalSalarioBaseReferencia.toFixed(2)),
      salarioBaseTotalSimulado: Number(totalSalarioBaseSimulado.toFixed(2)),
      avisoCustoTotal: "O Custo Total Patronal (encargos e provisões) não está exibido pois as alíquotas oficiais aguardam homologação conforme o SPEC.md."
    },
    auditTrail: {
      statusAuditoria: "COMPATÍVEL_FASE_1",
      regrasPendentes: Array.from(pendenciasRegistradas),
      politicaCalculo: "Eventos independentes preservados; eventos dependentes projetados em horas com valores financeiros bloqueados até homologação de CCT."
    },
    colaboradores: resultadosColaboradores
  };
}
