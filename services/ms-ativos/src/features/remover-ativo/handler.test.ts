import { describe, expect, it } from "vitest";
import { RemoverAtivoHandler } from "./handler.js";
import { InMemoryAtivoRepository } from "../../infrastructure/memoria/InMemoryAtivoRepository.js";
import { Ativo } from "../../domain/Ativo.js";
import { AtivoNaoEncontrado } from "../../domain/erros.js";

describe("RemoverAtivoHandler", () => {
  it("remove ativo existente", async () => {
    const repo = new InMemoryAtivoRepository();
    await repo.salvar(Ativo.criar({ ticker: "BBAS3", tipo: "ACAO", nome: "Banco do Brasil", precoCentavos: 2900, dataReferencia: new Date() }));
    await new RemoverAtivoHandler(repo).executar("bbas3");
    expect(await repo.obterPorTicker("BBAS3")).toBeNull();
  });

  it("falha ao remover inexistente", async () => {
    await expect(new RemoverAtivoHandler(new InMemoryAtivoRepository()).executar("NADA3")).rejects.toBeInstanceOf(
      AtivoNaoEncontrado,
    );
  });
});
