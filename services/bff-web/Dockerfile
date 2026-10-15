# docker build -t <dockerhubuser>/investlab-bff-web:v1 -f services/bff-web/Dockerfile .
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY services/bff-web/package.json services/bff-web/
RUN npm install --workspace=@investlab/bff-web --include-workspace-root=false
COPY services/bff-web services/bff-web
RUN npm run build --workspace=@investlab/bff-web

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/services/bff-web/dist ./dist
COPY --from=build /app/services/bff-web/package.json ./
EXPOSE 3000
CMD ["node", "dist/api/server.js"]
