/**
 * Motor de simulação de patrimônio (Simulation Engine da Entrega 1), agora
 * executado como função serverless. Código puro: sem HTTP, sem SDK do Azure.
 * Determinístico (Q01) e em centavos inteiros (Q02).
 */
export interface ParametrosSimulacao {
  capitalInicialCentavos: number;
  aporteMensalCentavos: number;
  meses: number;
  taxaAnualPercentual: number;
}

export interface Cenario {
  nome: "conservador" | "base" | "otimista";
  taxaAnualPercentual: number;
  patrimonioFinalCentavos: number;
  totalAportadoCentavos: number;
  rendimentoCentavos: number;
  serieAnual: Array<{ ano: number; patrimonioCentavos: number }>;
}

export interface ResultadoSimulacao {
  parametros: ParametrosSimulacao;
  dataReferencia: string;
  cenarios: Cenario[];
}

const AJUSTE_CENARIO: Record<Cenario["nome"], number> = { conservador: -2, base: 0, otimista: 2 };

export function validarParametros(p: ParametrosSimulacao): string | null {
  if (!Number.isInteger(p.capitalInicialCentavos) || p.capitalInicialCentavos < 0) return "capitalInicialCentavos deve ser inteiro >= 0";
  if (!Number.isInteger(p.aporteMensalCentavos) || p.aporteMensalCentavos < 0) return "aporteMensalCentavos deve ser inteiro >= 0";
  if (!Number.isInteger(p.meses) || p.meses < 1 || p.meses > 600) return "meses deve estar entre 1 e 600";
  if (!(p.taxaAnualPercentual > 0) || p.taxaAnualPercentual > 100) return "taxaAnualPercentual deve estar entre 0 e 100";
  return null;
}

export function taxaMensal(taxaAnualPercentual: number): number {
  return Math.pow(1 + taxaAnualPercentual / 100, 1 / 12) - 1;
}

/** Juros compostos com aporte no fim de cada mês; arredonda a cada passo em centavos. */
export function projetar(p: ParametrosSimulacao, taxaAnualPercentual: number): Omit<Cenario, "nome" | "taxaAnualPercentual"> {
  const i = taxaMensal(taxaAnualPercentual);
  let patrimonio = p.capitalInicialCentavos;
  const serieAnual: Cenario["serieAnual"] = [];
  for (let mes = 1; mes <= p.meses; mes++) {
    patrimonio = Math.round(patrimonio * (1 + i)) + p.aporteMensalCentavos;
    if (mes % 12 === 0 || mes === p.meses) serieAnual.push({ ano: Math.ceil(mes / 12), patrimonioCentavos: patrimonio });
  }
  const totalAportado = p.capitalInicialCentavos + p.aporteMensalCentavos * p.meses;
  return { patrimonioFinalCentavos: patrimonio, totalAportadoCentavos: totalAportado, rendimentoCentavos: patrimonio - totalAportado, serieAnual };
}

export function simular(p: ParametrosSimulacao, dataReferencia = new Date()): ResultadoSimulacao {
  const erro = validarParametros(p);
  if (erro) throw new Error(erro);
  const cenarios = (Object.keys(AJUSTE_CENARIO) as Cenario["nome"][]).map((nome) => {
    const taxa = Math.max(0.01, p.taxaAnualPercentual + AJUSTE_CENARIO[nome]);
    return { nome, taxaAnualPercentual: taxa, ...projetar(p, taxa) };
  });
  return { parametros: p, dataReferencia: dataReferencia.toISOString(), cenarios };
}
