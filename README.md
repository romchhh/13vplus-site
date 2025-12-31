This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Database Setup

Before running the application, you need to create the database:

**Option 1: Using the script (recommended)**
```bash
npm run create-db
```

**Option 2: Manual creation via psql**
```bash
# Connect to PostgreSQL
psql -U your_username -h your_host

# Create the database
CREATE DATABASE 13vplus_db;

# Or use the SQL script
psql -U your_username -h your_host -f scripts/create-database.sql
```

**After creating the database, setup the schema:**
```bash
# First, create all tables from Prisma schema
npm run setup-db

# Then, run custom migrations (if needed)
npm run migrate
```

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
PLISIO_API_KEY="?" (для оплати криптовалютою)
NEXT_PUBLIC_PUBLIC_URL="?"
