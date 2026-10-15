import { Dinheiro } from "./Dinheiro.js";
import { ErroDeDominio } from "./erros.js";
import type { CotacaoAtualizada } from "./eventos.js";

export const TIPOS_DE_ATIVO = ["FII", "ACAO", "TESOURO", "CDB", "LCI", "LCA"] as const;
export type TipoDeAtivo = (typeof TIPOS_DE_ATIVO)[number];

const TICKER_VALIDO = /^[A-Z0-9]{3,12}$/;

export interface AtivoProps {
  ticker: string;
  tipo: TipoDeAtivo;
  nome: string;
  preco: Dinheiro;
  dataReferencia: Date;
}

/**
 * Entidade central do domínio de Ativos (Clean Architecture - Entities).
 * Não conhece HTTP, MongoDB nem Service Bus.
 */
export class Ativo {
  private constructor(private props: AtivoProps) {}

  static criar(entrada: {
    ticker: string;
    tipo: TipoDeAtivo;
    nome: string;
    precoCentavos: number;
    dataReferencia: Date;
  }): Ativo {
    const ticker = entrada.ticker.trim().toUpperCase();
    if (!TICKER_VALIDO.test(ticker)) {
      throw new ErroDeDominio(`Ticker inválido: ${entrada.ticker}`);
    }
    if (!TIPOS_DE_ATIVO.includes(entrada.tipo)) {
      throw new ErroDeDominio(`Tipo de ativo inválido: ${entrada.tipo}`);
    }
    if (entrada.nome.trim().length < 2) {
      throw new ErroDeDominio("Nome do ativo deve ter ao menos 2 caracteres");
    }
    const preco = Dinheiro.deCentavos(entrada.precoCentavos);
    if (preco.centavos === 0) {
      throw new ErroDeDominio("Preço do ativo deve ser maior que zero");
    }
    return new Ativo({
      ticker,
      tipo: entrada.tipo,
      nome: entrada.nome.trim(),
      preco,
      dataReferencia: entrada.dataReferencia,
    });
  }

  /** Reconstrói a entidade a partir da persistência, sem revalidar regras de criação. */
  static reidratar(props: AtivoProps): Ativo {
    return new Ativo({ ...props });
  }

  get ticker(): string {
    return this.props.ticker;
  }
  get tipo(): TipoDeAtivo {
    return this.props.tipo;
  }
  get nome(): string {
    return this.props.nome;
  }
  get preco(): Dinheiro {
    return this.props.preco;
  }
  get dataReferencia(): Date {
    return this.props.dataReferencia;
  }

  /**
   * Atualiza a cotação respeitando ADR-06: a data de referência nunca retrocede,
   * garantindo que a última base válida não seja substituída por dado antigo (Q05).
   * Retorna o evento de integração a ser publicado (EDA).
   */
  atualizarCotacao(novoPrecoCentavos: number, dataReferencia: Date): CotacaoAtualizada {
    const novoPreco = Dinheiro.deCentavos(novoPrecoCentavos);
    if (novoPreco.centavos === 0) {
      throw new ErroDeDominio("Preço do ativo deve ser maior que zero");
    }
    if (dataReferencia.getTime() < this.props.dataReferencia.getTime()) {
      throw new ErroDeDominio(
        "Data de referência anterior à última cotação válida; atualização ignorada",
      );
    }
    const precoAnterior = this.props.preco;
    this.props = { ...this.props, preco: novoPreco, dataReferencia };
    return {
      tipo: "investlab.ativos.cotacao-atualizada",
      versao: 1,
      ocorridoEm: new Date().toISOString(),
      dados: {
        ticker: this.props.ticker,
        tipo: this.props.tipo,
        precoAnteriorCentavos: precoAnterior.centavos,
        precoCentavos: novoPreco.centavos,
        dataReferencia: dataReferencia.toISOString(),
      },
    };
  }

  paraSnapshot() {
    return {
      ticker: this.props.ticker,
      tipo: this.props.tipo,
      nome: this.props.nome,
      precoCentavos: this.props.preco.centavos,
      dataReferencia: this.props.dataReferencia.toISOString(),
    };
  }
}
