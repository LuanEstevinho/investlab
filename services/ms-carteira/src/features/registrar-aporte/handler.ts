import { z } from "zod";
import { CarteiraNaoEncontrada } from "../../domain/erros.js";
import type { CarteiraRepository } from "../../application/ports/CarteiraRepository.js";

export const RegistrarAporteCommand = z.object({
  carteiraId: z.string().min(1),
  ticker: z.string().min(3).max(12),
  quantidade: z.number().positive(),
  precoCentavos: z.number().int().positive(),
  data: z.coerce.date().optional(),
});
export type RegistrarAporteCommand = z.infer<typeof RegistrarAporteCommand>;

export class RegistrarAporteHandler {
  constructor(private readonly carteiras: CarteiraRepository) {}

  async executar(comando: RegistrarAporteCommand) {
    const carteira = await this.carteiras.obterPorId(comando.carteiraId);
    if (!carteira) throw new CarteiraNaoEncontrada(comando.carteiraId);
    const transacao = carteira.registrarAporte(comando);
    await this.carteiras.salvar(carteira);
    return { transacao, carteira: carteira.paraSnapshot() };
  }
}
