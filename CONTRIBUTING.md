# Contributing

## Передумови

- Bun 1.4+
- Доступ до GitHub-репозиторію.
- Власний безкоштовний Supabase project для локальної БД. Production-проєкт `Designer` для розробки не використовуйте.

## Власна Supabase dev-база

Кожен розробник створює окремий проєкт на своєму акаунті:

1. https://supabase.com/dashboard → New project.
2. Застосуйте схему і seed.

   Варіант А — CLI:

   ```bash
   bunx supabase login
   bunx supabase link --project-ref <your-ref>
   bunx supabase db push --remote --include-seed --yes
   ```

   Варіант Б — SQL Editor: виконайте `supabase/migrations/20261105120000_init.sql`, потім `supabase/seed.sql`.

3. Dashboard → Project Settings → API: скопіюйте URL, anon key і service_role key у `.dev.vars`.
4. Dashboard → Authentication → URL Configuration: Site URL `http://localhost:5173`, redirect `http://localhost:5173/**`, `http://127.0.0.1:5173/**`. Це тільки для твого dev-проєкту; не додавай localhost у production.
5. Після `git pull` з новими міграціями: `bun run db:push` (проєкт уже linked).

Seed створює demo-користувачів з `DemoPass123!`; запускайте його тільки на своєму dev-проєкті. Free-проєкт може заснути після тижня без активності — розбудіть у Dashboard.

## Локальний запуск

```bash
git clone git@github.com:Designer-Inc/des-backend.git
bun install
cp .dev.vars.example .dev.vars
```

Заповніть `.dev.vars` ключами **свого** dev-проєкту. Не комітьте `.dev.vars` і не передавайте service role у PR.

```bash
bun run dev      # http://localhost:8787
bun run check    # lint + typecheck + tests
```

Frontend локально ходить на `http://localhost:5173` і проксіює `/api` на `8787`.

## PR-флоу

1. Гілка `feat/...`, `fix/...` або `chore/...`.
2. Pull request у `main`.
3. Дочекайтеся зеленого `check`.
4. Maintainer робить review і merge.
5. Merge у `main` запускає `deploy`: спочатку міграції (якщо налаштований Supabase token), потім Cloudflare Worker.

`main` захищений: потрібен PR, зелені перевірки `check` і review від CODEOWNER. Прямий push у `main` заблокований (admin може bypass).

## Контракт

- Зміна API/схеми починається в `des-docs`, а не тут.
- Після тегу контракту: `scripts/sync-contract.sh contract-vX.Y.Z`.
- `contract/` не редагується вручну.

## Міграції

- `supabase/migrations/` append-only.
- Не редагуйте вже застосовану міграцію; додавайте нову.
- На staging/dev застосовуйте через `bun run db:push` або CI.
- Схема production застосовується автоматично тільки якщо в GitHub задані `SUPABASE_ACCESS_TOKEN` і `SUPABASE_PROJECT_REF`.

## Секрети

- `.dev.vars`, service role, Cloudflare/Supabase токени — тільки локально або в GitHub Secrets.
- Не додавайте секрети в код, PR, логи або `contract/`.
