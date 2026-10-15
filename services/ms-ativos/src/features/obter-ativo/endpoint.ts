import { Router } from "express";
import { ObterAtivoHandler } from "./handler.js";

export function obterAtivoEndpoint(handler: ObterAtivoHandler): Router {
  const router = Router();
  router.get("/ativos/:ticker", async (req, res, next) => {
    try {
      res.json(await handler.executar(String(req.params.ticker)));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
