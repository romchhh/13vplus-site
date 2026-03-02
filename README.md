This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Database Setup

1. **Скопіюйте приклад змінних середовища:**
   ```bash
   cp .env.example .env
   ```
   Відредагуйте `.env` і вкажіть правильний `DATABASE_URL` (хост, логін, пароль, порт).

2. **Створення нової бази даних**

   **Варіант A (рекомендовано):** у `.env` вже вказано `DATABASE_URL` з назвою бази (наприклад `wellness_site`). Тоді просто:
   ```bash
   npm run create-db
   ```

   **Варіант B:** створити нову БД з іншою назвою (скрипт виведе рядок для `.env`):
   ```bash
   npm run create-new-db
   # або з іменем: npx ts-node --project tsconfig.scripts.json scripts/create-new-db.ts my_database_name
   ```
   Скопіюйте виведений `DATABASE_URL` у `.env`.

3. **Застосування міграцій (схема таблиць):**
   ```bash
   npm run migrate
   ```

4. **(Опціонально)** Тестові товари та категорії:
   ```bash
   npm run add-test-products
   npm run seed-test-categories
   ```

**Ручне створення БД через psql:**
```bash
psql -U your_username -h your_host
CREATE DATABASE wellness_site;
```
Потім у `.env` вкажіть: `DATABASE_URL="postgresql://user:password@host:5432/wellness_site"`.

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

TODO:

- Думаю додати сортування замовлень по статусах
- пофіксить, що на клієнті інша адреса завантаження картинок. Тут коротше білдиться сайт і нові файли ж ніяк не отримає в уже збілдженому форматі. Тому треба або перезапускать серв, або вигружати кудись.

.env:
DATABASE_URL="?"
ADMIN_USER="?"
ADMIN_PASS="?"
BOT_TOKEN="?"
CHAT_ID="?"
NEXT_PUBLIC_NOVA_POSHTA_API_KEY="?"
MERCHANT_ACCOUNT="?" (або WAYFORPAY_MERCHANT_ACCOUNT)
MERCHANT_SECRET="?" (або WAYFORPAY_MERCHANT_SECRET)
MERCHANT_DOMAIN="?" (або WAYFORPAY_MERCHANT_DOMAIN, опціонально)
NEXT_PUBLIC_PUBLIC_URL="?"
