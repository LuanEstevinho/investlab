import { describe, expect, it } from "vitest";
import { AtualizarPrecosHandler } from "./handler.js";
import { InMemoryCarteiraRepository } from "../../infrastructure/memoria/InMemoryCarteiraRepository.js";
import { Carteira } from "../../domain/Carteira.js";

describe("AtualizarPrecosHandler (consumidor do evento CotacaoAtualizada)", () => {
  it("atualiza só as carteiras que possuem o ativo e é idempotente", async () => {
    const repo = new InMemoryCarteiraRepository();
    const com = Carteira.criar({ usuarioId: "u1", nome: "Com PETR4" });
    com.registrarAporte({ ticker: "PETR4", quantidade: 10, precoCentavos: 3800 });
    const sem = Carteira.criar({ usuarioId: "u2", nome: "Sem PETR4" });
    sem.registrarAporte({ ticker: "VALE3", quantidade: 10, precoCentavos: 6000 });
    await repo.salvar(com);
    await repo.salvar(sem);

    const handler = new AtualizarPrecosHandler(repo);
    const comando = { ticker: "petr4", precoCentavos: 4100, dataReferencia: new Date() };

    expect(await handler.executar(comando)).toEqual({ ticker: "PETR4", carteirasAtualizadas: 1 });
    expect((await repo.obterPorId(com.id))!.patrimonioCentavos).toBe(41000);
    expect((await repo.obterPorId(sem.id))!.patrimonioCentavos).toBe(60000);

    // Reprocessamento da mesma mensagem (at-least-once) não altera o resultado.
    expect(await handler.executar(comando)).toEqual({ ticker: "PETR4", carteirasAtualizadas: 1 });
    expect((await repo.obterPorId(com.id))!.patrimonioCentavos).toBe(41000);
  });
});
