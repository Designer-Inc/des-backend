# des-backend

Hono API на Cloudflare Workers для проєкту «Дизайнер». Джерело істини контракту: [Designer-Inc/des-docs](https://github.com/Designer-Inc/des-docs).

## Стек

- Hono 4
- TypeScript
- Cloudflare Workers
- Supabase Auth, PostgreSQL, Storage
- Zod
- Vitest
- Oxlint

## Що вже працює

- `GET /health` з перевіркою Supabase.
- `GET /config` з 5 шрифтами, лімітами, кольорами, версіями текстів.
- `GET /categories` з Supabase.
- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`.
- `POST /auth/password/forgot`, `/auth/password/reset`, `/auth/email/verify`.
- `POST /auth/oauth/google`.
- `GET /auth/me` з JWT, роллю та permissions.
- Єдина форма помилок, request id, CORS, secure headers.

Решта endpoint-ів описана в `des-docs/openapi.yaml`. Модулі-заготовки лежать у `src/routes/`, див. `src/routes/README.md`.

## Локальний запуск

```bash
bun install
cp .dev.vars.example .dev.vars
# заповніть SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
bun run dev
```

Локальний Supabase:

```bash
bunx supabase start
bunx supabase db reset
bunx supabase status -o env
```

`supabase db reset` застосовує `supabase/migrations/20261105120000_init.sql` і `supabase/seed.sql`.

Потім запишіть у `.dev.vars` значення з `supabase status -o env`:

```env
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Схема і seed також лежать у синхронізованій копії `contract/`. Для чистого Postgres без Supabase CLI:

```bash
psql "$SUPABASE_DB_URL" -f contract/schema.sql
psql "$SUPABASE_DB_URL" -f contract/seed.sql
```

Демо-користувачі: `customer@demo.dyzainer.ua`, `author@demo.dyzainer.ua`, `moderator@demo.dyzainer.ua`, `admin@demo.dyzainer.ua`, `b2b@demo.dyzainer.ua`. Пароль: `DemoPass123!`.

## Скрипти

```bash
bun run dev             # wrangler dev
bun run supabase:start  # bunx supabase start
bun run supabase:stop   # bunx supabase stop
bun run supabase:status # bunx supabase status
bun run db:reset        # bunx supabase db reset
bun run typecheck       # tsc --noEmit
bun run lint            # oxlint src
bun run test            # vitest
bun run check           # lint + typecheck + test
bun run deploy          # wrangler deploy
```

Після старту backend і Supabase:

```bash
scripts/smoke.sh
```

Скрипт перевіряє `/health`, `/config`, `/categories`, логін customer/admin, `/auth/me`, refresh і logout.

## Env

| Змінна | Призначення |
| --- | --- |
| `SUPABASE_URL` | URL проєкту Supabase |
| `SUPABASE_ANON_KEY` | Anon key для Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role для БД і admin Auth. Тільки Workers secret |
| `APP_ORIGIN` | Frontend origin для CORS і redirect |
| `PUBLIC_ASSETS_BASE_URL` | База URL для шрифтів, напр. `http://localhost:5173/assets` |
| `COOKIE_SECURE` | `false` на localhost, `true` на HTTPS |
| `DEMO_MODE` | `true` для dev-заглушок |

`.dev.vars` не комітиться. У production:

```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## Auth

- Access token: Supabase JWT, `Authorization: Bearer`.
- Refresh token: HttpOnly cookie `refresh_token`, `Path=/auth`, 7 діб.
- Роль береться з `public.users`, а не з `user_metadata`.
- `GET /auth/me` повертає permissions для UI.
- CORS дозволяє `APP_ORIGIN`, `http://localhost:5173`, `http://localhost:4173` з credentials.
- На localhost `COOKIE_SECURE=false`, інакше браузер не збереже cookie.

## Контракт

- `contract/openapi.yaml`, `contract/schema.sql` і `contract/seed.sql` це синхронізовані копії з `des-docs`.
- Поточна версія: `contract-v1.0.0`.
- Не редагуйте їх вручну.
- Оновлення: зміна в `des-docs`, tag, потім `scripts/sync-contract.sh contract-vX.Y.Z`.
- Якщо `des-docs` лежить в іншому місці, задайте `DES_DOCS_PATH`.
- Перевірка: `bun run check`, потім smoke на staging.

## Межі каркаса

- Немає реалізації products, designs, uploads, cart, delivery, orders, moderation, admin.
- Немає реальних LiqPay, Nova Poshta, Resend, R2, print worker.
- Немає RLS-тестів і e2e.
- CI є: lint, typecheck, test і dry-run bundle. Деплой на staging не автоматизований, бо потребує Cloudflare secrets.

## Деплой

```bash
bun run deploy
```

Перед деплоєм перевірте `wrangler.toml`, secrets і `APP_ORIGIN`. Не деплойте з `.dev.vars`.
