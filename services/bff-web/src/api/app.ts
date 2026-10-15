import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { ZodError } from "zod";
import type { AtivosClient, CarteiraClient, SimulacaoClient } from "../application/ports/clientes.js";
import { AggregatedDataHandler } from "../features/aggregated-data/handler.js";
import { aggregatedDataEndpoint } from "../features/aggregated-data/endpoint.js";
import { proxyAtivosEndpoint } from "../features/proxy-ativos/endpoint.js";
import { proxyCarteirasEndpoint } from "../features/proxy-carteiras/endpoint.js";
import { simularEndpoint } from "../features/simular/endpoint.js";
import { openapi } from "./openapi.js";

export interface Dependencias {
  ativos: AtivosClient;
  carteiras: CarteiraClient;
  simulacao: SimulacaoClient;
  origensPermitidas: string[];
}

const tratadorDeErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  if (erro instanceof ZodError) {
    res.status(400).json({ erro: "ENTRADA_INVALIDA", detalhes: erro.issues });
    return;
  }
  console.error(JSON.stringify({ nivel: "error", operacao: "bff", mensagem: (erro as Error).message }));
  res.status(502).json({ erro: "UPSTREAM_INDISPONIVEL" });
};

export function criarApp(deps: Dependencias) {
  const app = express();
  app.use(cors({ origin: deps.origensPermitidas }));
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok", servico: "bff-web" }));
  app.get("/openapi.json", (_req, res) => res.json(openapi));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.use(aggregatedDataEndpoint(new AggregatedDataHandler(deps.ativos, deps.carteiras, deps.simulacao)));
  app.use(proxyAtivosEndpoint(deps.ativos));
  app.use(proxyCarteirasEndpoint(deps.carteiras));
  app.use(simularEndpoint(deps.simulacao));

  app.use(tratadorDeErros);
  return app;
}
