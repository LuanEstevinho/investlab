import { describe, expect, it } from "vitest";
import { filesOfProject } from "tsarch";

describe("Arquitetura fn-simulacao", () => {
  it("domain (motor de simulação) não depende do SDK do Azure Functions nem de zod", async () => {
    const regra = filesOfProject().inFolder("domain").shouldNot().dependOnFiles().matchingPattern("node_modules/(@azure|zod)");
    expect(await regra.check()).toEqual([]);
  });

  it("domain não depende de functions (adaptadores)", async () => {
    const regra = filesOfProject().inFolder("domain").shouldNot().dependOnFiles().inFolder("functions");
    expect(await regra.check()).toEqual([]);
  });

  it("não há ciclos", async () => {
    const regra = filesOfProject().inFolder("src").should().beFreeOfCycles();
    expect(await regra.check()).toEqual([]);
  });
});
