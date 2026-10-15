import { describe, expect, it } from "vitest";
import { CriarCarteiraHandler } from "./handler.js";
import { InMemoryCarteiraRepository } from "../../infrastructure/memoria/InMemoryCarteiraRepository.js";

describe("CriarCarteiraHandler", () => {
  it("cria carteira vazia para o usuário", async () => {
    const repo = new InMemoryCarteiraRepository();
    const criada = await new CriarCarteiraHandler(repo).executar({ usuarioId: "u1", nome: "Aposentadoria" });
    expect(criada.patrimonioCentavos).toBe(0);
    expect(await repo.obterPorId(criada.id)).not.toBeNull();
  });
});
