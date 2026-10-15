const Posicao = {
  type: "object",
  properties: {
    ticker: { type: "string", example: "HGLG11" },
    quantidade: { type: "number", example: 10 },
    precoMedioCentavos: { type: "integer", example: 16000 },
    precoAtualCentavos: { type: "integer", example: 16500 },
    valorAtualCentavos: { type: "integer", example: 165000 },
  },
} as const;

const Carteira = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid" },
    usuarioId: { type: "string" },
    nome: { type: "string" },
    patrimonioCentavos: { type: "integer" },
    investidoCentavos: { type: "integer" },
    atualizadaEm: { type: "string", format: "date-time" },
    posicoes: { type: "array", items: Posicao },
  },
} as const;

export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "InvestLab - Microserviço de Carteira",
    version: "2.0.0",
    description: "Carteira virtual: posições, aportes e patrimônio. Banco: Azure SQL Database. Consome o evento cotacao-atualizada via PUT /posicoes/precos.",
  },
  servers: [{ url: "http://localhost:3002" }],
  paths: {
    "/carteiras": {
      get: {
        summary: "Lista carteiras de um usuário",
        parameters: [{ name: "usuarioId", in: "query", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: Carteira } } } } },
      },
      post: {
        summary: "Cria carteira",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["usuarioId", "nome"], properties: { usuarioId: { type: "string" }, nome: { type: "string" } } } } },
        },
        responses: { "201": { description: "Criada", content: { "application/json": { schema: Carteira } } }, "400": { description: "Entrada inválida" } },
      },
    },
    "/carteiras/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "Obtém carteira com posições e histórico", responses: { "200": { description: "OK", content: { "application/json": { schema: Carteira } } }, "404": { description: "Não encontrada" } } },
      delete: { summary: "Remove carteira", responses: { "204": { description: "Removida" }, "404": { description: "Não encontrada" } } },
    },
    "/carteiras/{id}/aportes": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      post: {
        summary: "Registra aporte (RF15)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ticker", "quantidade", "precoCentavos"],
                properties: { ticker: { type: "string" }, quantidade: { type: "number" }, precoCentavos: { type: "integer" }, data: { type: "string", format: "date-time" } },
              },
            },
          },
        },
        responses: { "201": { description: "Aporte registrado" }, "404": { description: "Carteira não encontrada" }, "422": { description: "Regra de domínio violada" } },
      },
    },
    "/posicoes/precos": {
      put: {
        summary: "Atualiza o preço atual de um ativo em todas as carteiras (consumidor do evento cotacao-atualizada)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ticker", "precoCentavos", "dataReferencia"],
                properties: { ticker: { type: "string" }, precoCentavos: { type: "integer" }, dataReferencia: { type: "string", format: "date-time" } },
              },
            },
          },
        },
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ticker: { type: "string" }, carteirasAtualizadas: { type: "integer" } } } } } } },
      },
    },
    "/health": { get: { summary: "Health check", responses: { "200": { description: "OK" } } } },
  },
};
