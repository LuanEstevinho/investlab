# docker build -t <dockerhubuser>/investlab-ms-ativos:v1 -f services/ms-ativos/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY services/ms-ativos/package.json services/ms-ativos/
RUN npm install --workspace=@investlab/ms-ativos --include-workspace-root=false
COPY services/ms-ativos services/ms-ativos
RUN npm run build --workspace=@investlab/ms-ativos

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/ms-ativos/dist ./dist
COPY --from=build /app/services/ms-ativos/package.json ./
EXPOSE 3001
CMD ["node", "dist/api/server.js"]
