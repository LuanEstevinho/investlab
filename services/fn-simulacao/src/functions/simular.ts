import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from "@azure/functions";
import { z } from "zod";
import { simular } from "../domain/Simulador.js";

const Parametros = z.object({
  capitalInicialCentavos: z.number().int().nonnegative(),
  aporteMensalCentavos: z.number().int().nonnegative(),
  meses: z.number().int().min(1).max(600),
  taxaAnualPercentual: z.number().positive().max(100),
});

/** HTTP Trigger: POST /api/simular - cálculo sob demanda (serverless, Consumption plan). */
export async function simularHttp(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const corpo = Parametros.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return { status: 400, jsonBody: { erro: "ENTRADA_INVALIDA", detalhes: corpo.error.issues } };
  }
  const inicio = Date.now();
  const resultado = simular(corpo.data);
  ctx.log(JSON.stringify({ operacao: "simular", meses: corpo.data.meses, duracaoMs: Date.now() - inicio }));
  return { status: 200, jsonBody: resultado };
}

app.http("simular", { methods: ["POST"], authLevel: "function", route: "simular", handler: simularHttp });
