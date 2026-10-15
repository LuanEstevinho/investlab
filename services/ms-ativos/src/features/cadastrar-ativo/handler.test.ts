import { describe, expect, it } from "vitest";
import { CadastrarAtivoHandler } from "./handler.js";
import { InMemoryAtivoRepository } from "../../infrastructure/memoria/InMemoryAtivoRepository.js";
import { AtivoJaCadastrado, ErroDeDominio } from "../../domain/erros.js";

describe("CadastrarAtivoHandler", () => {
  it("cadastra um ativo válido normalizando o ticker", async () => {
    const repo = new InMemoryAtivoRepository();
    const handler = new CadastrarAtivoHandler(repo);

    const criado = await handler.executar({
      ticker: " hglg11 ",
      tipo: "FII",
      nome: "CSHG Logística",
      precoCentavos: 16050,
    });

    expect(criado.ticker).toBe("HGLG11");
    expect(await repo.obterPorTicker("HGLG11")).not.toBeNull();
  });

  it("rejeita ticker duplicado", async () => {
    const repo = new InMemoryAtivoRepository();
    const handler = new CadastrarAtivoHandler(repo);
    const comando = { ticker: "PETR4", tipo: "ACAO" as const, nome: "Petrobras PN", precoCentavos: 3800 };
    await handler.executar(comando);

    await expect(handler.executar(comando)).rejects.toBeInstanceOf(AtivoJaCadastrado);
  });

  it("rejeita preço zero (regra de domínio)", async () => {
    const handler = new CadastrarAtivoHandler(new InMemoryAtivoRepository());
    await expect(
      handler.executar({ ticker: "XPML11", tipo: "FII", nome: "XP Malls", precoCentavos: 0 }),
    ).rejects.toBeInstanceOf(ErroDeDominio);
  });
});
