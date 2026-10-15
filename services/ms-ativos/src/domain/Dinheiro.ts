import { ErroDeDominio } from "./erros.js";

/**
 * Valor monetário em centavos de BRL (convenção CV03 do arc42).
 * Inteiro para evitar erro de ponto flutuante em cálculos financeiros (Q02).
 */
export class Dinheiro {
  private constructor(readonly centavos: number) {}

  static deCentavos(centavos: number): Dinheiro {
    if (!Number.isInteger(centavos)) {
      throw new ErroDeDominio("Valor monetário deve ser informado em centavos inteiros");
    }
    if (centavos < 0) {
      throw new ErroDeDominio("Valor monetário não pode ser negativo");
    }
    return new Dinheiro(centavos);
  }

  get reais(): number {
    return this.centavos / 100;
  }

  maiorQue(outro: Dinheiro): boolean {
    return this.centavos > outro.centavos;
  }

  igual(outro: Dinheiro): boolean {
    return this.centavos === outro.centavos;
  }
}
