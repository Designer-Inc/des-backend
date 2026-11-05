# AGENTS.md — des-backend

## Призначення файлу

Цей файл описує, **як агенти працюють з репозиторієм**. Це не звіт про поточний стан, не список реалізованих endpoint-ів і не changelog.

Не оновлюй цей файл під кожну фічу, версію або зміну стану. Актуальний стан читай у:

- `README.md`
- `CONTRIBUTING.md`
- `src/routes/README.md`
- `contract/README.md`
- `git log` і `git tag`
- `des-docs` (`CHANGELOG.md`, `openapi.yaml`)

`des-backend` — реалізація API. Джерело істини API та схеми — [`des-docs`](https://github.com/Designer-Inc/des-docs). `contract/` — синхронізована копія; не редагуй її вручну.

## Спочатку прочитай

- `README.md`
- `CONTRIBUTING.md`
- `src/routes/README.md`
- `contract/README.md`
- `.dev.vars.example`
- `wrangler.toml`
- `package.json`

Не покладайся на цей файл як на джерело поточного стану.

## Локальна розробка

- Використовуй Bun і наявний lockfile.
- Кожен розробник використовує **власний** безкоштовний Supabase-проєкт. Production Supabase не використовуй для локальних тестів.
- `.dev.vars` зберігається тільки локально; не коміть його і не передавай у PR.
- Застосування схеми/seed до власного проєкту — за інструкцією `CONTRIBUTING.md`.
- Frontend локально працює окремо на `localhost:5173` і ходить через `/api` proxy.
- Локальні Supabase-контейнери не є частиною цього репозиторію; сервіс hosted.

## Контракт і міграції

- Зміна API/схеми починається в `des-docs`.
- Після tag контракту: `scripts/sync-contract.sh contract-vX.Y.Z`.
- `contract/` і `supabase/seed.sql` — синхронізовані файли; не редагуй вручну.
- `supabase/migrations/` — append-only. Не редагуй уже застосовану міграцію; додавай нову.
- Seed — demo-only. Не запускай його на production без наміру.
- Не додавай endpoint без контракту й тестів.

## Команди

Використовуй scripts з `package.json`; не вигадуй нові команди й не змінюй package manager.

```bash
bun install
bun run dev
bun run check
bun run db:push
bun run db:push:dry
bun run db:diff
bun run deploy
scripts/smoke.sh
scripts/sync-contract.sh contract-vX.Y.Z
```

## Архітектурні правила

- Помилки — через `AppError` і єдину форму відповіді з `requestId`.
- Гроші — тільки цілі копійки (`*Minor`).
- Роль і permissions — з `public.users`, не з `user_metadata`.
- Refresh cookie: `HttpOnly; Secure; SameSite=Lax`; шлях конфігурується.
- CORS: `APP_ORIGIN` завжди; localhost — тільки поза production.
- `expiresIn` береться з `session.expires_in`, не хардкодиться.
- Ці правила не змінюй без відповідної зміни контракту й тестів.

## CI/CD

- Workflow: `.github/workflows/backend.yml`.
- PR-перевірки не отримують production-секретів.
- Merge у `main` застосовує міграції (коли CI налаштований) і деплоїть Worker.
- Секрети й потрібні змінні описані в `README.md`. Не друкуй їх і не коміть.
- Не пуш у `main`: працюй через PR, green checks і review/CODEOWNER.
- Conventional Commits. Без force-push.

Якщо PR з форка, workflows можуть вимагати ручного approve від maintainer.

## Безпека

Репозиторій публічний. Не додавай:

- `.dev.vars`, service role, Cloudflare/Supabase токени;
- логи або дампи з credentials;
- персональні дані й production-дані в тестах.

Production-дані не є тестовими. Не запускай destructive-команди проти production.

## Заборонено

- Використовувати production Supabase для локальної розробки.
- Редагувати `contract/` або вже застосовані міграції.
- Додавати локальні Supabase-контейнери без зміни інструкцій/контракту.
- Комітити `node_modules/`, `dist/`, `.wrangler/`, `.dev.vars`.
- Додавати endpoint без контракту й тестів.
- Пушити в `main`, робити force-push або переписувати теги.
- Дублювати в цьому файлі поточний список реалізованих endpoint-ів або версію контракту.
