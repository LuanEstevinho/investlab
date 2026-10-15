import { z } from "zod";
import { AtivoNaoEncontrado } from "../../domain/erros.js";
import type { AtivoRepository } from "../../application/ports/AtivoRepository.js";
import type { EventPublisher } from "../../application/ports/EventPublisher.js";

export const AtualizarCotacaoCommand = z.object({
  ticker: z.string().min(3).max(12),
  precoCentavos: z.number().int().positive(),
  dataReferencia: z.coerce.date(),
});
export type AtualizarCotacaoCommand = z.infer<typeof AtualizarCotacaoCommand>;

/**
 * Fatia que materializa a Arquitetura Orientada a Eventos:
 * altera o estado do ativo e publica CotacaoAtualizada no Service Bus.
 * A persistência acontece ANTES da publicação (at-least-once; consumidores são idempotentes).
 */
export class AtualizarCotacaoHandler {
  constructor(
    private readonly ativos: AtivoRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(comando: AtualizarCotacaoCommand) {
    const ticker = comando.ticker.toUpperCase();
    const ativo = await this.ativos.obterPorTicker(ticker);
    if (!ativo) throw new AtivoNaoEncontrado(ticker);

    const evento = ativo.atualizarCotacao(comando.precoCentavos, comando.dataReferencia);
    await this.ativos.salvar(ativo);
    await this.eventos.publicar(evento);
    return ativo.paraSnapshot();
  }
}
