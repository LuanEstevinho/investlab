import { z } from "zod";
import type { CarteiraRepository } from "../../application/ports/CarteiraRepository.js";

export const ListarCarteirasQuery = z.object({ usuarioId: z.string().min(1) });
export type ListarCarteirasQuery = z.infer<typeof ListarCarteirasQuery>;

export class ListarCarteirasHandler {
  constructor(private readonly carteiras: CarteiraRepository) {}

  async executar(query: ListarCarteirasQuery) {
    const lista = await this.carteiras.listarPorUsuario(query.usuarioId);
    return lista.map((c) => c.paraSnapshot());
  }
}
