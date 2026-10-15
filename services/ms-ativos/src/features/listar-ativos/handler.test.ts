import { describe, expect, it } from "vitest";
import { ListarAtivosHandler } from "./handler.js";
import { InMemoryAtivoRepository } from "../../infrastructure/memoria/InMemoryAtivoRepository.js";
import { Ativo } from "../../domain/Ativo.js";

const hoje = new Date("2026-10-14T00:00:00Z");

describe("ListarAtivosHandler", () => {
  it("lista todos ou filtra por tipo", async () => {
    const repo = new InMemoryAtivoRepository();
    await repo.salvar(Ativo.criar({ ticker: "HGLG11", tipo: "FII", nome: "CSHG Log", precoCentavos: 16050, dataReferencia: hoje }));
    await repo.salvar(Ativo.criar({ ticker: "PETR4", tipo: "ACAO", nome: "Petrobras", precoCentavos: 3800, dataReferencia: hoje }));
    const handler = new ListarAtivosHandler(repo);

    expect(await handler.executar({})).toHaveLength(2);
    expect((await handler.executar({ tipo: "FII" })).map((a) => a.ticker)).toEqual(["HGLG11"]);
  });
});
