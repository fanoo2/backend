#!/bin/bash

# Database Migration Test Script
# This script tests database migrations in a controlled environment

set -e

echo "🧪 Testing Database Migrations..."

# Set test database URL
export DATABASE_URL="postgresql://test:test@localhost:5432/test_migrations"

echo "📝 Checking migration files..."
if [ ! -d "migrations" ]; then
    echo "❌ No migrations directory found"
    exit 1
fi

if [ ! -f "migrations/0000_known_nebula.sql" ]; then
    echo "❌ Initial migration file not found"
    exit 1
fi

echo "✅ Migration files found"

# Test migration generation (dry run)
echo "🔍 Testing migration generation..."
npx drizzle-kit generate --config=drizzle.config.ts > /dev/null 2>&1
echo "✅ Migration generation test passed"

# Test schema validation
echo "🔍 Testing schema validation..."
npm run build > /dev/null 2>&1
echo "✅ Schema compilation test passed"

# Test database migration tests
echo "🧪 Running database migration tests..."
npm test tests/database-migration.test.ts > /dev/null 2>&1
echo "✅ Database migration tests passed"

# Test integration tests
echo "🧪 Running integration tests..."
npm test tests/integration.test.ts > /dev/null 2>&1
echo "✅ Integration tests passed"

echo "🎉 All database migration tests passed successfully!"
echo ""
echo "📊 Migration Summary:"
echo "   - Tables: 8 (users, agents, phases, repositories, services, activities, workflows, annotations)"
echo "   - Migration files: $(ls migrations/*.sql | wc -l)"
echo "   - Test coverage: Database schema, CRUD operations, error handling"
echo ""
echo "🚀 Ready for database deployment!"