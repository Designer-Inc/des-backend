# Synced contract

Копії контракту з [des-docs](https://github.com/Designer-Inc/des-docs).

Версія: `contract-v1.0.0`.

Файли:

- `openapi.yaml`
- `schema.sql`
- `seed.sql`

Не редагуйте їх вручну. Зміна починається в `des-docs`, після чого запускається:

```bash
scripts/sync-contract.sh contract-v1.0.1
```

Якщо `des-docs` лежить в іншому місці:

```bash
DES_DOCS_PATH=/path/to/des-docs scripts/sync-contract.sh contract-v1.0.1
```
