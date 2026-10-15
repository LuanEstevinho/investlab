import { Router } from "express";
import { AtualizarCotacaoCommand, AtualizarCotacaoHandler } from "./handler.js";

export function atualizarCotacaoEndpoint(handler: AtualizarCotacaoHandler): Router {
  const router = Router();
  router.put("/ativos/:ticker/cotacao", async (req, res, next) => {
    try {
      const comando = AtualizarCotacaoCommand.parse({ ...req.body, ticker: req.params.ticker });
      res.json(await handler.executar(comando));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
