import { describe, expect, it } from "vitest";
import { Carteira } from "./Carteira.js";
import { ErroDeDominio } from "./erros.js";

describe("Carteira (entidade)", () => {
  it("calcula preço médio ponderado e patrimônio em centavos", () => {
    const c = Carteira.criar({ usuarioId: "u1", nome: "Principal" });
    c.registrarAporte({ ticker: "hglg11", quantidade: 10, precoCentavos: 16000 });
    c.registrarAporte({ ticker: "HGLG11", quantidade: 10, precoCentavos: 17000 });

    const [pos] = c.posicoes;
    expect(pos.quantidade).toBe(20);
    expect(pos.precoMedioCentavos).toBe(16500);
    expect(c.investidoCentavos).toBe(330000);
    expect(c.patrimonioCentavos).toBe(340000); // último preço 170,00 * 20
    expect(c.historico).toHaveLength(2);
  });

  it("atualizarPreco é idempotente e ignora ativos ausentes", () => {
    const c = Carteira.criar({ usuarioId: "u1", nome: "Principal" });
    c.registrarAporte({ ticker: "PETR4", quantidade: 100, precoCentavos: 3800 });

    expect(c.atualizarPreco("PETR4", 4000)).toBe(true);
    expect(c.atualizarPreco("PETR4", 4000)).toBe(true);
    expect(c.atualizarPreco("VALE3", 6000)).toBe(false);
    expect(c.patrimonioCentavos).toBe(400000);
  });

  it("rejeita aporte com quantidade zero", () => {
    const c = Carteira.criar({ usuarioId: "u1", nome: "Principal" });
    expect(() => c.registrarAporte({ ticker: "PETR4", quantidade: 0, precoCentavos: 3800 })).toThrow(ErroDeDominio);
  });
});
