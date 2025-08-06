#!/bin/bash

# Vercel Post-Build Script
# This runs after the build to initialize the database

echo "🚀 Starting post-build initialization..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (creates tables)
echo "🗄️  Initializing database schema..."
npx prisma db push --force-reset

# Seed the database with servers and admin user
echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Post-build initialization complete!"
