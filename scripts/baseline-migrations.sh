#!/bin/bash
# Baseline існуючої продакшн-бази: позначити всі поточні міграції як застосовані.
# Запускати на сервері один раз, коли база вже має схему, а _prisma_migrations порожня.
# Після цього "npx prisma migrate deploy" буде застосовувати лише нові міграції.

set -e
cd "$(dirname "$0")/.."

echo "Baseline: позначення міграцій як застосованих..."

# Порядок як у prisma/migrations (лексичний за назвою папки)
npx prisma migrate resolve --applied "20250206120000_add_order_bonus_points_spent"
npx prisma migrate resolve --applied "20250206130000_add_order_loyalty_discount_amount"
npx prisma migrate resolve --applied "20250207120000_add_orders_missing_columns"
npx prisma migrate resolve --applied "20250208120000_add_newsletter_campaigns"
npx prisma migrate resolve --applied "20250209120000_ensure_newsletter_campaigns_table"
npx prisma migrate resolve --applied "20251210214431_init"

echo "Готово. Тепер можна запускати: npx prisma migrate deploy"
npx prisma migrate deploy
