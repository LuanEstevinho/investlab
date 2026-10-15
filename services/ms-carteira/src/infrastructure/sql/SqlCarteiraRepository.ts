import sql from "mssql";
import { Carteira, type Transacao } from "../../domain/Carteira.js";
import { Posicao } from "../../domain/Posicao.js";
import type { CarteiraRepository } from "../../application/ports/CarteiraRepository.js";

/**
 * Adaptador de persistência para Azure SQL Database (Frameworks & Drivers).
 * Database per Service: o schema "carteira" pertence só a este microserviço.
 * Esquema em services/ms-carteira/sql/schema.sql.
 */
export class SqlCarteiraRepository implements CarteiraRepository {
  private constructor(private readonly pool: sql.ConnectionPool) {}

  static async conectar(connectionString: string): Promise<SqlCarteiraRepository> {
    const pool = await new sql.ConnectionPool(connectionString).connect();
    return new SqlCarteiraRepository(pool);
  }

  async salvar(carteira: Carteira): Promise<void> {
    const tx = new sql.Transaction(this.pool);
    await tx.begin();
    try {
      const s = carteira.paraSnapshot();
      await new sql.Request(tx)
        .input("id", sql.UniqueIdentifier, s.id)
        .input("usuarioId", sql.NVarChar(64), s.usuarioId)
        .input("nome", sql.NVarChar(80), s.nome)
        .input("atualizadaEm", sql.DateTime2, new Date(s.atualizadaEm))
        .query(`MERGE carteira.Carteira AS alvo
                USING (SELECT @id AS Id) AS origem ON alvo.Id = origem.Id
                WHEN MATCHED THEN UPDATE SET Nome = @nome, AtualizadaEm = @atualizadaEm
                WHEN NOT MATCHED THEN INSERT (Id, UsuarioId, Nome, AtualizadaEm) VALUES (@id, @usuarioId, @nome, @atualizadaEm);`);

      await new sql.Request(tx).input("id", sql.UniqueIdentifier, s.id).query("DELETE FROM carteira.Posicao WHERE CarteiraId = @id");
      for (const p of s.posicoes) {
        await new sql.Request(tx)
          .input("id", sql.UniqueIdentifier, s.id)
          .input("ticker", sql.NVarChar(12), p.ticker)
          .input("qtd", sql.Decimal(18, 6), p.quantidade)
          .input("medio", sql.BigInt, p.precoMedioCentavos)
          .input("atual", sql.BigInt, p.precoAtualCentavos)
          .query(`INSERT INTO carteira.Posicao (CarteiraId, Ticker, Quantidade, PrecoMedioCentavos, PrecoAtualCentavos)
                  VALUES (@id, @ticker, @qtd, @medio, @atual)`);
      }
      for (const t of carteira.historico) {
        await new sql.Request(tx)
          .input("tid", sql.UniqueIdentifier, t.id)
          .input("id", sql.UniqueIdentifier, s.id)
          .input("ticker", sql.NVarChar(12), t.ticker)
          .input("qtd", sql.Decimal(18, 6), t.quantidade)
          .input("preco", sql.BigInt, t.precoCentavos)
          .input("data", sql.DateTime2, t.data)
          .query(`IF NOT EXISTS (SELECT 1 FROM carteira.Transacao WHERE Id = @tid)
                  INSERT INTO carteira.Transacao (Id, CarteiraId, Ticker, Quantidade, PrecoCentavos, Data)
                  VALUES (@tid, @id, @ticker, @qtd, @preco, @data)`);
      }
      await tx.commit();
    } catch (erro) {
      await tx.rollback();
      throw erro;
    }
  }

  async obterPorId(id: string): Promise<Carteira | null> {
    const [c] = await this.carregar("WHERE c.Id = @p", (r) => r.input("p", sql.UniqueIdentifier, id));
    return c ?? null;
  }

  async listarPorUsuario(usuarioId: string): Promise<Carteira[]> {
    return this.carregar("WHERE c.UsuarioId = @p", (r) => r.input("p", sql.NVarChar(64), usuarioId));
  }

  async listarComAtivo(ticker: string): Promise<Carteira[]> {
    return this.carregar(
      "WHERE c.Id IN (SELECT CarteiraId FROM carteira.Posicao WHERE Ticker = @p)",
      (r) => r.input("p", sql.NVarChar(12), ticker),
    );
  }

  async remover(id: string): Promise<boolean> {
    const r = await this.pool.request().input("id", sql.UniqueIdentifier, id).query("DELETE FROM carteira.Carteira WHERE Id = @id");
    return (r.rowsAffected[0] ?? 0) > 0;
  }

  private async carregar(where: string, bind: (r: sql.Request) => sql.Request): Promise<Carteira[]> {
    const cabecalhos = await bind(this.pool.request()).query<{ Id: string; UsuarioId: string; Nome: string; AtualizadaEm: Date }>(
      `SELECT c.Id, c.UsuarioId, c.Nome, c.AtualizadaEm FROM carteira.Carteira c ${where}`,
    );
    const carteiras: Carteira[] = [];
    for (const row of cabecalhos.recordset) {
      const posicoes = await this.pool
        .request()
        .input("id", sql.UniqueIdentifier, row.Id)
        .query<{ Ticker: string; Quantidade: number; PrecoMedioCentavos: number; PrecoAtualCentavos: number }>(
          "SELECT Ticker, Quantidade, PrecoMedioCentavos, PrecoAtualCentavos FROM carteira.Posicao WHERE CarteiraId = @id",
        );
      const transacoes = await this.pool
        .request()
        .input("id", sql.UniqueIdentifier, row.Id)
        .query<{ Id: string; Ticker: string; Quantidade: number; PrecoCentavos: number; Data: Date }>(
          "SELECT Id, Ticker, Quantidade, PrecoCentavos, Data FROM carteira.Transacao WHERE CarteiraId = @id ORDER BY Data",
        );
      carteiras.push(
        Carteira.reidratar({
          id: row.Id.toLowerCase(),
          usuarioId: row.UsuarioId,
          nome: row.Nome,
          atualizadaEm: row.AtualizadaEm,
          posicoes: posicoes.recordset.map((p) =>
            Posicao.reidratar({
              ticker: p.Ticker,
              quantidade: Number(p.Quantidade),
              precoMedioCentavos: Number(p.PrecoMedioCentavos),
              precoAtualCentavos: Number(p.PrecoAtualCentavos),
            }),
          ),
          transacoes: transacoes.recordset.map(
            (t): Transacao => ({
              id: t.Id.toLowerCase(),
              ticker: t.Ticker,
              quantidade: Number(t.Quantidade),
              precoCentavos: Number(t.PrecoCentavos),
              data: t.Data,
            }),
          ),
        }),
      );
    }
    return carteiras;
  }
}
