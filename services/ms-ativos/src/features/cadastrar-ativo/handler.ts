import { z } from "zod";
import { Ativo, TIPOS_DE_ATIVO } from "../../domain/Ativo.js";
import { AtivoJaCadastrado } from "../../domain/erros.js";
import type { AtivoRepository } from "../../application/ports/AtivoRepository.js";

export const CadastrarAtivoCommand = z.object({
  ticker: z.string().min(3).max(12),
  tipo: z.enum(TIPOS_DE_ATIVO),
  nome: z.string().min(2).max(120),
  precoCentavos: z.number().int().positive(),
  dataReferencia: z.coerce.date().optional(),
});
export type CadastrarAtivoCommand = z.infer<typeof CadastrarAtivoCommand>;

/** Caso de uso (Use Case / Interactor) da fatia "cadastrar ativo". */
export class CadastrarAtivoHandler {
  constructor(private readonly ativos: AtivoRepository) {}

  async executar(comando: CadastrarAtivoCommand) {
    const ativo = Ativo.criar({
      ...comando,
      dataReferencia: comando.dataReferencia ?? new Date(),
    });
    const existente = await this.ativos.obterPorTicker(ativo.ticker);
    if (existente) throw new AtivoJaCadastrado(ativo.ticker);
    await this.ativos.salvar(ativo);
    return ativo.paraSnapshot();
  }
}
