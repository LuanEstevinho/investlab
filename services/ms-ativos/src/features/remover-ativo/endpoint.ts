import { Router } from "express";
import { RemoverAtivoHandler } from "./handler.js";

export function removerAtivoEndpoint(handler: RemoverAtivoHandler): Router {
  const router = Router();
  router.delete("/ativos/:ticker", async (req, res, next) => {
    try {
      await handler.executar(String(req.params.ticker));
      res.status(204).end();
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
