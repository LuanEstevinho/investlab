import { describe, expect, it } from "vitest";
import { projetar, simular, taxaMensal, validarParametros } from "./Simulador.js";

describe("Simulador (domínio serverless)", () => {
  it("converte taxa anual em mensal equivalente", () => {
    expect(taxaMensal(12.6825)).toBeCloseTo(0.01, 5);
  });

  it("projeta juros compostos com aportes mensais em centavos inteiros", () => {
    const r = projetar({ capitalInicialCentavos: 100000, aporteMensalCentavos: 10000, meses: 12, taxaAnualPercentual: 12.6825 }, 12.6825);
    // 1000 * 1.01^12 + 100 * ((1.01^12 - 1) / 0.01) ≈ 1126,83 + 1268,25 = 2395,08
    expect(r.patrimonioFinalCentavos).toBeGreaterThanOrEqual(239500);
    expect(r.patrimonioFinalCentavos).toBeLessThanOrEqual(239520);
    expect(Number.isInteger(r.patrimonioFinalCentavos)).toBe(true);
    expect(r.totalAportadoCentavos).toBe(220000);
    expect(r.serieAnual).toEqual([{ ano: 1, patrimonioCentavos: r.patrimonioFinalCentavos }]);
  });

  it("gera três cenários ordenados e é determinístico (Q01)", () => {
    const p = { capitalInicialCentavos: 0, aporteMensalCentavos: 50000, meses: 120, taxaAnualPercentual: 10 };
    const data = new Date("2026-10-14T00:00:00Z");
    const a = simular(p, data);
    const b = simular(p, data);
    expect(a).toEqual(b);
    const [cons, base, oti] = a.cenarios;
    expect([cons.nome, base.nome, oti.nome]).toEqual(["conservador", "base", "otimista"]);
    expect(cons.patrimonioFinalCentavos).toBeLessThan(base.patrimonioFinalCentavos);
    expect(base.patrimonioFinalCentavos).toBeLessThan(oti.patrimonioFinalCentavos);
  });

  it("valida parâmetros", () => {
    expect(validarParametros({ capitalInicialCentavos: 0, aporteMensalCentavos: 0, meses: 0, taxaAnualPercentual: 10 })).toMatch(/meses/);
    expect(() => simular({ capitalInicialCentavos: 10.5, aporteMensalCentavos: 0, meses: 12, taxaAnualPercentual: 10 })).toThrow();
  });
});
