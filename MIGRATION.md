# Migration: September 7, 2026

This guide covers `ee20b56` (the last commit before September 7 in America/Chicago) through `4d7abe1`. It includes all of that day's application and tooling changes up to that revision.

## Upgrade an existing server

The API routes, API key header, upload response fields, deletion keys, and database entity columns remain compatible. No application SQL migration is included or required by the entity changes in this range. Keep existing database contents, file names, IDs, and credentials. The NestJS/TypeORM upgrade should first be checked against a restored copy of your database.

1. Schedule a maintenance window and stop uploads. Record the running image IDs/digests, Compose project name, mounts, and configuration. Back up the database, uploads, thumbnails, and `.env`. Keep the old containers and volumes until the upgraded server has been verified.
2. Keep the existing PostgreSQL major version and data mount for this application upgrade. The new PostgreSQL 17 default is for new setups; do not point it at a PostgreSQL 14 or other major-version data directory. A database major upgrade is a separate dump/restore or `pg_upgrade` operation.
3. Check where the old API actually stores files before recreating it. The pre-change Dockerfile already used `/app`, but older installer configurations mounted `/nest-sharex/uploads` and `/nest-sharex/thumbnails`. Those mounts may not contain the active data. Inspect the container's working directory and mounts; recover the actual `uploads` and `thumbnails` directories from the container or its anonymous volumes into backup directories first.
4. Populate the persistent host directories from that backup, preserving the `images` and `files` subdirectories and stored filenames. Reconcile any existing host files before copying over them. Configure the new mounts as shown below. If an older image really used `/nest-sharex`, recover from that location instead.
5. Change Docker Hub image references to `ghcr.io/busheezy/sharex-api`. Use a published `sha-<full-commit-SHA>` tag or recorded digest for a reproducible rollout, or build the selected checkout locally. Confirm its CI container job has succeeded before pulling; a source push alone does not make an image available.
6. Preserve `API_KEY`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and `FRONT_API_URL`. In Docker, `DB_HOST` is the database service name, not `localhost`. Keep your existing `NODE_ENV`; production still disables schema synchronization. Do not switch to development to force an upgrade.
7. Validate Compose and recreate only the API after the database is ready. For the installer's service names, run the commands below one at a time, stopping on failure. Upgrade the frontend afterward using its migration guide.

```yaml
volumes:
  - ./docker/nest-sharex/uploads:/app/uploads
  - ./docker/nest-sharex/thumbnails:/app/thumbnails
```

Run from your existing deployment directory, using its existing Compose project name/options:

```sh
docker compose config --quiet
docker compose pull api
docker compose up -d --no-deps --force-recreate api
docker compose logs --tail=100 api
```

The Docker runtime changes from Node 20 to Node 26.8.1. Custom process managers or Docker commands must start `node dist/main.js`, replacing `node dist/src/main.js`. Source deployments must preserve the working directory containing `uploads/` and `thumbnails/`.

## Verify and roll back

Check `/docs` and `/docs-json`, then open existing image, thumbnail, file, paste, and short-link URLs. Upload one disposable item of each type using your existing ShareX profiles and verify retrieval and deletion. Image base URLs still redirect to a filename URL; filenames are now URL-encoded. Missing multipart files now return a client error, so custom upload clients must send `image`, `file`, or `paste` as appropriate.

If validation fails, stop new writes and restore the saved API image and configuration with the correct data mounts. Keep the database on its original major version. Restore database and file backups together if data restoration is necessary; account for any writes since the backup before doing so. Do not use `docker compose down -v` as an upgrade or rollback step.

## Local database changes

The development Compose configuration now gives `db-dev` an explicit named volume and pins PostgreSQL 17. The old configuration relied on the image's anonymous storage. Before recreating `db-dev`, back up any data you need and record its old volume and server version. Either retain that version and volume explicitly or restore a compatible logical backup into the new database; the new named volume does not import old data automatically. `db-test` now uses disposable tmpfs storage.

## Building from source

Use the repository's `.nvmrc` (Node 24.19.0) and pnpm 12.3.4 instead of the old Node/package-manager setup. From the updated checkout:

```sh
nvm use
npm install --global pnpm@12.3.4
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

Keep the committed lockfile. Update custom CI jobs and editor integrations to use `pnpm check`, Oxlint, and Oxfmt instead of the removed ESLint/Prettier setup. Format with `pnpm format`.

The API supports Node 24 and 26 in CI; `.nvmrc` selects 24 locally. Existing unit tests can be run with `pnpm test --runInBand`. The scripts supply the VM-module option needed by ESM dependencies. Custom test runners must preserve that option. TypeScript remains on 6.0.3 for Nest CLI and ts-jest compatibility.

For generated stacks, also follow the [installer migration](https://github.com/busheezy/sharex-api-installer/blob/main/MIGRATION.md) and [frontend migration](https://github.com/busheezy/sharex-paste-front/blob/main/MIGRATION.md).
