export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "InvestLab - BFF Web",
    version: "2.0.0",
    description:
      "Backend for Frontend do microfrontend InvestLab. Agrega ms-ativos (MongoDB), ms-carteira (Azure SQL) e fn-simulacao (Azure Functions). Exposto ao público por trás do API Gateway.",
  },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/aggregated-data": {
      get: {
        summary: "Dashboard agregado: ativos + carteiras + simulação em um único JSON",
        parameters: [
          { name: "usuarioId", in: "query", schema: { type: "string", default: "demo" } },
          { name: "aporteMensalCentavos", in: "query", schema: { type: "integer", default: 50000 } },
          { name: "meses", in: "query", schema: { type: "integer", default: 120 } },
          { name: "taxaAnualPercentual", in: "query", schema: { type: "number", default: 10 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    geradoEm: { type: "string", format: "date-time" },
                    usuarioId: { type: "string" },
                    ativos: { type: "array", nullable: true, items: { type: "object" } },
                    carteiras: { type: "array", nullable: true, items: { type: "object" } },
                    resumo: { type: "object" },
                    simulacao: { type: "object", nullable: true },
                    fontes: { type: "object", description: "fulfilled | rejected por fonte" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/ativos": { get: { summary: "Proxy -> ms-ativos GET /ativos", responses: { "200": { description: "OK" } } }, post: { summary: "Proxy -> ms-ativos POST /ativos", responses: { "201": { description: "Criado" } } } },
    "/api/ativos/{ticker}": {
      parameters: [{ name: "ticker", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "Proxy -> ms-ativos", responses: { "200": { description: "OK" } } },
      delete: { summary: "Proxy -> ms-ativos", responses: { "204": { description: "Removido" } } },
    },
    "/api/ativos/{ticker}/cotacao": {
      parameters: [{ name: "ticker", in: "path", required: true, schema: { type: "string" } }],
      put: { summary: "Proxy -> ms-ativos (dispara evento cotacao-atualizada)", responses: { "200": { description: "OK" } } },
    },
    "/api/carteiras": { get: { summary: "Proxy -> ms-carteira", responses: { "200": { description: "OK" } } }, post: { summary: "Proxy -> ms-carteira", responses: { "201": { description: "Criada" } } } },
    "/api/carteiras/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "Proxy -> ms-carteira", responses: { "200": { description: "OK" } } },
      delete: { summary: "Proxy -> ms-carteira", responses: { "204": { description: "Removida" } } },
    },
    "/api/carteiras/{id}/aportes": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      post: { summary: "Proxy -> ms-carteira", responses: { "201": { description: "Aporte registrado" } } },
    },
    "/api/simulacoes": {
      post: {
        summary: "Simulação de patrimônio (encaminha para fn-simulacao)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["capitalInicialCentavos", "aporteMensalCentavos", "meses", "taxaAnualPercentual"],
                properties: {
                  capitalInicialCentavos: { type: "integer" },
                  aporteMensalCentavos: { type: "integer" },
                  meses: { type: "integer" },
                  taxaAnualPercentual: { type: "number" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Cenários conservador, base e otimista" } },
      },
    },
    "/health": { get: { summary: "Health check", responses: { "200": { description: "OK" } } } },
  },
};
