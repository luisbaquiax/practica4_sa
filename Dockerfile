#  instalación de dependencias
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev


# imagen final de ejecución
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY scripts ./scripts
COPY migrations ./migrations
COPY healthcheck.js ./

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "src/server.js"]
