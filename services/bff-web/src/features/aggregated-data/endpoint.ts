import { Router } from "express";
import { AggregatedDataHandler, AggregatedDataQuery } from "./handler.js";

export function aggregatedDataEndpoint(handler: AggregatedDataHandler): Router {
  const router = Router();
  router.get("/aggregated-data", async (req, res, next) => {
    try {
      res.json(await handler.executar(AggregatedDataQuery.parse(req.query)));
    } catch (erro) {
      next(erro);
    }
  });
  return router;
}
