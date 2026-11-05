# Contributing

## Передумови

- Bun 1.4+
- Доступ до GitHub-репозиторію.
- **Окремий Supabase dev-проєкт** для локальних тестів. Не використовуйте production-проєкт `Designer` для розробки: там живі demo-дані й service role.

## Локальний запуск

```bash
git clone git@github.com:Designer-Inc/des-backend.git
bun install
cp .dev.vars.example .dev.vars
```

Заповніть `.dev.vars` ключами dev-проєкту Supabase. Ключі видає maintainer; не комітьте `.dev.vars` і не передавайте service role у PR.

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
