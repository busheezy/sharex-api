FROM node:16

RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY .npmrc package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod

COPY ./src nest-cli.json tsconfig.json tsconfig.build.json ./

RUN pnpm install @nestjs/cli@^8.0.0
RUN pnpm build

EXPOSE 3000
CMD [ "pnpm", "run", "start" ]