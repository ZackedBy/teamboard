#!/bin/bash
# Debug script to check PostgreSQL setup

echo "=== Checking PostgreSQL Container ==="
echo ""

echo "1. Container status:"
docker compose -f docker-compose.staging.yml ps postgres
echo ""

echo "2. Container environment variables:"
docker exec course-project-zada-postgres-1 env | grep POSTGRES
echo ""

echo "3. Container logs (last 20 lines):"
docker logs course-project-zada-postgres-1 --tail 20
echo ""

echo "4. Checking if database is ready:"
docker exec course-project-zada-postgres-1 pg_isready -U postgres 2>&1 || echo "pg_isready failed"
echo ""

echo "5. Trying to list databases:"
docker exec course-project-zada-postgres-1 psql -U postgres -l 2>&1 || echo "Failed to list databases"
echo ""

echo "6. Checking what users exist (trying different methods):"
# Try to connect without specifying user (uses default)
docker exec course-project-zada-postgres-1 psql -d postgres -c "\du" 2>&1 || echo "Failed"
echo ""

echo "7. Checking PostgreSQL data directory:"
docker exec course-project-zada-postgres-1 ls -la /var/lib/postgresql/data/ 2>&1 | head -10
echo ""

