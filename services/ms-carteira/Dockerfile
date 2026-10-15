# docker build -t <dockerhubuser>/investlab-ms-carteira:v1 -f services/ms-carteira/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY services/ms-carteira/package.json services/ms-carteira/
RUN npm install --workspace=@investlab/ms-carteira --include-workspace-root=false
COPY services/ms-carteira services/ms-carteira
RUN npm run build --workspace=@investlab/ms-carteira

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/ms-carteira/dist ./dist
COPY --from=build /app/services/ms-carteira/package.json ./
EXPOSE 3002
CMD ["node", "dist/api/server.js"]
