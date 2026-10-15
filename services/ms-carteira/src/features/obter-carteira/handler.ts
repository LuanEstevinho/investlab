import { CarteiraNaoEncontrada } from "../../domain/erros.js";
import type { CarteiraRepository } from "../../application/ports/CarteiraRepository.js";

export class ObterCarteiraHandler {
  constructor(private readonly carteiras: CarteiraRepository) {}

  async executar(id: string) {
    const carteira = await this.carteiras.obterPorId(id);
    if (!carteira) throw new CarteiraNaoEncontrada(id);
    return { ...carteira.paraSnapshot(), historico: carteira.historico };
  }
}
