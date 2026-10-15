import express from "express";
import swaggerUi from "swagger-ui-express";
import type { AtivoRepository } from "../application/ports/AtivoRepository.js";
import type { EventPublisher } from "../application/ports/EventPublisher.js";
import { CadastrarAtivoHandler } from "../features/cadastrar-ativo/handler.js";
import { cadastrarAtivoEndpoint } from "../features/cadastrar-ativo/endpoint.js";
import { ListarAtivosHandler } from "../features/listar-ativos/handler.js";
import { listarAtivosEndpoint } from "../features/listar-ativos/endpoint.js";
import { ObterAtivoHandler } from "../features/obter-ativo/handler.js";
import { obterAtivoEndpoint } from "../features/obter-ativo/endpoint.js";
import { AtualizarCotacaoHandler } from "../features/atualizar-cotacao/handler.js";
import { atualizarCotacaoEndpoint } from "../features/atualizar-cotacao/endpoint.js";
import { RemoverAtivoHandler } from "../features/remover-ativo/handler.js";
import { removerAtivoEndpoint } from "../features/remover-ativo/endpoint.js";
import { openapi } from "./openapi.js";
import { tratadorDeErros } from "./erros.js";

export interface Dependencias {
  ativos: AtivoRepository;
  eventos: EventPublisher;
}

/** Composition root: liga portas a adaptadores e registra cada fatia vertical. */
export function criarApp(deps: Dependencias) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok", servico: "ms-ativos" }));
  app.get("/openapi.json", (_req, res) => res.json(openapi));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.use(listarAtivosEndpoint(new ListarAtivosHandler(deps.ativos)));
  app.use(obterAtivoEndpoint(new ObterAtivoHandler(deps.ativos)));
  app.use(cadastrarAtivoEndpoint(new CadastrarAtivoHandler(deps.ativos)));
  app.use(atualizarCotacaoEndpoint(new AtualizarCotacaoHandler(deps.ativos, deps.eventos)));
  app.use(removerAtivoEndpoint(new RemoverAtivoHandler(deps.ativos)));

  app.use(tratadorDeErros);
  return app;
}
