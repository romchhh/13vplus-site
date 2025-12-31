#!/bin/bash

# Script to create 13vplus_db database
# Usage: ./scripts/create-db.sh

echo "🔍 Attempting to create database '13vplus_db'..."

# Try to create database using psql
# Use double quotes for database name since it starts with a number
PGPASSWORD=postgres psql -U postgres -h localhost -p 5432 -c 'CREATE DATABASE "13vplus_db";' 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database '13vplus_db' created successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Run migrations: npm run migrate"
    echo "   2. (Optional) Add test products: npm run add-test-products"
else
    echo ""
    echo "⚠️  If you see 'already exists' error, the database is already created."
    echo "   If you see connection errors, make sure PostgreSQL is running:"
    echo "   - macOS: brew services start postgresql"
    echo "   - Linux: sudo systemctl start postgresql"
    echo "   - Or check your PostgreSQL installation"
    echo ""
    echo "💡 You can also create it manually:"
    echo "   psql -U postgres -c 'CREATE DATABASE 13vplus_db;'"
fi

