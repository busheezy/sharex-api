FROM node:16

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

RUN mkdir /nest-sharex

WORKDIR /nest-sharex

RUN mkdir -p thumbnails/images && \
  mkdir -p uploads/files && \
  mkdir -p uploads/images

COPY .npmrc package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY ./src nest-cli.json tsconfig.json tsconfig.build.json ./

RUN pnpm install @nestjs/cli@^8.0.0 && pnpm build

VOLUME [ "/nest-sharex/uploads", "/nest-sharex/thumbnails" ]

EXPOSE 3000
CMD [ "pnpm", "run", "start" ]