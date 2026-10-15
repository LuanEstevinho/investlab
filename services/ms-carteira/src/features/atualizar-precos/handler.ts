import { z } from "zod";
import type { CarteiraRepository } from "../../application/ports/CarteiraRepository.js";

/**
 * Comando disparado pelo consumidor de eventos (fn-simulacao / ServiceBusTrigger)
 * quando o ms-ativos publica investlab.ativos.cotacao-atualizada.
 */
export const AtualizarPrecosCommand = z.object({
  ticker: z.string().min(3).max(12),
  precoCentavos: z.number().int().positive(),
  dataReferencia: z.coerce.date(),
});
export type AtualizarPrecosCommand = z.infer<typeof AtualizarPrecosCommand>;

export class AtualizarPrecosHandler {
  constructor(private readonly carteiras: CarteiraRepository) {}

  /** Idempotente: reprocessar a mesma mensagem produz o mesmo estado (8.4 do arc42). */
  async executar(comando: AtualizarPrecosCommand) {
    const ticker = comando.ticker.toUpperCase();
    const afetadas = await this.carteiras.listarComAtivo(ticker);
    let atualizadas = 0;
    for (const carteira of afetadas) {
      if (carteira.atualizarPreco(ticker, comando.precoCentavos)) {
        await this.carteiras.salvar(carteira);
        atualizadas++;
      }
    }
    return { ticker, carteirasAtualizadas: atualizadas };
  }
}
