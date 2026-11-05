# des-backend

Hono API на Cloudflare Workers для проєкту «Дизайнер». Джерело істини контракту: [Designer-Inc/des-docs](https://github.com/Designer-Inc/des-docs).

Перед роботою: [CONTRIBUTING.md](CONTRIBUTING.md).

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
- `GET /products` і `/products/:productId` з категорією, варіантами, зонами друку та знижками.
- `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`.
- `POST /auth/password/forgot`, `/auth/password/reset`, `/auth/email/verify`.
- `POST /auth/oauth/google`.
- `GET /auth/me` з JWT, роллю та permissions.
- Єдина форма помилок, request id, CORS, secure headers.

Решта endpoint-ів описана в `des-docs/openapi.yaml`. Модулі-заготовки лежать у `src/routes/`, див. `src/routes/README.md`.

## Frontend

`des-frontend` — SvelteKit 3 на Cloudflare Workers. Публічні сторінки SSR/SSG, редактор CSR. `/api/*` проксіюється на цей Worker, тому браузер працює same-origin.

## Supabase (hosted)

Локальні контейнери не використовуються. Потрібен проєкт у [Supabase Dashboard](https://supabase.com/dashboard).

1. Увійдіть і прив'яжіть проєкт:

```bash
bunx supabase login
bunx supabase link --project-ref <project-ref>
```

2. Застосуйте міграції:

```bash
bunx supabase db push --remote
```

CLI запитає пароль бази. Для CI задайте `SUPABASE_ACCESS_TOKEN` і `SUPABASE_DB_PASSWORD`. Без `--remote` CLI цілиться в локальний стек.

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
APP_ENV=development
PUBLIC_ASSETS_BASE_URL=http://localhost:5173/assets
COOKIE_SECURE=false
COOKIE_PATH=/
DEMO_MODE=true
```

5. Налаштуйте Dashboard → Authentication → URL Configuration:

- Site URL: `https://designer.r0ma.top`
- Redirect URLs: `https://designer.r0ma.top/**`
- Email provider увімкнений; за потреби — Google.

Localhost-URL додавайте тільки у власний dev-проєкт (див. `CONTRIBUTING.md`). Production-проєкт локальні адреси не потребує.

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
bun run db:diff         # diff схеми з hosted
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

Скрипт перевіряє `/health`, `/config`, `/categories`, `/products`, логін customer/admin, `/auth/me`, refresh і logout.

## CI/CD

`.github/workflows/backend.yml`:

- `check` — lint, typecheck, tests і dry-run bundle на push/PR.
- `deploy` — на push у `main` виконує `bunx wrangler deploy` у Cloudflare Workers.

GitHub Secrets:

| Secret | Призначення |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Токен із правами Workers Scripts: Edit і Workers Routes: Edit |
| `CLOUDFLARE_ACCOUNT_ID` | ID акаунта Cloudflare |
| `SUPABASE_ACCESS_TOKEN` | Опційно: автоматичні міграції БД на `main` |
| `SUPABASE_DB_PASSWORD` | Опційно: пароль БД для CLI у CI |

`SUPABASE_PROJECT_REF` — repository variable, не secret.

На push у `main` deploy job спочатку виконує `supabase db push --remote`, якщо задані `SUPABASE_ACCESS_TOKEN` і `SUPABASE_PROJECT_REF`. Інакше міграції пропускаються з warning, а код деплоїться. Це означає, що без Supabase-токена зміни схеми не застосуються автоматично.

Worker: `https://api.designer.r0ma.top`.

Браузер у production ходить на `https://designer.r0ma.top/api`, а не напряму на `api.`. `api.` — upstream для SvelteKit.

Runtime-секрети Worker задаються один раз:

```bash
bunx wrangler secret put SUPABASE_URL
bunx wrangler secret put SUPABASE_ANON_KEY
bunx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

`api.designer.r0ma.top` — custom domain. Для субдомена другого рівня в зоні `r0ma.top` потрібен Total TLS.

## Env

| Змінна | Призначення |
| --- | --- |
| `SUPABASE_URL` | URL hosted-проєкту, `https://<ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon key для Auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role для БД і admin Auth. Тільки Workers secret |
| `APP_ORIGIN` | Frontend origin для CORS і redirect |
| `APP_ENV` | `development` або `production`; `production` блокує localhost CORS |
| `PUBLIC_ASSETS_BASE_URL` | База URL для шрифтів, напр. `http://localhost:5173/assets` |
| `COOKIE_SECURE` | `false` на localhost, `true` на HTTPS |
| `COOKIE_PATH` | Шлях refresh-cookie; у production `/` для same-origin `/api/auth/*` |
| `DEMO_MODE` | `true` для dev-заглушок |

`.dev.vars` не комітиться. У production:

```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## Auth

- Access token: Supabase JWT, `Authorization: Bearer`.
- `expiresIn` повертається з `session.expires_in`, без хардкоду.
- Refresh token: HttpOnly cookie `refresh_token`, `Path=/`, 7 діб. Same-origin через SvelteKit proxy.
- Роль береться з `public.users`, а не з `user_metadata`.
- `GET /auth/me` повертає permissions для UI.
- CORS дозволяє `APP_ORIGIN`; localhost дозволений тільки поза `APP_ENV=production`. У production браузер ходить через `/api`, тому CORS не потрібен.
- На localhost `COOKIE_SECURE=false`, інакше браузер не збереже cookie.

## Контракт

- `contract/openapi.yaml`, `contract/schema.sql` і `contract/seed.sql` це синхронізовані копії з `des-docs`.
- Поточна версія: `contract-v1.1.2`.
- Не редагуйте їх вручну.
- Оновлення: зміна в `des-docs`, tag, потім `scripts/sync-contract.sh contract-vX.Y.Z`.
- Якщо `des-docs` лежить в іншому місці, задайте `DES_DOCS_PATH`.
- `supabase/migrations/` append-only: після застосування до hosted-проєкту не перезаписуйте міграції, додавайте нові.
- `sync-contract.sh` створює початкову міграцію лише якщо її ще немає.
- Перевірка: `bun run check`, потім smoke на staging.

## Межі каркаса

- Products реалізовані read-only: list/detail. Немає designs, uploads, cart, delivery, orders, moderation, admin.
- Немає реальних LiqPay, Nova Poshta, Resend, R2, print worker.
- Немає RLS-тестів і e2e.
- CI + auto-deploy на `main` для Worker `des-backend`.

## Деплой

Auto-deploy на push у `main`. Вручну:

```bash
bun run deploy
```

Перед деплоєм перевірте `wrangler.toml`, secrets і `APP_ORIGIN`. Не деплойте з `.dev.vars`.
