import { z } from "zod";
import { TIPOS_DE_ATIVO } from "../../domain/Ativo.js";
import type { AtivoRepository } from "../../application/ports/AtivoRepository.js";

export const ListarAtivosQuery = z.object({
  tipo: z.enum(TIPOS_DE_ATIVO).optional(),
});
export type ListarAtivosQuery = z.infer<typeof ListarAtivosQuery>;

export class ListarAtivosHandler {
  constructor(private readonly ativos: AtivoRepository) {}

  async executar(query: ListarAtivosQuery) {
    const lista = await this.ativos.listar(query.tipo ? { tipo: query.tipo } : undefined);
    return lista.map((a) => a.paraSnapshot());
  }
}
