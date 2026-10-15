# API Gateway

O gateway é o único ponto de entrada público do InvestLab (padrão **API Gateway**). Ele encaminha tudo ao **BFF** (`bff-web`), que por sua vez fala com os microserviços e a Azure Function. Nenhum microserviço fica exposto à internet.

## Opção 1 (enunciado da Entrega 3): AWS API Gateway (HTTP API)
1. Publicar o BFF (Container App ou App Service) e anotar a URL pública.
2. Substituir `${BFF_URL}` em `openapi-gateway.yaml`.
3. AWS Console > API Gateway > Create API > **HTTP API** > *Import* > colar o YAML.
4. Em *CORS*, ajustar `allowOrigins` para a URL do `mfe-shell` no Azure Static Web Apps.
5. Em *Throttling* (stage default): 50 req/s burst, 20 req/s rate (proteção dos serviços free-tier).
6. Entrega 3: adicionar *JWT authorizer* (Microsoft Entra ID / Keycloak) nas rotas `/api/*`.

## Opção 2 (tudo em Azure): Azure API Management (Consumption)
Mesmo OpenAPI; importar em APIM > APIs > *OpenAPI* e configurar a política `set-backend-service` para a URL do BFF.

## Responsabilidades
| Responsabilidade | Onde |
|---|---|
| Roteamento / entrada única | Gateway |
| CORS, rate limiting, TLS | Gateway |
| Autenticação (JWT) | Gateway (Entrega 3) |
| Agregação, adaptação para a web | BFF |
| Regras de negócio e dados | Microserviços / Function |
