import { Router } from "express";
import { CriarCarteiraCommand, CriarCarteiraHandler } from "./handler.js";

export function criarCarteiraEndpoint(handler: CriarCarteiraHandler): Router {
  const router = Router();
  router.post("/carteiras", async (req, res, next) => {
    try {
      const criada = await handler.executar(CriarCarteiraCommand.parse(req.body));
      res.status(201).location(`/carteiras/${criada.id}`).json(criada);
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
