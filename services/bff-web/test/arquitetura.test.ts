import { describe, expect, it } from "vitest";
import { filesOfProject } from "tsarch";

describe("Arquitetura bff-web", () => {
  it("application (portas) não depende de features, infrastructure ou api", async () => {
    const regra = filesOfProject().inFolder("application").shouldNot().dependOnFiles().matchingPattern("(features|infrastructure|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("features dependem só das portas, nunca dos clientes HTTP concretos", async () => {
    const regra = filesOfProject()
      .inFolder("features")
      .matchingPattern("^(?!.*\\.test\\.ts$).*$")
      .shouldNot()
      .dependOnFiles()
      .matchingPattern("(infrastructure|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("o BFF não acessa bancos de dados diretamente (padrão BFF + Database per Service)", async () => {
    const regra = filesOfProject().inFolder("src").shouldNot().dependOnFiles().matchingPattern("node_modules/(mongodb|mssql|pg|mysql)");
    expect(await regra.check()).toEqual([]);
  });

  it("não há ciclos de dependência", async () => {
    const regra = filesOfProject().inFolder("src").should().beFreeOfCycles();
    expect(await regra.check()).toEqual([]);
  });
});
