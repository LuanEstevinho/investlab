import { AtivoNaoEncontrado } from "../../domain/erros.js";
import type { AtivoRepository } from "../../application/ports/AtivoRepository.js";

export class ObterAtivoHandler {
  constructor(private readonly ativos: AtivoRepository) {}

  async executar(ticker: string) {
    const ativo = await this.ativos.obterPorTicker(ticker.toUpperCase());
    if (!ativo) throw new AtivoNaoEncontrado(ticker);
    return ativo.paraSnapshot();
  }
}
