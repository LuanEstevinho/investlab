import { Router } from "express";
import { RemoverCarteiraHandler } from "./handler.js";

export function removerCarteiraEndpoint(handler: RemoverCarteiraHandler): Router {
  const router = Router();
  router.delete("/carteiras/:id", async (req, res, next) => {
    try {
      await handler.executar(String(req.params.id));
      res.status(204).end();
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
