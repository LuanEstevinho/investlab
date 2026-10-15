/**
 * Portas de saída do BFF. O BFF não tem banco próprio (padrão BFF): apenas
 * agrega e adapta respostas dos microserviços e da Azure Function para a web.
 */
export interface AtivoResumo {
  ticker: string;
  tipo: string;
  nome: string;
  precoCentavos: number;
  dataReferencia: string;
}

export interface CarteiraResumo {
  id: string;
  usuarioId: string;
  nome: string;
  patrimonioCentavos: number;
  investidoCentavos: number;
  atualizadaEm: string;
  posicoes: Array<{ ticker: string; quantidade: number; precoMedioCentavos: number; precoAtualCentavos: number; valorAtualCentavos: number }>;
}

export interface ParametrosSimulacao {
  capitalInicialCentavos: number;
  aporteMensalCentavos: number;
  meses: number;
  taxaAnualPercentual: number;
}

export interface ResultadoSimulacao {
  parametros: ParametrosSimulacao;
  dataReferencia: string;
  cenarios: Array<{ nome: string; taxaAnualPercentual: number; patrimonioFinalCentavos: number; totalAportadoCentavos: number; rendimentoCentavos: number }>;
}

export interface AtivosClient {
  listar(tipo?: string): Promise<AtivoResumo[]>;
  encaminhar(metodo: string, caminho: string, corpo?: unknown): Promise<{ status: number; corpo: unknown }>;
}

export interface CarteiraClient {
  listarPorUsuario(usuarioId: string): Promise<CarteiraResumo[]>;
  encaminhar(metodo: string, caminho: string, corpo?: unknown): Promise<{ status: number; corpo: unknown }>;
}

export interface SimulacaoClient {
  simular(parametros: ParametrosSimulacao): Promise<ResultadoSimulacao>;
}
