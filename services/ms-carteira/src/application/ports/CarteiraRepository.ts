import type { Carteira } from "../../domain/Carteira.js";

/** Porta de saída implementada por SqlCarteiraRepository (Azure SQL) e InMemoryCarteiraRepository. */
export interface CarteiraRepository {
  salvar(carteira: Carteira): Promise<void>;
  obterPorId(id: string): Promise<Carteira | null>;
  listarPorUsuario(usuarioId: string): Promise<Carteira[]>;
  listarComAtivo(ticker: string): Promise<Carteira[]>;
  remover(id: string): Promise<boolean>;
}
