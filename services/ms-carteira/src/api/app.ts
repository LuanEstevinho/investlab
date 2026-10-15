import express from "express";
import swaggerUi from "swagger-ui-express";
import type { CarteiraRepository } from "../application/ports/CarteiraRepository.js";
import { CriarCarteiraHandler } from "../features/criar-carteira/handler.js";
import { criarCarteiraEndpoint } from "../features/criar-carteira/endpoint.js";
import { ObterCarteiraHandler } from "../features/obter-carteira/handler.js";
import { obterCarteiraEndpoint } from "../features/obter-carteira/endpoint.js";
import { ListarCarteirasHandler } from "../features/listar-carteiras/handler.js";
import { listarCarteirasEndpoint } from "../features/listar-carteiras/endpoint.js";
import { RegistrarAporteHandler } from "../features/registrar-aporte/handler.js";
import { registrarAporteEndpoint } from "../features/registrar-aporte/endpoint.js";
import { AtualizarPrecosHandler } from "../features/atualizar-precos/handler.js";
import { atualizarPrecosEndpoint } from "../features/atualizar-precos/endpoint.js";
import { RemoverCarteiraHandler } from "../features/remover-carteira/handler.js";
import { removerCarteiraEndpoint } from "../features/remover-carteira/endpoint.js";
import { openapi } from "./openapi.js";
import { tratadorDeErros } from "./erros.js";

export interface Dependencias {
  carteiras: CarteiraRepository;
}

export function criarApp(deps: Dependencias) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ status: "ok", servico: "ms-carteira" }));
  app.get("/openapi.json", (_req, res) => res.json(openapi));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.use(listarCarteirasEndpoint(new ListarCarteirasHandler(deps.carteiras)));
  app.use(obterCarteiraEndpoint(new ObterCarteiraHandler(deps.carteiras)));
  app.use(criarCarteiraEndpoint(new CriarCarteiraHandler(deps.carteiras)));
  app.use(registrarAporteEndpoint(new RegistrarAporteHandler(deps.carteiras)));
  app.use(atualizarPrecosEndpoint(new AtualizarPrecosHandler(deps.carteiras)));
  app.use(removerCarteiraEndpoint(new RemoverCarteiraHandler(deps.carteiras)));

  app.use(tratadorDeErros);
  return app;
}
