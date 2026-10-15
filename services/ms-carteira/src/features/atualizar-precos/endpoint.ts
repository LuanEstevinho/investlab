import { Router } from "express";
import { AtualizarPrecosCommand, AtualizarPrecosHandler } from "./handler.js";

export function atualizarPrecosEndpoint(handler: AtualizarPrecosHandler): Router {
  const router = Router();
  router.put("/posicoes/precos", async (req, res, next) => {
    try {
      res.json(await handler.executar(AtualizarPrecosCommand.parse(req.body)));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
