import { criarApp } from "./app.js";
import { HttpAtivosClient, HttpCarteiraClient, HttpSimulacaoClient } from "../infrastructure/http/clientesHttp.js";

const porta = Number(process.env.PORT ?? 3000);

criarApp({
  ativos: new HttpAtivosClient(process.env.MS_ATIVOS_URL ?? "http://localhost:3001"),
  carteiras: new HttpCarteiraClient(process.env.MS_CARTEIRA_URL ?? "http://localhost:3002"),
  simulacao: new HttpSimulacaoClient(process.env.FN_SIMULACAO_URL ?? "http://localhost:7071", process.env.FN_SIMULACAO_KEY),
  origensPermitidas: (process.env.CORS_ORIGINS ?? "http://localhost:5000").split(","),
}).listen(porta, () => {
  console.log(JSON.stringify({ nivel: "info", operacao: "startup", servico: "bff-web", porta }));
});
