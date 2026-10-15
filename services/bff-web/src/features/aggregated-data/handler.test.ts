import { describe, expect, it } from "vitest";
import { AggregatedDataHandler } from "./handler.js";
import type { AtivosClient, CarteiraClient, SimulacaoClient } from "../../application/ports/clientes.js";

const ativosOk: AtivosClient = {
  listar: async () => [{ ticker: "HGLG11", tipo: "FII", nome: "CSHG Log", precoCentavos: 16050, dataReferencia: "2026-10-14" }],
  encaminhar: async () => ({ status: 200, corpo: {} }),
};
const carteirasOk: CarteiraClient = {
  listarPorUsuario: async () => [
    { id: "c1", usuarioId: "demo", nome: "Principal", patrimonioCentavos: 100000, investidoCentavos: 90000, atualizadaEm: "2026-10-14", posicoes: [] },
  ],
  encaminhar: async () => ({ status: 200, corpo: {} }),
};
const simulacaoOk: SimulacaoClient = {
  simular: async (p) => ({ parametros: p, dataReferencia: "2026-10-14", cenarios: [] }),
};

describe("AggregatedDataHandler", () => {
  it("agrega as três fontes em um único JSON e usa o patrimônio como capital inicial da simulação", async () => {
    const handler = new AggregatedDataHandler(ativosOk, carteirasOk, simulacaoOk);
    const r = await handler.executar({ usuarioId: "demo", aporteMensalCentavos: 50000, meses: 120, taxaAnualPercentual: 10 });

    expect(r.resumo).toEqual({ quantidadeAtivos: 1, quantidadeCarteiras: 1, patrimonioTotalCentavos: 100000, investidoTotalCentavos: 90000 });
    expect(r.simulacao?.parametros.capitalInicialCentavos).toBe(100000);
    expect(r.fontes).toEqual({ ativos: "fulfilled", carteiras: "fulfilled", simulacao: "fulfilled" });
  });

  it("degrada graciosamente quando uma fonte falha", async () => {
    const ativosFalhando: AtivosClient = { ...ativosOk, listar: async () => { throw new Error("timeout"); } };
    const handler = new AggregatedDataHandler(ativosFalhando, carteirasOk, simulacaoOk);
    const r = await handler.executar({ usuarioId: "demo", aporteMensalCentavos: 0, meses: 12, taxaAnualPercentual: 10 });

    expect(r.ativos).toBeNull();
    expect(r.carteiras).not.toBeNull();
    expect(r.fontes.ativos).toBe("rejected");
  });
});
