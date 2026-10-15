import { app, type InvocationContext } from "@azure/functions";
import { z } from "zod";

const CotacaoAtualizada = z.object({
  tipo: z.literal("investlab.ativos.cotacao-atualizada"),
  versao: z.literal(1),
  ocorridoEm: z.string(),
  dados: z.object({
    ticker: z.string(),
    precoCentavos: z.number().int().positive(),
    dataReferencia: z.string(),
  }),
});

/**
 * Service Bus Topic Trigger (EDA - consumidor): reage ao evento publicado pelo ms-ativos
 * e reavalia as carteiras no ms-carteira. Idempotente no destino, então o reprocessamento
 * (at-least-once) é seguro. Mensagens inválidas vão para a dead-letter após as tentativas.
 */
export async function aoReceberCotacaoAtualizada(mensagem: unknown, ctx: InvocationContext): Promise<void> {
  const evento = CotacaoAtualizada.parse(mensagem);
  const url = `${process.env.MS_CARTEIRA_URL ?? "http://localhost:3002"}/posicoes/precos`;
  const resposta = await fetch(url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(evento.dados),
    signal: AbortSignal.timeout(5000),
  });
  if (!resposta.ok) throw new Error(`ms-carteira respondeu ${resposta.status}`); // força retry do Service Bus
  ctx.log(JSON.stringify({ operacao: "cotacao-atualizada.consumida", ticker: evento.dados.ticker, resultado: await resposta.json() }));
}

app.serviceBusTopic("cotacaoAtualizada", {
  connection: "SERVICEBUS_CONNECTION",
  topicName: "%SERVICEBUS_TOPICO%",
  subscriptionName: "%SERVICEBUS_ASSINATURA%",
  handler: aoReceberCotacaoAtualizada,
});
