import { describe, expect, it } from "vitest";
import { filesOfProject } from "tsarch";

/**
 * Testes unitários de arquitetura (estilo ArchUnit) - garantem a Regra das Dependências
 * da Clean Architecture e o isolamento das fatias verticais.
 */
describe("Arquitetura ms-ativos", () => {
  it("domain não depende de nenhuma outra camada", async () => {
    const regra = filesOfProject()
      .inFolder("domain")
      .shouldNot()
      .dependOnFiles()
      .matchingPattern("(application|features|infrastructure|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("domain não depende de frameworks ou drivers (express, mongodb, service-bus, zod)", async () => {
    const regra = filesOfProject()
      .inFolder("domain")
      .shouldNot()
      .dependOnFiles()
      .matchingPattern("node_modules/(express|mongodb|@azure|zod)");
    expect(await regra.check()).toEqual([]);
  });

  it("application (portas) depende apenas de domain", async () => {
    const regra = filesOfProject()
      .inFolder("application")
      .shouldNot()
      .dependOnFiles()
      .matchingPattern("(features|infrastructure|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("features (casos de uso e endpoints) não dependem de infrastructure nem de api", async () => {
    const regra = filesOfProject()
      .inFolder("features")
      .matchingPattern("^(?!.*\\.test\\.ts$).*$")
      .shouldNot()
      .dependOnFiles()
      .matchingPattern("(infrastructure|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("uma fatia vertical não depende de outra fatia", async () => {
    const fatias = ["cadastrar-ativo", "listar-ativos", "obter-ativo", "atualizar-cotacao", "remover-ativo"];
    for (const fatia of fatias) {
      const outras = fatias.filter((f) => f !== fatia).join("|");
      const regra = filesOfProject()
        .inFolder(`features/${fatia}`)
        .shouldNot()
        .dependOnFiles()
        .matchingPattern(`features/(${outras})/`);
      expect(await regra.check(), `fatia ${fatia}`).toEqual([]);
    }
  });

  it("infrastructure não depende de features nem de api (só implementa portas)", async () => {
    const regra = filesOfProject().inFolder("infrastructure").shouldNot().dependOnFiles().matchingPattern("(features|api)/");
    expect(await regra.check()).toEqual([]);
  });

  it("não há ciclos de dependência no serviço", async () => {
    const regra = filesOfProject().inFolder("src").should().beFreeOfCycles();
    expect(await regra.check()).toEqual([]);
  });
});
