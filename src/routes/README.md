# Route modules

Каркас містить інфраструктуру і кілька робочих endpoint-ів. Решту треба реалізувати за `../openapi.yaml` з `des-docs`.

| Файл | Статус | Що додати |
| --- | --- | --- |
| `health.ts` | Готово | `GET /health` |
| `config.ts` | Готово | `GET /config` |
| `auth.ts` | Частково | register, login, refresh, logout, forgot, reset, email verify, Google, me |
| `catalog.ts` | Частково | `GET /categories`; TODO products, designs, search |
| `designs.ts` | TODO | CRUD чернеток, publish, fork, versions, stats, reports |
| `uploads.ts` | TODO | signed upload, complete, file delete |
| `cart.ts` | TODO | quote, pricing, discounts, delivery estimate |
| `delivery.ts` | TODO | Nova Poshta cities, warehouses, quote |
| `orders.ts` | TODO | create, list, detail, cancel, payment, invoice, shipment |
| `moderation.ts` | TODO | design queue, order queue, reports, decisions |
| `admin.ts` | TODO | catalog, orders, print queue, users, stats, audit |

## Правила

- Кожен handler повертає помилки через `AppError` або кидає її.
- Списки мають формат `{ items, page, limit, total, hasMore }`.
- Гроші тільки в копійках.
- Власність перевіряйте в handler-і, навіть якщо є RLS.
- Для мутацій з грошима або друком читайте `Idempotency-Key`.
- Не дублюйте бізнес-правила з `PRODUCT_SPEC.md` у випадкових місцях. Краще винести в `src/lib/`.
