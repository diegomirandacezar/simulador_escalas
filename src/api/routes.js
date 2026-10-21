/**
 * Roteamento e Handlers da API REST
 * Projeto: Simulador de Escalas e Custos de Folha - Malemi
 */

import { store } from '../models/store.js';
import { validateSchedule, generateMonthlyCalendar } from '../services/scheduleService.js';
import { runSimulation } from '../services/simulationService.js';
import { validateImportedData } from '../services/importValidator.js';

export function handleApiRequest(req, res, url, body) {
  const method = req.method;
  const pathname = url.pathname;

  // Resposta padrão auxiliar
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data, null, 2));
  };

  // 1. Health Check
  if (method === 'GET' && pathname === '/api/health') {
    return sendJson(200, {
      status: "ok",
      servico: "Simulador de Escalas e Custos de Folha — Malemi API",
      versao: "1.0.0",
      fase: "1 — Levantamento e Validação",
      timestamp: new Date().toISOString()
    });
  }

  // 2. Filiais
  if (method === 'GET' && pathname === '/api/filiais') {
    return sendJson(200, {
      total: store.filiais.length,
      dados: store.filiais
    });
  }

  // 3. Funcionários
  if (method === 'GET' && pathname === '/api/funcionarios') {
    const filialId = url.searchParams.get('filialId');
    let lista = store.funcionarios;
    if (filialId) {
      lista = lista.filter(f => f.filialId === filialId);
    }
    return sendJson(200, {
      total: lista.length,
      filtroFilial: filialId || null,
      dados: lista
    });
  }

  if (method === 'POST' && pathname === '/api/funcionarios') {
    if (!body || !body.nome || !body.salarioBase || !body.matricula) {
      return sendJson(400, {
        erro: "Dados incompletos. 'matricula', 'nome' e 'salarioBase' são obrigatórios."
      });
    }
    const novoFuncionario = {
      id: `FUNC-${Date.now()}`,
      matricula: String(body.matricula).trim(),
      nome: String(body.nome).trim(),
      filialId: body.filialId || "FIL-01",
      cargo: body.cargo || "Operacional",
      regime: body.regime || "MENSALISTA",
      jornadaMensalRef: Number(body.jornadaMensalRef) || 200,
      salarioBase: Number(body.salarioBase),
      escalaId: body.escalaId || "ESC-5X2-COM"
    };
    store.funcionarios.push(novoFuncionario);
    return sendJson(201, {
      mensagem: "Colaborador cadastrado com sucesso.",
      dados: novoFuncionario
    });
  }

  // 4. Escalas
  if (method === 'GET' && pathname === '/api/escalas') {
    return sendJson(200, {
      total: store.escalas.length,
      dados: store.escalas
    });
  }

  if (method === 'POST' && pathname === '/api/escalas/validar') {
    if (!body) {
      return sendJson(400, { erro: "Payload JSON obrigatório." });
    }
    const validacao = validateSchedule(body);
    return sendJson(validacao.isValid ? 200 : 400, validacao);
  }

  if (method === 'POST' && pathname === '/api/escalas/calendario') {
    if (!body || !body.escalaId) {
      return sendJson(400, { erro: "O campo 'escalaId' é obrigatório." });
    }
    try {
      const year = Number(body.ano) || 2026;
      const month = Number(body.mes) || 10;
      const calendario = generateMonthlyCalendar({
        year,
        month,
        escalaId: body.escalaId,
        manualAdjustments: body.ajustesManuais || []
      });
      return sendJson(200, calendario);
    } catch (err) {
      return sendJson(404, { erro: err.message });
    }
  }

  // 5. Catálogo de Eventos
  if (method === 'GET' && pathname === '/api/eventos') {
    return sendJson(200, {
      total: store.eventos.length,
      dados: store.eventos
    });
  }

  // 6. Registro de Regras e Pendências
  if (method === 'GET' && pathname === '/api/regras') {
    return sendJson(200, {
      total: store.regras.length,
      dados: store.regras
    });
  }

  // 7. Simulações de Escalas e Folha
  if (method === 'POST' && pathname === '/api/simulacoes') {
    if (!body || !body.novaEscalaId) {
      return sendJson(400, {
        erro: "O campo 'novaEscalaId' é obrigatório para executar a simulação de cenário."
      });
    }
    try {
      const resultado = runSimulation({
        filialId: body.filialId,
        funcionarioId: body.funcionarioId,
        novaEscalaId: body.novaEscalaId,
        ano: Number(body.ano) || 2026,
        mes: Number(body.mes) || 10,
        ajustesManuais: body.ajustesManuais || []
      });
      return sendJson(200, resultado);
    } catch (err) {
      return sendJson(400, { erro: err.message });
    }
  }

  // 8. Validação de Importação de Planilha
  if (method === 'POST' && pathname === '/api/importacao/validar') {
    const dados = Array.isArray(body) ? body : (body && body.registros ? body.registros : []);
    const relatorio = validateImportedData(dados);
    return sendJson(200, relatorio);
  }

  // Rota desconhecida
  return sendJson(404, {
    erro: "Endpoint da API não encontrado.",
    caminho: pathname,
    metodo: method
  });
}
