import { MongoClient, type Collection } from "mongodb";
import { Ativo, type TipoDeAtivo } from "../../domain/Ativo.js";
import { Dinheiro } from "../../domain/Dinheiro.js";
import type { AtivoRepository } from "../../application/ports/AtivoRepository.js";

interface AtivoDocumento {
  _id: string;
  tipo: TipoDeAtivo;
  nome: string;
  precoCentavos: number;
  dataReferencia: Date;
}

/**
 * Adaptador de persistência (Frameworks & Drivers) para MongoDB Atlas.
 * Database per Service: a base "investlab_ativos" pertence só a este microserviço.
 */
export class MongoAtivoRepository implements AtivoRepository {
  private constructor(private readonly colecao: Collection<AtivoDocumento>) {}

  static async conectar(uri: string, database = "investlab_ativos"): Promise<MongoAtivoRepository> {
    const cliente = new MongoClient(uri);
    await cliente.connect();
    const colecao = cliente.db(database).collection<AtivoDocumento>("ativos");
    await colecao.createIndex({ tipo: 1 });
    return new MongoAtivoRepository(colecao);
  }

  async salvar(ativo: Ativo): Promise<void> {
    const s = ativo.paraSnapshot();
    await this.colecao.updateOne(
      { _id: s.ticker },
      { $set: { tipo: s.tipo, nome: s.nome, precoCentavos: s.precoCentavos, dataReferencia: new Date(s.dataReferencia) } },
      { upsert: true },
    );
  }

  async obterPorTicker(ticker: string): Promise<Ativo | null> {
    const doc = await this.colecao.findOne({ _id: ticker });
    return doc ? MongoAtivoRepository.paraEntidade(doc) : null;
  }

  async listar(filtro?: { tipo?: TipoDeAtivo }): Promise<Ativo[]> {
    const docs = await this.colecao.find(filtro?.tipo ? { tipo: filtro.tipo } : {}).sort({ _id: 1 }).toArray();
    return docs.map(MongoAtivoRepository.paraEntidade);
  }

  async remover(ticker: string): Promise<boolean> {
    const r = await this.colecao.deleteOne({ _id: ticker });
    return r.deletedCount === 1;
  }

  private static paraEntidade(doc: AtivoDocumento): Ativo {
    return Ativo.reidratar({
      ticker: doc._id,
      tipo: doc.tipo,
      nome: doc.nome,
      preco: Dinheiro.deCentavos(doc.precoCentavos),
      dataReferencia: doc.dataReferencia,
    });
  }
}
