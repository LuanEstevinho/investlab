import { describe, expect, it } from "vitest";
import { ObterAtivoHandler } from "./handler.js";
import { InMemoryAtivoRepository } from "../../infrastructure/memoria/InMemoryAtivoRepository.js";
import { Ativo } from "../../domain/Ativo.js";
import { AtivoNaoEncontrado } from "../../domain/erros.js";

describe("ObterAtivoHandler", () => {
  it("retorna o ativo ignorando caixa do ticker", async () => {
    const repo = new InMemoryAtivoRepository();
    await repo.salvar(Ativo.criar({ ticker: "MXRF11", tipo: "FII", nome: "Maxi Renda", precoCentavos: 1012, dataReferencia: new Date() }));
    const resultado = await new ObterAtivoHandler(repo).executar("mxrf11");
    expect(resultado.nome).toBe("Maxi Renda");
  });

  it("falha com AtivoNaoEncontrado", async () => {
    await expect(new ObterAtivoHandler(new InMemoryAtivoRepository()).executar("ZZZZ3")).rejects.toBeInstanceOf(
      AtivoNaoEncontrado,
    );
  });
});
