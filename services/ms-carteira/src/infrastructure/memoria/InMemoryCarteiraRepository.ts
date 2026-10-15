import type { Carteira } from "../../domain/Carteira.js";
import type { CarteiraRepository } from "../../application/ports/CarteiraRepository.js";

export class InMemoryCarteiraRepository implements CarteiraRepository {
  private readonly dados = new Map<string, Carteira>();

  async salvar(carteira: Carteira): Promise<void> {
    this.dados.set(carteira.id, carteira);
  }
  async obterPorId(id: string): Promise<Carteira | null> {
    return this.dados.get(id) ?? null;
  }
  async listarPorUsuario(usuarioId: string): Promise<Carteira[]> {
    return [...this.dados.values()].filter((c) => c.usuarioId === usuarioId);
  }
  async listarComAtivo(ticker: string): Promise<Carteira[]> {
    return [...this.dados.values()].filter((c) => c.posicoes.some((p) => p.ticker === ticker));
  }
  async remover(id: string): Promise<boolean> {
    return this.dados.delete(id);
  }
}
