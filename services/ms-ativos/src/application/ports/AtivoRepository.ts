import type { Ativo, TipoDeAtivo } from "../../domain/Ativo.js";

/** Porta de saída (Clean Architecture - Output Port). Implementada em infrastructure/. */
export interface AtivoRepository {
  salvar(ativo: Ativo): Promise<void>;
  obterPorTicker(ticker: string): Promise<Ativo | null>;
  listar(filtro?: { tipo?: TipoDeAtivo }): Promise<Ativo[]>;
  remover(ticker: string): Promise<boolean>;
}
