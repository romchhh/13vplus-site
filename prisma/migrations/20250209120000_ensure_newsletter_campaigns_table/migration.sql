-- Ensure newsletter_campaigns exists (idempotent: safe if previous migration was skipped or DB was reset)
CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
    "id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_html" BOOLEAN NOT NULL DEFAULT false,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);
