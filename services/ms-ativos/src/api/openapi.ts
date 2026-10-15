const Ativo = {
  type: "object",
  required: ["ticker", "tipo", "nome", "precoCentavos", "dataReferencia"],
  properties: {
    ticker: { type: "string", example: "HGLG11" },
    tipo: { type: "string", enum: ["FII", "ACAO", "TESOURO", "CDB", "LCI", "LCA"] },
    nome: { type: "string", example: "CSHG Logística" },
    precoCentavos: { type: "integer", example: 16050, description: "Preço em centavos de BRL" },
    dataReferencia: { type: "string", format: "date-time" },
  },
} as const;

const Erro = {
  type: "object",
  properties: { erro: { type: "string" }, mensagem: { type: "string" } },
} as const;

export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "InvestLab - Microserviço de Ativos",
    version: "2.0.0",
    description: "CRUD de ativos (FIIs, ações, renda fixa) com publicação de eventos de cotação. Banco: MongoDB Atlas.",
  },
  servers: [{ url: "http://localhost:3001" }],
  paths: {
    "/ativos": {
      get: {
        summary: "Lista ativos",
        parameters: [{ name: "tipo", in: "query", schema: Ativo.properties.tipo }],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: Ativo } } } } },
      },
      post: {
        summary: "Cadastra um ativo",
        requestBody: { required: true, content: { "application/json": { schema: Ativo } } },
        responses: {
          "201": { description: "Criado", content: { "application/json": { schema: Ativo } } },
          "400": { description: "Entrada inválida", content: { "application/json": { schema: Erro } } },
          "409": { description: "Ticker já cadastrado", content: { "application/json": { schema: Erro } } },
          "422": { description: "Regra de domínio violada", content: { "application/json": { schema: Erro } } },
        },
      },
    },
    "/ativos/{ticker}": {
      parameters: [{ name: "ticker", in: "path", required: true, schema: { type: "string" } }],
      get: {
        summary: "Obtém um ativo",
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: Ativo } } },
          "404": { description: "Não encontrado", content: { "application/json": { schema: Erro } } },
        },
      },
      delete: { summary: "Remove um ativo", responses: { "204": { description: "Removido" }, "404": { description: "Não encontrado" } } },
    },
    "/ativos/{ticker}/cotacao": {
      parameters: [{ name: "ticker", in: "path", required: true, schema: { type: "string" } }],
      put: {
        summary: "Atualiza a cotação e publica o evento investlab.ativos.cotacao-atualizada",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["precoCentavos", "dataReferencia"],
                properties: { precoCentavos: { type: "integer" }, dataReferencia: { type: "string", format: "date-time" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Atualizado", content: { "application/json": { schema: Ativo } } },
          "404": { description: "Não encontrado" },
          "422": { description: "Data de referência anterior à última válida" },
        },
      },
    },
    "/health": { get: { summary: "Health check", responses: { "200": { description: "OK" } } } },
  },
};
