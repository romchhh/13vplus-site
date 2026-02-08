-- Створити таблицю newsletter_campaigns на сервері (якщо міграції ще не застосовані).
-- Запуск: psql -U postgres -d vplus -f scripts/create-newsletter-campaigns-table.sql
-- або: cat scripts/create-newsletter-campaigns-table.sql | psql $DATABASE_URL

CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_html" BOOLEAN NOT NULL DEFAULT false,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);
