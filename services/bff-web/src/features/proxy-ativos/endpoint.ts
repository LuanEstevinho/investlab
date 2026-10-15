import { Router } from "express";
import type { AtivosClient } from "../../application/ports/clientes.js";

/** Fatia de proxy CRUD: o microfrontend nunca fala direto com o microserviço. */
export function proxyAtivosEndpoint(ativos: AtivosClient): Router {
  const router = Router();
  router.all(/^\/api\/ativos(\/.*)?$/, async (req, res, next) => {
    try {
      const caminho = req.originalUrl.replace(/^\/api/, "");
      const r = await ativos.encaminhar(req.method, caminho, req.body);
      res.status(r.status).json(r.corpo);
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
