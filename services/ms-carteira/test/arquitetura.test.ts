import { describe, expect, it } from "vitest";
import { filesOfProject } from "tsarch";

describe("Arquitetura ms-carteira", () => {
  it("domain não depende de application, features, infrastructure ou api", async () => {
    const regra = filesOfProject().inFolder("domain").shouldNot().dependOnFiles().matchingPattern("(application|features|infrastructure|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("domain não depende de frameworks ou drivers (express, mssql, zod)", async () => {
    const regra = filesOfProject().inFolder("domain").shouldNot().dependOnFiles().matchingPattern("node_modules/(express|mssql|zod)");
    expect(await regra.check()).toEqual([]);
  });

  it("application (portas) depende apenas de domain", async () => {
    const regra = filesOfProject().inFolder("application").shouldNot().dependOnFiles().matchingPattern("(features|infrastructure|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("features não dependem de infrastructure nem de api", async () => {
    const regra = filesOfProject()
      .inFolder("features")
      .matchingPattern("^(?!.*\\.test\\.ts$).*$")
      .shouldNot()
      .dependOnFiles()
      .matchingPattern("(infrastructure|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("uma fatia vertical não depende de outra fatia", async () => {
    const fatias = ["criar-carteira", "obter-carteira", "listar-carteiras", "registrar-aporte", "atualizar-precos", "remover-carteira"];
    for (const fatia of fatias) {
      const outras = fatias.filter((f) => f !== fatia).join("|");
      const regra = filesOfProject().inFolder(`features/${fatia}`).shouldNot().dependOnFiles().matchingPattern(`features/(${outras})/`);
      expect(await regra.check(), `fatia ${fatia}`).toEqual([]);
    }
  });

  it("infrastructure não depende de features nem de api", async () => {
    const regra = filesOfProject().inFolder("infrastructure").shouldNot().dependOnFiles().matchingPattern("(features|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("não há ciclos de dependência", async () => {
    const regra = filesOfProject().inFolder("src").should().beFreeOfCycles();
    expect(await regra.check()).toEqual([]);
  });
});
