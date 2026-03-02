-- Single init migration: full schema for wellness-site (matches schema.prisma)

-- Users & auth (no deps)
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "email_verified" TIMESTAMP(3),
  "image" TEXT,
  "password" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "clothing_size" TEXT,
  "birth_date" TIMESTAMP(3),
  "bonus_points" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accounts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
  "id" TEXT NOT NULL,
  "session_token" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

-- Catalog
CREATE TABLE "categories" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "media_type" TEXT,
  "media_url" TEXT,
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "subcategories" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT,
  "category_id" INTEGER NOT NULL,
  CONSTRAINT "subcategories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT,
  "subtitle" TEXT,
  "release_form" TEXT,
  "course" TEXT,
  "package_weight" TEXT,
  "main_info" TEXT,
  "short_description" TEXT,
  "description" TEXT,
  "main_action" TEXT,
  "indications_for_use" TEXT,
  "benefits" TEXT,
  "full_composition" TEXT,
  "usage_method" TEXT,
  "contraindications" TEXT,
  "storage_conditions" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "old_price" DECIMAL(10,2),
  "discount_percentage" INTEGER,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "top_sale" BOOLEAN NOT NULL DEFAULT false,
  "in_stock" BOOLEAN NOT NULL DEFAULT true,
  "limited_edition" BOOLEAN NOT NULL DEFAULT false,
  "season" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "stock" INTEGER NOT NULL DEFAULT 0,
  "category_id" INTEGER,
  "subcategory_id" INTEGER,
  "fabric_composition" TEXT,
  "has_lining" BOOLEAN NOT NULL DEFAULT false,
  "lining_description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_media" (
  "id" SERIAL NOT NULL,
  "product_id" INTEGER NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  CONSTRAINT "product_media_pkey" PRIMARY KEY ("id")
);

-- Orders
CREATE TABLE "orders" (
  "id" SERIAL NOT NULL,
  "user_id" TEXT,
  "customer_name" TEXT NOT NULL,
  "phone_number" TEXT NOT NULL,
  "email" TEXT,
  "delivery_method" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "post_office" TEXT NOT NULL,
  "comment" TEXT,
  "payment_type" TEXT NOT NULL,
  "invoice_id" TEXT NOT NULL,
  "payment_status" TEXT NOT NULL DEFAULT 'pending',
  "bonus_points_spent" INTEGER NOT NULL DEFAULT 0,
  "loyalty_discount_amount" DECIMAL(10,2),
  "status" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
  "id" SERIAL NOT NULL,
  "order_id" INTEGER NOT NULL,
  "product_id" INTEGER,
  "product_name" TEXT,
  "size" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "color" TEXT,
  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- Wishlist
CREATE TABLE "wishlist" (
  "id" SERIAL NOT NULL,
  "user_id" TEXT NOT NULL,
  "product_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- Newsletter
CREATE TABLE "newsletter_campaigns" (
  "id" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "is_html" BOOLEAN NOT NULL DEFAULT false,
  "sent_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "newsletter_campaigns_pkey" PRIMARY KEY ("id")
);

-- Unique indexes
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");
CREATE UNIQUE INDEX "subcategories_slug_key" ON "subcategories"("slug");
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");
CREATE UNIQUE INDEX "orders_invoice_id_key" ON "orders"("invoice_id");
CREATE UNIQUE INDEX "wishlist_user_id_product_id_key" ON "wishlist"("user_id", "product_id");

-- Indexes
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");
CREATE INDEX "users_email_idx" ON "users"("email");

-- Foreign keys
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
