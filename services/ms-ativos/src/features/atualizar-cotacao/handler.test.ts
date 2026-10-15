import { describe, expect, it } from "vitest";
import { AtualizarCotacaoHandler } from "./handler.js";
import { InMemoryAtivoRepository } from "../../infrastructure/memoria/InMemoryAtivoRepository.js";
import { Ativo } from "../../domain/Ativo.js";
import { ErroDeDominio } from "../../domain/erros.js";
import type { EventPublisher } from "../../application/ports/EventPublisher.js";
import type { EventoAtivos } from "../../domain/eventos.js";

class EventPublisherEspiao implements EventPublisher {
  publicados: EventoAtivos[] = [];
  async publicar(evento: EventoAtivos) {
    this.publicados.push(evento);
  }
}

async function cenario() {
  const repo = new InMemoryAtivoRepository();
  await repo.salvar(
    Ativo.criar({ ticker: "KNRI11", tipo: "FII", nome: "Kinea Renda", precoCentavos: 14500, dataReferencia: new Date("2026-10-10") }),
  );
  const eventos = new EventPublisherEspiao();
  return { repo, eventos, handler: new AtualizarCotacaoHandler(repo, eventos) };
}

describe("AtualizarCotacaoHandler", () => {
  it("atualiza o preço e publica CotacaoAtualizada", async () => {
    const { repo, eventos, handler } = await cenario();
    await handler.executar({ ticker: "knri11", precoCentavos: 14780, dataReferencia: new Date("2026-10-14") });

    expect((await repo.obterPorTicker("KNRI11"))!.preco.centavos).toBe(14780);
    expect(eventos.publicados).toHaveLength(1);
    expect(eventos.publicados[0]).toMatchObject({
      tipo: "investlab.ativos.cotacao-atualizada",
      dados: { ticker: "KNRI11", precoAnteriorCentavos: 14500, precoCentavos: 14780 },
    });
  });

  it("não substitui a última base válida por cotação mais antiga (Q05) e não publica evento", async () => {
    const { repo, eventos, handler } = await cenario();
    await expect(
      handler.executar({ ticker: "KNRI11", precoCentavos: 100, dataReferencia: new Date("2026-01-01") }),
    ).rejects.toBeInstanceOf(ErroDeDominio);

    expect((await repo.obterPorTicker("KNRI11"))!.preco.centavos).toBe(14500);
    expect(eventos.publicados).toHaveLength(0);
  });
});
