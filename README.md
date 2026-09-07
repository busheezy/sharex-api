# ShareX API

[![Codacy grade](https://img.shields.io/codacy/grade/405bde669e1c4330a68293c301d41a6e?style=for-the-badge)](https://app.codacy.com/gh/busheezy/sharex-api/dashboard)
[![Codacy coverage](https://img.shields.io/codacy/coverage/405bde669e1c4330a68293c301d41a6e?style=for-the-badge)](https://app.codacy.com/gh/busheezy/sharex-api/dashboard)

Self-hosted uploads for images, files, text, and short links. Built with NestJS and PostgreSQL, with OpenAPI documentation at `/docs` and the schema at `/docs-json`.

## Development

Use Node.js 24.19 or newer within the 24.x release line and pnpm 12.3.4. The versions are pinned in `.nvmrc` and `package.json`.

```sh
nvm use
npm install --global pnpm@12.3.4
pnpm install --frozen-lockfile
cp .env.example .env
docker compose up -d --wait db-dev
pnpm start:dev
```

Edit `.env` with your API key and database password before starting. The API listens on port 3000. `DB_HOST=localhost` is for local development; use your database service name when running in Docker.

## Uploads

Send `X-API-Key` with each upload. Successful uploads retain their existing JSON response, including `stringId`, `deleteKey`, and `deletePass`.

| Content | Upload    | Multipart field                         | Retrieve     |
| ------- | --------- | --------------------------------------- | ------------ |
| Image   | `POST /i` | `image`                                 | `GET /i/:id` |
| File    | `POST /f` | `file`                                  | `GET /f/:id` |
| Text    | `POST /p` | `paste`                                 | `GET /p/:id` |
| Link    | `POST /l` | JSON `{ "url": "https://example.com" }` | `GET /l/:id` |

Image URLs redirect to `/i/:id/:filename`. Thumbnails are available at `/i/:id/thumbnail`. Existing deletion URLs are preserved; keep deletion keys private.

Use the [installer](https://github.com/busheezy/sharex-api-installer) to generate ShareX uploader profiles and Docker Compose configuration. The [paste frontend](https://github.com/busheezy/sharex-paste-front) displays text, and the [VS Code extension](https://github.com/busheezy/vscode-sharex-api-uploader) uploads editor documents.

## Checks

```sh
pnpm check
pnpm build
pnpm test --runInBand
pnpm test:cov --runInBand
pnpm test:e2e
```

`pnpm check` runs Oxlint, Oxfmt verification, and TypeScript. Use `pnpm lint:fix` for lint fixes and `pnpm format` to format supported files. Install the workspace's recommended VS Code extensions for the same tools on save.

`pnpm test:e2e` starts a disposable PostgreSQL service on localhost:5433. If a failed run leaves it running, use `docker compose down db-test`. CI supplies its own database and runs `pnpm test:e2e:ci`. It also builds the container and uploads coverage without requiring secrets.

## Containers and upgrades

```sh
docker build -t sharex-api:local .
```

The runtime executes `dist/main.js`. Persist `/app/uploads` and `/app/thumbnails`; the installer now uses these paths too. Existing files stored inside an older container must be copied into the host-mounted upload directories before replacing it.

The application uses NestJS 12 and TypeORM 1.1 with the existing CommonJS runtime. TypeScript stays on 6.0.3 because Nest CLI and ts-jest require the compiler API that TypeScript 7 does not provide. Jest scripts enable Node VM modules to load ESM dependencies. All Nest packages use matching majors. Development mode still synchronizes the schema; production mode does not. Back up the database and uploads before an upgrade, and apply schema changes deliberately for production.

The development Compose file uses PostgreSQL 17. Do not attach an older PostgreSQL data directory to a new major version: keep your existing image version or perform a PostgreSQL migration first.

## Contributing

Follow the project's coding standards and Oxc configuration. Linting enforces braces, a maximum nesting depth of 3, a complexity limit of 10, and no nested ternaries. Do not add tests or code comments unless requested. CI checks every pull request; Dependabot checks dependency and action updates weekly.

## License and credits

MIT; see [LICENSE.txt](LICENSE.txt). Created by Ryan Bucshon. Thanks to [Sikari](https://github.com/Sikarii) for feedback.

## Image publishing

CI publishes `ghcr.io/busheezy/sharex-api:latest` and `sha-<commit>` tags after checks pass on `main`. Images support Linux amd64 and arm64. Pull requests build images without publishing them. Publishing uses the repository’s GitHub token; Docker Hub credentials are not required.
