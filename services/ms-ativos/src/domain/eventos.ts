/**
 * Eventos de integração publicados pelo ms-ativos no Azure Service Bus.
 * Contrato versionado em contracts/events/cotacao-atualizada.v1.json.
 */
export interface EventoDeIntegracao<TTipo extends string, TDados> {
  readonly tipo: TTipo;
  readonly versao: 1;
  readonly ocorridoEm: string;
  readonly dados: TDados;
}

export type CotacaoAtualizada = EventoDeIntegracao<
  "investlab.ativos.cotacao-atualizada",
  {
    ticker: string;
    tipo: string;
    precoAnteriorCentavos: number;
    precoCentavos: number;
    dataReferencia: string;
  }
>;

export type EventoAtivos = CotacaoAtualizada;
