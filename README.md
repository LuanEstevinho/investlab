# InvestLab

Plataforma web de análise, simulação e comparação de investimentos (FIIs, ações e renda fixa). Projeto PJBL da disciplina **Arquitetura e Soluções Cloud** (PSO129, PUCPR, 2026/2). Integrantes em [GRUPO.md](GRUPO.md).

Documentação de arquitetura (Arc42 + C4 + UML + DER + Canvas): [`docs/`](docs/).

## Arquitetura (resumo)

```
Investidor ─► mfe-shell (Azure Static Web Apps, Module Federation)
                 ├─ mfe-ativos   (remote)
                 └─ mfe-carteira (remote)
                        │ HTTPS
                 API Gateway (AWS HTTP API)   ← entrada única
                        │
                 bff-web (Node/Express)       ← GET /aggregated-data, proxies
                   ├─► ms-ativos   (Node) ─► MongoDB Atlas      ─► publica evento ─┐
                   ├─► ms-carteira (Node) ─► Azure SQL Database  ◄── PUT /posicoes/precos
                   └─► fn-simulacao (Azure Functions)                               │
                           ├─ HTTP  POST /api/simular                               │
                           └─ ServiceBusTopicTrigger  ◄── Azure Service Bus ◄───────┘
```

| Componente | Pasta | Estilo / padrão |
|---|---|---|
| Shell + 2 remotes React | `frontend/` | Microfrontend (Module Federation) |
| BFF | `services/bff-web` | Backend for Frontend, agrega 3 fontes |
| Microserviço de Ativos | `services/ms-ativos` | Microservice, Database per Service (MongoDB), publica eventos |
| Microserviço de Carteira | `services/ms-carteira` | Microservice, Database per Service (Azure SQL) |
| Functions | `services/fn-simulacao` | Serverless (HTTP + Service Bus trigger), EDA |
| Gateway | `gateway/` | API Gateway (AWS HTTP API / APIM) |
| Contratos de eventos | `contracts/events` | JSON Schema versionado |

Cada serviço segue **Clean Architecture** (`domain` → `application/ports` → `features` → `infrastructure`/`api`) organizada em **Vertical Slices** (`src/features/<caso-de-uso>/` com `handler`, `endpoint` e teste juntos), verificada por **testes de arquitetura** (`test/arquitetura.test.ts`, biblioteca `tsarch`, estilo ArchUnit).

## Rodando localmente

```bash
npm install
npm test            # unitários + arquitetura de todos os serviços
npm run build
```

Sem nenhuma variável de ambiente, `ms-ativos` e `ms-carteira` sobem com repositório em memória e eventos em log, o que basta para demonstrar o fluxo ponta a ponta:

```bash
npm run dev -w @investlab/ms-ativos      # :3001  (Swagger em /docs)
npm run dev -w @investlab/ms-carteira    # :3002  (Swagger em /docs)
npm run dev -w @investlab/bff-web        # :3000  (Swagger em /docs)
npm run dev -w @investlab/mfe-ativos     # :5001
npm run dev -w @investlab/mfe-carteira   # :5002
npm run dev -w @investlab/mfe-shell      # :5000
```

Com bancos reais: `cp .env.example .env`, preencher e `docker compose up --build`. A Function: `cd services/fn-simulacao && npm run build && func start` (precisa do Azure Functions Core Tools e de `local.settings.json`, copiado de `local.settings.example.json`).

## Variáveis de ambiente (nunca versionadas)

| Serviço | Variável | Uso |
|---|---|---|
| ms-ativos | `MONGODB_URI`, `SERVICEBUS_CONNECTION`, `SERVICEBUS_TOPICO` | Atlas e tópico de eventos |
| ms-carteira | `AZURE_SQL_CONNECTION` | Azure SQL (schema em `sql/schema.sql`) |
| bff-web | `MS_ATIVOS_URL`, `MS_CARTEIRA_URL`, `FN_SIMULACAO_URL`, `FN_SIMULACAO_KEY`, `CORS_ORIGINS` | Upstreams |
| fn-simulacao | `SERVICEBUS_CONNECTION`, `SERVICEBUS_TOPICO`, `SERVICEBUS_ASSINATURA`, `MS_CARTEIRA_URL` | Trigger e callback |
| mfe-* | `VITE_BFF_URL`, `VITE_MFE_*_URL` | Gateway/BFF e remotes |

## Docker Hub

```bash
docker build -t <usuario>/investlab-ms-ativos:v1   -f services/ms-ativos/Dockerfile .
docker build -t <usuario>/investlab-ms-carteira:v1 -f services/ms-carteira/Dockerfile .
docker build -t <usuario>/investlab-bff-web:v1     -f services/bff-web/Dockerfile .
docker push <usuario>/investlab-ms-ativos:v1 && docker push <usuario>/investlab-ms-carteira:v1 && docker push <usuario>/investlab-bff-web:v1
```

## Uso de IA generativa

Durante a preparação deste projeto, os autores usaram Claude (Anthropic, Claude Code, outubro de 2026) para gerar o esqueleto do código, os testes e a documentação a partir das decisões de arquitetura definidas pelo grupo. Após usar essa ferramenta, os autores revisaram e editaram o conteúdo conforme necessário e assumem total responsabilidade pelo conteúdo.
