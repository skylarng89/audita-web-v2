# Audita Web — build stage produces a static Vite bundle served by caddy
# (blueprint ADR-9).

FROM node:22-alpine AS builder
WORKDIR /src
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM caddy:2-alpine
COPY --from=builder /src/dist /usr/share/caddy
# SPA fallback: unknown paths serve index.html.
ADD Caddyfile /etc/caddy/Caddyfile
EXPOSE 3000
