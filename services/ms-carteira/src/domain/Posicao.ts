import { ErroDeDominio } from "./erros.js";

/**
 * Posição virtual de um ativo dentro da carteira (Value Object agregado por Carteira).
 * Valores em centavos inteiros (CV03). Quantidade admite fração (ex.: Tesouro) com 6 casas.
 */
export class Posicao {
  private constructor(
    readonly ticker: string,
    readonly quantidade: number,
    readonly precoMedioCentavos: number,
    readonly precoAtualCentavos: number,
  ) {}

  static nova(ticker: string, quantidade: number, precoCentavos: number): Posicao {
    Posicao.validar(quantidade, precoCentavos);
    return new Posicao(ticker.toUpperCase(), quantidade, precoCentavos, precoCentavos);
  }

  static reidratar(p: { ticker: string; quantidade: number; precoMedioCentavos: number; precoAtualCentavos: number }): Posicao {
    return new Posicao(p.ticker, p.quantidade, p.precoMedioCentavos, p.precoAtualCentavos);
  }

  /** Aporte adicional: recalcula preço médio ponderado (arredondado em centavos). */
  comAporte(quantidade: number, precoCentavos: number): Posicao {
    Posicao.validar(quantidade, precoCentavos);
    const totalAnterior = this.quantidade * this.precoMedioCentavos;
    const totalNovo = quantidade * precoCentavos;
    const novaQuantidade = this.quantidade + quantidade;
    const novoMedio = Math.round((totalAnterior + totalNovo) / novaQuantidade);
    return new Posicao(this.ticker, novaQuantidade, novoMedio, precoCentavos);
  }

  comPrecoAtual(precoCentavos: number): Posicao {
    if (!Number.isInteger(precoCentavos) || precoCentavos <= 0) {
      throw new ErroDeDominio("Preço atual deve ser inteiro positivo em centavos");
    }
    return new Posicao(this.ticker, this.quantidade, this.precoMedioCentavos, precoCentavos);
  }

  get valorAtualCentavos(): number {
    return Math.round(this.quantidade * this.precoAtualCentavos);
  }

  get valorInvestidoCentavos(): number {
    return Math.round(this.quantidade * this.precoMedioCentavos);
  }

  private static validar(quantidade: number, precoCentavos: number) {
    if (!(quantidade > 0)) throw new ErroDeDominio("Quantidade deve ser maior que zero");
    if (!Number.isInteger(precoCentavos) || precoCentavos <= 0) {
      throw new ErroDeDominio("Preço deve ser inteiro positivo em centavos");
    }
  }
}
