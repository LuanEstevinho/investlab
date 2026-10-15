import { describe, expect, it } from "vitest";
import { ObterCarteiraHandler } from "./handler.js";
import { InMemoryCarteiraRepository } from "../../infrastructure/memoria/InMemoryCarteiraRepository.js";
import { Carteira } from "../../domain/Carteira.js";
import { CarteiraNaoEncontrada } from "../../domain/erros.js";

describe("ObterCarteiraHandler", () => {
  it("retorna carteira com posições e histórico", async () => {
    const repo = new InMemoryCarteiraRepository();
    const c = Carteira.criar({ usuarioId: "u1", nome: "Principal" });
    c.registrarAporte({ ticker: "MXRF11", quantidade: 50, precoCentavos: 1010 });
    await repo.salvar(c);

    const r = await new ObterCarteiraHandler(repo).executar(c.id);
    expect(r.posicoes).toHaveLength(1);
    expect(r.historico).toHaveLength(1);
  });

  it("falha para id inexistente", async () => {
    await expect(new ObterCarteiraHandler(new InMemoryCarteiraRepository()).executar("x")).rejects.toBeInstanceOf(
      CarteiraNaoEncontrada,
    );
  });
});
