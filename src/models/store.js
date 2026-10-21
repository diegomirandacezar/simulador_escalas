/**
 * Repositório de Dados em Memória (Store)
 * Projeto: Simulador de Escalas e Custos de Folha - Malemi
 * Nota de Segurança: Todos os colaboradores e valores abaixo são FICTÍCIOS e anonimizados.
 */

export const store = {
  filiais: [
    {
      id: "FIL-01",
      nome: "Matriz - São Paulo",
      cidade: "São Paulo",
      uf: "SP",
      totalColaboradores: 12
    },
    {
      id: "FIL-02",
      nome: "Filial 1 - Campinas",
      cidade: "Campinas",
      uf: "SP",
      totalColaboradores: 8
    },
    {
      id: "FIL-03",
      nome: "Filial 2 - Rio de Janeiro",
      cidade: "Rio de Janeiro",
      uf: "RJ",
      totalColaboradores: 6
    }
  ],

  escalas: [
    {
      id: "ESC-5X2-COM",
      nome: "Comercial 5x2 (08h às 17h)",
      tipoCiclo: "SEMANAL",
      diasTrabalho: 5,
      diasFolga: 2,
      horarioEntrada: "08:00",
      horarioSaida: "17:00",
      intervaloMinutos: 60,
      jornadaDiariaLiquidaHoras: 8,
      atravessaMeiaNoite: false,
      descricao: "Segunda a Sexta com 1 hora de almoço; folgas aos sábados e domingos."
    },
    {
      id: "ESC-6X1-FAB",
      nome: "Operacional Fábrica 6x1 (06h às 14h20)",
      tipoCiclo: "SEMANAL",
      diasTrabalho: 6,
      diasFolga: 1,
      horarioEntrada: "06:00",
      horarioSaida: "14:20",
      intervaloMinutos: 60,
      jornadaDiariaLiquidaHoras: 7.33,
      atravessaMeiaNoite: false,
      descricao: "Turno matutino com escala de revezamento 6x1 e DSR variável."
    },
    {
      id: "ESC-12X36-DIA",
      nome: "Plantão Diurno 12x36 (07h às 19h)",
      tipoCiclo: "CICLICO_DIAS",
      diasTrabalho: 1,
      diasFolga: 1,
      horarioEntrada: "07:00",
      horarioSaida: "19:00",
      intervaloMinutos: 60,
      jornadaDiariaLiquidaHoras: 11,
      atravessaMeiaNoite: false,
      descricao: "Plantão de 12 horas de trabalho por 36 horas ininterruptas de descanso."
    },
    {
      id: "ESC-12X36-NOT",
      nome: "Plantão Noturno 12x36 (19h às 07h)",
      tipoCiclo: "CICLICO_DIAS",
      diasTrabalho: 1,
      diasFolga: 1,
      horarioEntrada: "19:00",
      horarioSaida: "07:00",
      intervaloMinutos: 60,
      jornadaDiariaLiquidaHoras: 11,
      atravessaMeiaNoite: true,
      horasNoturnasEstimadas: 7,
      descricao: "Plantão noturno com entrada às 19:00 e término no dia civil subsequente às 07:00."
    }
  ],

  funcionarios: [
    {
      id: "FUNC-101",
      matricula: "M101",
      nome: "Colaborador Anonimizado A",
      filialId: "FIL-01",
      cargo: "Analista Financeiro Pleno",
      regime: "MENSALISTA",
      jornadaMensalRef: 200,
      salarioBase: 4800.00,
      escalaId: "ESC-5X2-COM"
    },
    {
      id: "FUNC-102",
      matricula: "M102",
      nome: "Colaborador Anonimizado B",
      filialId: "FIL-01",
      cargo: "Coordenador de Operações",
      regime: "MENSALISTA",
      jornadaMensalRef: 200,
      salarioBase: 6500.00,
      escalaId: "ESC-5X2-COM"
    },
    {
      id: "FUNC-201",
      matricula: "M201",
      nome: "Colaborador Anonimizado C",
      filialId: "FIL-02",
      cargo: "Operador de Máquinas Especializado",
      regime: "HORISTA",
      jornadaMensalRef: 220,
      salarioBase: 3300.00,
      escalaId: "ESC-6X1-FAB"
    },
    {
      id: "FUNC-202",
      matricula: "M202",
      nome: "Colaborador Anonimizado D",
      filialId: "FIL-02",
      cargo: "Técnico de Manutenção Mecânica",
      regime: "HORISTA",
      jornadaMensalRef: 220,
      salarioBase: 3800.00,
      escalaId: "ESC-6X1-FAB"
    },
    {
      id: "FUNC-301",
      matricula: "M301",
      nome: "Colaborador Anonimizado E",
      filialId: "FIL-03",
      cargo: "Controlador de Acesso / Monitoramento",
      regime: "HORISTA",
      jornadaMensalRef: 180,
      salarioBase: 2900.00,
      escalaId: "ESC-12X36-NOT"
    },
    {
      id: "FUNC-302",
      matricula: "M302",
      nome: "Colaborador Anonimizado F",
      filialId: "FIL-03",
      cargo: "Vigilante Operacional",
      regime: "HORISTA",
      jornadaMensalRef: 180,
      salarioBase: 3100.00,
      escalaId: "ESC-12X36-DIA"
    }
  ],

  eventos: [
    {
      codigo: "101",
      descricao: "Salário Base Contratual",
      tipo: "PROVENTO",
      classificacao: "INDEPENDENTE",
      statusRegra: "VALIDADO",
      observacao: "Valor fixo contratual; inalterado pela escala em mensalistas."
    },
    {
      codigo: "102",
      descricao: "Adicional de Insalubridade",
      tipo: "PROVENTO",
      classificacao: "INDEPENDENTE",
      statusRegra: "PENDENTE_HOMOLOGACAO",
      observacao: "Definir se a base é salário mínimo federal ou base contratual."
    },
    {
      codigo: "201",
      descricao: "Horas Extras 50% (Dias Úteis)",
      tipo: "PROVENTO",
      classificacao: "DEPENDENTE",
      statusRegra: "PENDENTE_HOMOLOGACAO",
      observacao: "Depende de sobrejornada planejada na escala e divisor aprovado (200/220)."
    },
    {
      codigo: "202",
      descricao: "Horas Extras 100% (Domingos/Feriados)",
      tipo: "PROVENTO",
      classificacao: "DEPENDENTE",
      statusRegra: "PENDENTE_HOMOLOGACAO",
      observacao: "Aguardando confirmação sobre regras de compensação em escalas 12x36 e 6x1."
    },
    {
      codigo: "203",
      descricao: "Adicional Noturno (22h às 05h)",
      tipo: "PROVENTO",
      classificacao: "DEPENDENTE",
      statusRegra: "PENDENTE_HOMOLOGACAO",
      observacao: "CLT estipula 20%; pendente verificar percentual na CCT da Malemi."
    },
    {
      codigo: "208",
      descricao: "DSR s/ Horas Extras e Adicional Noturno",
      tipo: "PROVENTO",
      classificacao: "DEPENDENTE",
      statusRegra: "PENDENTE_HOMOLOGACAO",
      observacao: "Cálculo proporcional a dias úteis e repousos remunerados do mês corrente."
    },
    {
      codigo: "301",
      descricao: "Trabalho em Data Especial / Eleição",
      tipo: "INFORMATIVO",
      classificacao: "DEPENDENTE",
      statusRegra: "PENDENTE_HOMOLOGACAO",
      observacao: "Aguardando definição sobre folgas compensatórias dobradas."
    }
  ],

  regras: [
    {
      id: "REG-01",
      nome: "Divisor Contratual para Salário-Hora",
      hipotese: "200h para mensalistas, 220h para horistas e 180h para cargos específicos",
      status: "PENDENTE_HOMOLOGACAO",
      impacto: "Altera o valor-hora base de todos os cálculos de horas extras e adicionais."
    },
    {
      id: "REG-02",
      nome: "Adicional Noturno e Hora Ficta",
      hipotese: "20% no intervalo das 22h às 05h com fator de redução 52m30s (1,142857)",
      status: "PENDENTE_HOMOLOGACAO",
      impacto: "Incide em turnos noturnos e plantões 12x36 noturnos."
    },
    {
      id: "REG-03",
      nome: "Trabalho em Domingos e Feriados em Escala 12x36",
      hipotese: "Folga nas 36 horas seguintes compensa o domingo, salvo feriados federais",
      status: "PENDENTE_HOMOLOGACAO",
      impacto: "Determina se haverá pagamento em dobro ou manutenção da folga regular."
    },
    {
      id: "REG-04",
      nome: "Definição dos Componentes de Custo Total",
      hipotese: "Encargos sociais patronais (INSS, FGTS 8%, provisões de férias + 1/3 e 13º salário)",
      status: "PENDENTE_HOMOLOGACAO",
      impacto: "Necessário definir alíquotas do RAT, FAP e Sistema S antes de exibir custo total."
    }
  ]
};
