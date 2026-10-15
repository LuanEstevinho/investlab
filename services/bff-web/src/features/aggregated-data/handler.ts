import { z } from "zod";
import type { AtivosClient, CarteiraClient, SimulacaoClient } from "../../application/ports/clientes.js";

export const AggregatedDataQuery = z.object({
  usuarioId: z.string().min(1).default("demo"),
  aporteMensalCentavos: z.coerce.number().int().nonnegative().default(50000),
  meses: z.coerce.number().int().positive().max(600).default(120),
  taxaAnualPercentual: z.coerce.number().positive().max(100).default(10),
});
export type AggregatedDataQuery = z.infer<typeof AggregatedDataQuery>;

/**
 * Endpoint obrigatório GET /aggregated-data: consome ms-ativos, ms-carteira e a
 * Azure Function de simulação em paralelo e devolve um único JSON para o microfrontend.
 * Falha parcial não derruba a resposta (8.4): a fonte indisponível vem como null com o erro.
 */
export class AggregatedDataHandler {
  constructor(
    private readonly ativos: AtivosClient,
    private readonly carteiras: CarteiraClient,
    private readonly simulacao: SimulacaoClient,
  ) {}

  async executar(query: AggregatedDataQuery) {
    const [ativos, carteiras] = await Promise.allSettled([this.ativos.listar(), this.carteiras.listarPorUsuario(query.usuarioId)]);

    const listaCarteiras = carteiras.status === "fulfilled" ? carteiras.value : [];
    const patrimonioAtual = listaCarteiras.reduce((s, c) => s + c.patrimonioCentavos, 0);

    const simulacao = await Promise.allSettled([
      this.simulacao.simular({
        capitalInicialCentavos: patrimonioAtual,
        aporteMensalCentavos: query.aporteMensalCentavos,
        meses: query.meses,
        taxaAnualPercentual: query.taxaAnualPercentual,
      }),
    ]).then(([r]) => r);

    return {
      geradoEm: new Date().toISOString(),
      usuarioId: query.usuarioId,
      ativos: AggregatedDataHandler.valorOuNulo(ativos),
      carteiras: AggregatedDataHandler.valorOuNulo(carteiras),
      resumo: {
        quantidadeAtivos: ativos.status === "fulfilled" ? ativos.value.length : null,
        quantidadeCarteiras: listaCarteiras.length,
        patrimonioTotalCentavos: patrimonioAtual,
        investidoTotalCentavos: listaCarteiras.reduce((s, c) => s + c.investidoCentavos, 0),
      },
      simulacao: AggregatedDataHandler.valorOuNulo(simulacao),
      fontes: {
        ativos: ativos.status,
        carteiras: carteiras.status,
        simulacao: simulacao.status,
      },
    };
  }

  private static valorOuNulo<T>(r: PromiseSettledResult<T>): T | null {
    if (r.status === "rejected") {
      console.warn(JSON.stringify({ nivel: "warn", operacao: "aggregated-data.fonte-indisponivel", motivo: String(r.reason) }));
      return null;
    }
    return r.value;
  }
}
