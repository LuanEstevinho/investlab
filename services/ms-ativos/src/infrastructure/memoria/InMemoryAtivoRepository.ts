import type { Ativo, TipoDeAtivo } from "../../domain/Ativo.js";
import type { AtivoRepository } from "../../application/ports/AtivoRepository.js";

/** Adaptador em memória: usado nos testes unitários e no modo local sem MongoDB. */
export class InMemoryAtivoRepository implements AtivoRepository {
  private readonly dados = new Map<string, Ativo>();

  async salvar(ativo: Ativo): Promise<void> {
    this.dados.set(ativo.ticker, ativo);
  }

  async obterPorTicker(ticker: string): Promise<Ativo | null> {
    return this.dados.get(ticker) ?? null;
  }

  async listar(filtro?: { tipo?: TipoDeAtivo }): Promise<Ativo[]> {
    const todos = [...this.dados.values()];
    return filtro?.tipo ? todos.filter((a) => a.tipo === filtro.tipo) : todos;
  }

  async remover(ticker: string): Promise<boolean> {
    return this.dados.delete(ticker);
  }
}
