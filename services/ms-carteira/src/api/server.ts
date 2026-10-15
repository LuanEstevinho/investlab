import { criarApp } from "./app.js";
import { InMemoryCarteiraRepository } from "../infrastructure/memoria/InMemoryCarteiraRepository.js";
import { SqlCarteiraRepository } from "../infrastructure/sql/SqlCarteiraRepository.js";

const porta = Number(process.env.PORT ?? 3002);
const sqlConexao = process.env.AZURE_SQL_CONNECTION; // segredo só via ambiente

const carteiras = sqlConexao ? await SqlCarteiraRepository.conectar(sqlConexao) : new InMemoryCarteiraRepository();

criarApp({ carteiras }).listen(porta, () => {
  console.log(
    JSON.stringify({ nivel: "info", operacao: "startup", servico: "ms-carteira", porta, persistencia: sqlConexao ? "azure-sql" : "memoria" }),
  );
});
