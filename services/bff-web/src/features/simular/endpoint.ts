import { Router } from "express";
import { z } from "zod";
import type { SimulacaoClient } from "../../application/ports/clientes.js";

const Parametros = z.object({
  capitalInicialCentavos: z.number().int().nonnegative(),
  aporteMensalCentavos: z.number().int().nonnegative(),
  meses: z.number().int().positive().max(600),
  taxaAnualPercentual: z.number().positive().max(100),
});

/** Encaminha a simulação (RF07-RF08) para a Azure Function serverless. */
export function simularEndpoint(simulacao: SimulacaoClient): Router {
  const router = Router();
  router.post("/api/simulacoes", async (req, res, next) => {
    try {
      res.json(await simulacao.simular(Parametros.parse(req.body)));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
