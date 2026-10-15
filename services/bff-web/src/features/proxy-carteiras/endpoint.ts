import { Router } from "express";
import type { CarteiraClient } from "../../application/ports/clientes.js";

export function proxyCarteirasEndpoint(carteiras: CarteiraClient): Router {
  const router = Router();
  router.all(/^\/api\/carteiras(\/.*)?$/, async (req, res, next) => {
    try {
      const caminho = req.originalUrl.replace(/^\/api/, "");
      const r = await carteiras.encaminhar(req.method, caminho, req.body);
      res.status(r.status).json(r.corpo);
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
