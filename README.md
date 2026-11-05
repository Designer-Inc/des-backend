# des-backend

Hono API на Cloudflare Workers для проєкту «Дизайнер». Джерело істини контракту: [Designer-Inc/des-docs](https://github.com/Designer-Inc/des-docs).

## Стек

- Hono 4
- TypeScript
- Cloudflare Workers
- Supabase Auth, PostgreSQL, Storage (hosted)
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

## Supabase (hosted)

Локальні контейнери не використовуються. Потрібен проєкт у [Supabase Dashboard](https://supabase.com/dashboard).

1. Увійдіть і прив'яжіть проєкт:

```bash
bunx supabase login
bunx supabase link --project-ref <project-ref>
```

2. Застосуйте міграції:

```bash
bunx supabase db push
```

CLI запитає пароль бази. Для CI задайте `SUPABASE_ACCESS_TOKEN` і `SUPABASE_DB_PASSWORD`.

3. Візьміть ключі в Dashboard → Project Settings → API.

4. Створіть `.dev.vars`:

```bash
cp .dev.vars.example .dev.vars
```

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APP_ORIGIN=http://localhost:5173
PUBLIC_ASSETS_BASE_URL=http://localhost:5173/assets
COOKIE_SECURE=false
DEMO_MODE=true
```

5. Налаштуйте Dashboard → Authentication → URL Configuration:

- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/**` і production-frontend.
- Email provider увімкнений; за потреби — Google.

6. Запустіть API:

```bash
bun install
bun run dev
```

`supabase db push` застосовує `supabase/migrations/20261105120000_init.sql`. Seed автоматично не застосовується.

## Демо-дані

Seed призначений тільки для demo/staging. Він створює користувачів з відомим паролем, тому не запускайте його на production.

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
```

`SUPABASE_DB_URL` — пряме підключення з Dashboard → Connect.

Демо-користувачі: `customer@demo.dyzainer.ua`, `author@demo.dyzainer.ua`, `moderator@demo.dyzainer.ua`, `admin@demo.dyzainer.ua`, `b2b@demo.dyzainer.ua`. Пароль: `DemoPass123!`.

## Скрипти

```bash
bun run dev             # wrangler dev
bun run db:link         # bunx supabase link
bun run db:push         # застосувати міграції до hosted Supabase
bun run db:push:dry     # показати міграції без застосування
bun run db:diff         # diff схеми
bun run typecheck       # tsc --noEmit
bun run lint            # oxlint src
bun run test            # vitest
bun run check           # lint + typecheck + test
bun run deploy          # wrangler deploy
```

Після старту API і застосування demo seed:

```bash
scripts/smoke.sh
```

Скрипт перевіряє `/health`, `/config`, `/categories`, логін customer/admin, `/auth/me`, refresh і logout.

## Env

| Змінна | Призначення |
| --- | --- |
| `SUPABASE_URL` | URL hosted-проєкту, `https://<ref>.supabase.co` |
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
- `expiresIn` повертається з `session.expires_in`, без хардкоду.
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
- `supabase/migrations/` append-only: після застосування до hosted-проєкту не перезаписуйте міграції, додавайте нові.
- `sync-contract.sh` створює початкову міграцію лише якщо її ще немає.
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
