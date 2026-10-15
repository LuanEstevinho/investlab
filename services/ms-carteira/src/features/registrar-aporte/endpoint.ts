import { Router } from "express";
import { RegistrarAporteCommand, RegistrarAporteHandler } from "./handler.js";

export function registrarAporteEndpoint(handler: RegistrarAporteHandler): Router {
  const router = Router();
  router.post("/carteiras/:id/aportes", async (req, res, next) => {
    try {
      const comando = RegistrarAporteCommand.parse({ ...req.body, carteiraId: req.params.id });
      res.status(201).json(await handler.executar(comando));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
