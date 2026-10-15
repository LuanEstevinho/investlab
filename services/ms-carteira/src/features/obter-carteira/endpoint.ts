import { Router } from "express";
import { ObterCarteiraHandler } from "./handler.js";

export function obterCarteiraEndpoint(handler: ObterCarteiraHandler): Router {
  const router = Router();
  router.get("/carteiras/:id", async (req, res, next) => {
    try {
      res.json(await handler.executar(String(req.params.id)));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
