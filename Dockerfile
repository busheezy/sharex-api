FROM node:26.10.0-bookworm-slim AS base
WORKDIR /app
RUN npm install --global pnpm@12.3.4
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

FROM base AS prod-deps
RUN --mount=type=cache,id=sharex-api-pnpm,target=/root/.local/share/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=sharex-api-pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:26.10.0-bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
VOLUME ["/app/uploads", "/app/thumbnails"]
EXPOSE 3000
CMD ["node", "dist/main.js"]
