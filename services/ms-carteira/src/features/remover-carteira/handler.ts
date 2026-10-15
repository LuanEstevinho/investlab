import { CarteiraNaoEncontrada } from "../../domain/erros.js";
import type { CarteiraRepository } from "../../application/ports/CarteiraRepository.js";

export class RemoverCarteiraHandler {
  constructor(private readonly carteiras: CarteiraRepository) {}

  async executar(id: string): Promise<void> {
    if (!(await this.carteiras.remover(id))) throw new CarteiraNaoEncontrada(id);
  }
}
