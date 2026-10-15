import { Router } from "express";
import { ListarCarteirasHandler, ListarCarteirasQuery } from "./handler.js";

export function listarCarteirasEndpoint(handler: ListarCarteirasHandler): Router {
  const router = Router();
  router.get("/carteiras", async (req, res, next) => {
    try {
      res.json(await handler.executar(ListarCarteirasQuery.parse(req.query)));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
