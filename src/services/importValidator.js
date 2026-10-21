/**
 * Validador de Importação e Relatório de Qualidade de Dados
 * Projeto: Simulador de Escalas e Custos de Folha - Malemi
 */

import { store } from '../models/store.js';

/**
 * Valida um conjunto de linhas importadas de folha de pagamento.
 * @param {Array<Object>} rows 
 * @returns {Object} Relatório de auditoria e qualidade dos dados
 */
export function validateImportedData(rows) {
  if (!Array.isArray(rows)) {
    return {
      valido: false,
      mensagem: "O payload de importação deve ser uma lista (array) de registros.",
      totalLinhas: 0,
      linhasValidas: 0,
      linhasComErro: 0,
      erros: ["Formato de arquivo ou JSON inválido."],
      alertas: []
    };
  }

  const erros = [];
  const alertas = [];
  const matriculasVistas = new Set();
  const eventosCatalogados = new Set(store.eventos.map(e => String(e.codigo)));

  let linhasValidas = 0;
  let linhasComErro = 0;

  rows.forEach((row, index) => {
    const linhaNumero = index + 1;
    const errosLinha = [];

    // Verificação de identificadores
    if (!row.matricula || String(row.matricula).trim() === "") {
      errosLinha.push(`Linha ${linhaNumero}: Campo 'matricula' ausente ou vazio.`);
    } else {
      const mat = String(row.matricula).trim();
      if (matriculasVistas.has(mat)) {
        errosLinha.push(`Linha ${linhaNumero}: Matrícula '${mat}' duplicada no arquivo de folha.`);
      } else {
        matriculasVistas.add(mat);
      }
    }

    if (!row.nome || String(row.nome).trim() === "") {
      errosLinha.push(`Linha ${linhaNumero}: Campo 'nome' ausente ou vazio.`);
    }

    // Verificação de salário base
    if (row.salarioBase === undefined || row.salarioBase === null || isNaN(Number(row.salarioBase))) {
      errosLinha.push(`Linha ${linhaNumero}: Salário base não informado ou formato numérico inválido.`);
    } else if (Number(row.salarioBase) <= 0) {
      errosLinha.push(`Linha ${linhaNumero}: Salário base deve ser um valor estritamente positivo (recebido: ${row.salarioBase}).`);
    }

    // Verificação de filial
    if (row.filialId && !store.filiais.some(f => f.id === row.filialId)) {
      alertas.push(`Linha ${linhaNumero}: Filial '${row.filialId}' não consta na tabela de filiais cadastradas.`);
    }

    // Verificação de eventos presentes
    if (Array.isArray(row.eventos)) {
      row.eventos.forEach(ev => {
        const cod = String(ev.codigo || ev.codigo_evento || "");
        if (cod && !eventosCatalogados.has(cod)) {
          alertas.push(`Linha ${linhaNumero}: Evento de folha '${cod} - ${ev.descricao || "Sem Descrição"}' não reconhecido no catálogo; marcado como PENDENTE_VALIDACAO.`);
        }
      });
    }

    if (errosLinha.length > 0) {
      linhasComErro++;
      erros.push(...errosLinha);
    } else {
      linhasValidas++;
    }
  });

  return {
    valido: erros.length === 0,
    totalLinhas: rows.length,
    linhasValidas,
    linhasComErro,
    resumoStatus: erros.length === 0 ? "APROVADO_PARA_SIMULACAO" : "CONTÉM_INCONSISTENCIAS",
    erros,
    alertas
  };
}
