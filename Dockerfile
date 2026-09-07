FROM node:24.19.0-bookworm-slim AS base
WORKDIR /app
RUN npm install --global pnpm@10.34.5
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

FROM base AS prod-deps
RUN --mount=type=cache,id=sharex-api-pnpm,target=/root/.local/share/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=sharex-api-pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24.19.0-bookworm-slim
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
VOLUME ["/app/uploads", "/app/thumbnails"]
EXPOSE 3000
CMD ["node", "dist/main.js"]
