import { Router } from "express";
import { CadastrarAtivoCommand, CadastrarAtivoHandler } from "./handler.js";

/** Adaptador de entrada (Interface Adapter) da fatia. Converte HTTP -> comando. */
export function cadastrarAtivoEndpoint(handler: CadastrarAtivoHandler): Router {
  const router = Router();
  router.post("/ativos", async (req, res, next) => {
    try {
      const comando = CadastrarAtivoCommand.parse(req.body);
      const criado = await handler.executar(comando);
      res.status(201).location(`/ativos/${criado.ticker}`).json(criado);
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
