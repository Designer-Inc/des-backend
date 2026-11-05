# AGENTS.md — des-backend

Hono + TypeScript API на Cloudflare Workers. Auth, PostgreSQL і Storage — hosted Supabase.

Джерело істини API та схеми: [`des-docs`](https://github.com/Designer-Inc/des-docs). `contract/` — синхронізована копія; не редагуй її вручну.

## Спочатку прочитай

- `README.md`
- `CONTRIBUTING.md`
- `src/routes/README.md`
- `contract/README.md`
- `.dev.vars.example`
- `wrangler.toml`

Поточна версія контракту на 2026-11-05 — `contract-v1.1.2`; перевіряй `README.md` або `git log`.

## Локальна база

Production Supabase не використовуй для локальних тестів. Кожен розробник створює **власний безкоштовний** Supabase-проєкт:

- створити проєкт у dashboard;
- застосувати `supabase/migrations/*` і `supabase/seed.sql`;
- взяти URL, anon key, service_role key у свій `.dev.vars`;
- Auth URL Configuration для свого проєкту: `http://localhost:5173` + `http://localhost:5173/**`.

Деталі — у `CONTRIBUTING.md`. `.dev.vars` не комітиться і не передається в PR.

## Команди

```bash
bun install
bun run dev          # wrangler dev, http://localhost:8787
bun run check        # oxlint + tsc --noEmit + vitest
bun run db:push      # міграції до linked Supabase
bun run db:push:dry
bun run db:diff
bun run deploy       # wrangler deploy
scripts/smoke.sh     # health, config, categories, products, auth
scripts/sync-contract.sh contract-vX.Y.Z
```

Frontend локально ходить на `http://localhost:5173` і проксіює `/api` на `8787`.

## Архітектура

- `src/routes/health.ts`, `config.ts`, `auth.ts`, `catalog.ts` — робочі endpoint-и.
- `designs`, `uploads`, `cart`, `delivery`, `orders`, `moderation`, `admin` — TODO-заготовки.
- Помилки — через `AppError`, єдина форма `{ error: { code, message, details?, requestId } }`.
- Гроші — тільки цілі копійки (`*Minor`).
- Роль і permissions — з `public.users`, не з `user_metadata`.
- Refresh cookie: `HttpOnly; Secure; SameSite=Lax; Path=/`; `COOKIE_PATH` конфігурується.
- CORS: `APP_ORIGIN` завжди; localhost — тільки коли `APP_ENV !== "production"`.
- `expiresIn` береться з `session.expires_in`, не хардкодиться.

## Контракт і міграції

- `contract/` і `supabase/seed.sql` генеруються з `des-docs`; не редагуй вручну.
- `supabase/migrations/` — append-only. Не редагуй уже застосовану міграцію; додавай нову.
- Зміна API/схеми починається в `des-docs`, потім tag, потім `scripts/sync-contract.sh`.
- Seed — demo-only; не запускай на production без наміру.

## CI/CD

`.github/workflows/backend.yml`:

- `check` — lint, typecheck, tests, dry-run bundle; запускається на PR без секретів.
- `deploy` — на push у `main`: `supabase db push --remote` (якщо задані `SUPABASE_ACCESS_TOKEN` і `SUPABASE_PROJECT_REF`), потім `wrangler deploy`.

Секрети: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`; variable `SUPABASE_PROJECT_REF`.

Публічний репозиторій: не додавай ключі, `.dev.vars`, логи з токенами.

## PR

- Гілка `feat/...`, `fix/...`, `chore/...`; PR у `main`.
- Обов'язково `bun run check` і зелений `check`.
- 1 review + CODEOWNER; не пуш у `main`.
- Conventional Commits; без force-push.

## Не роби

- Не використовуй production Supabase для локальної розробки чи тестів.
- Не редагуй `contract/` або застосовані міграції.
- Не додавай локальні Supabase-контейнери; проєкт працює з hosted Supabase.
- Не коміть `node_modules/`, `dist/`, `.wrangler/`, `.dev.vars`.
- Не додавай нові endpoint-и без контракту й тестів.
