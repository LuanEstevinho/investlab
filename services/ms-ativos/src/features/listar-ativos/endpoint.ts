import { Router } from "express";
import { ListarAtivosHandler, ListarAtivosQuery } from "./handler.js";

export function listarAtivosEndpoint(handler: ListarAtivosHandler): Router {
  const router = Router();
  router.get("/ativos", async (req, res, next) => {
    try {
      const query = ListarAtivosQuery.parse(req.query);
      res.json(await handler.executar(query));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
