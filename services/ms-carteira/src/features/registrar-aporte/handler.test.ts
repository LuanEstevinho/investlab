import { describe, expect, it } from "vitest";
import { RegistrarAporteHandler } from "./handler.js";
import { InMemoryCarteiraRepository } from "../../infrastructure/memoria/InMemoryCarteiraRepository.js";
import { Carteira } from "../../domain/Carteira.js";

describe("RegistrarAporteHandler", () => {
  it("registra aporte e persiste a carteira atualizada", async () => {
    const repo = new InMemoryCarteiraRepository();
    const c = Carteira.criar({ usuarioId: "u1", nome: "Principal" });
    await repo.salvar(c);

    const r = await new RegistrarAporteHandler(repo).executar({
      carteiraId: c.id,
      ticker: "knri11",
      quantidade: 5,
      precoCentavos: 14500,
    });

    expect(r.transacao.ticker).toBe("KNRI11");
    expect(r.carteira.patrimonioCentavos).toBe(72500);
    expect((await repo.obterPorId(c.id))!.posicoes).toHaveLength(1);
  });
});
