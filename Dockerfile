FROM node:20-slim AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
# 按照部署要求重新组织产物目录
RUN mv public .next/standalone/ \
  && mkdir -p .next/standalone/.next \
  && mv .next/static .next/standalone/.next/

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
COPY --from=builder /app/.next/standalone ./
CMD ["node", "server.js"]
