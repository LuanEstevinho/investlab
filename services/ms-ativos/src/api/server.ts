import { criarApp } from "./app.js";
import { InMemoryAtivoRepository } from "../infrastructure/memoria/InMemoryAtivoRepository.js";
import { MongoAtivoRepository } from "../infrastructure/mongo/MongoAtivoRepository.js";
import { LogEventPublisher } from "../infrastructure/mensageria/LogEventPublisher.js";
import { ServiceBusEventPublisher } from "../infrastructure/mensageria/ServiceBusEventPublisher.js";

// Segredos vêm só do ambiente (8.1 do arc42): nunca no código.
const porta = Number(process.env.PORT ?? 3001);
const mongoUri = process.env.MONGODB_URI;
const sbConexao = process.env.SERVICEBUS_CONNECTION;
const sbTopico = process.env.SERVICEBUS_TOPICO ?? "investlab-ativos";

const ativos = mongoUri ? await MongoAtivoRepository.conectar(mongoUri) : new InMemoryAtivoRepository();
const eventos = sbConexao ? new ServiceBusEventPublisher(sbConexao, sbTopico) : new LogEventPublisher();

criarApp({ ativos, eventos }).listen(porta, () => {
  console.log(
    JSON.stringify({
      nivel: "info",
      operacao: "startup",
      servico: "ms-ativos",
      porta,
      persistencia: mongoUri ? "mongodb" : "memoria",
      eventos: sbConexao ? "servicebus" : "log",
    }),
  );
});
