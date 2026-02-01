#!/bin/bash

# Script to initialize user authentication system

echo "🚀 Initializing user authentication system..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  .env file not found. Creating from .env.example..."
  cp .env.example .env
  echo "✅ .env file created. Please update it with your credentials."
  echo ""
  echo "Required credentials:"
  echo "1. NEXTAUTH_SECRET - Generate with: openssl rand -base64 32"
  echo "2. GOOGLE_CLIENT_ID - From Google Cloud Console"
  echo "3. GOOGLE_CLIENT_SECRET - From Google Cloud Console"
  echo ""
  read -p "Press enter to continue after updating .env file..."
fi

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run migration
echo "🗄️  Running database migration..."
if [ -n "$DATABASE_URL" ]; then
  psql "$DATABASE_URL" -f prisma/migrations/add_user_auth.sql
  echo "✅ Migration completed successfully!"
else
  echo "⚠️  DATABASE_URL not set. Please run migration manually:"
  echo "   psql \$DATABASE_URL -f prisma/migrations/add_user_auth.sql"
fi

echo ""
echo "✅ User authentication system initialized!"
echo ""
echo "Next steps:"
echo "1. Configure Google OAuth credentials in .env"
echo "2. Start the development server: npm run dev"
echo "3. Test login at http://localhost:3000"
echo ""
