import { z } from "zod";
import { Carteira } from "../../domain/Carteira.js";
import type { CarteiraRepository } from "../../application/ports/CarteiraRepository.js";

export const CriarCarteiraCommand = z.object({
  usuarioId: z.string().min(1).max(64),
  nome: z.string().min(2).max(80),
});
export type CriarCarteiraCommand = z.infer<typeof CriarCarteiraCommand>;

export class CriarCarteiraHandler {
  constructor(private readonly carteiras: CarteiraRepository) {}

  async executar(comando: CriarCarteiraCommand) {
    const carteira = Carteira.criar(comando);
    await this.carteiras.salvar(carteira);
    return carteira.paraSnapshot();
  }
}
