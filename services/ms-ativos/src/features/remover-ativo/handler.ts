import { AtivoNaoEncontrado } from "../../domain/erros.js";
import type { AtivoRepository } from "../../application/ports/AtivoRepository.js";

export class RemoverAtivoHandler {
  constructor(private readonly ativos: AtivoRepository) {}

  async executar(ticker: string): Promise<void> {
    const removido = await this.ativos.remover(ticker.toUpperCase());
    if (!removido) throw new AtivoNaoEncontrado(ticker);
  }
}
