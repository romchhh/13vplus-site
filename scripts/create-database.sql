-- Script to create the database manually
-- Run this command in your PostgreSQL terminal or using psql:
-- psql -U your_username -h your_host -f scripts/create-database.sql

-- Or connect to PostgreSQL and run:
-- CREATE DATABASE 13vplus_db;

-- If database already exists, you'll get an error, which is fine
-- You can check if database exists first:
SELECT 'CREATE DATABASE 13vplus_db;' 
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '13vplus_db')\gexec

