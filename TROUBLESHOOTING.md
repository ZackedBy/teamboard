# Troubleshooting Guide

## Common Docker Issues

### Backend Container Restarting

**Symptom**: Backend container shows "Restarting" status in Docker Desktop.

**Cause**: Usually because the database isn't ready when the backend tries to connect.

**Solution**:
1. Check logs: `docker-compose logs backend`
2. Ensure database is running: `docker-compose ps`
3. Restart services: `docker-compose down && docker-compose up --build`

### Database Container Not Starting

**Symptom**: Database shows "Created" but not "Running".

**Solution**:
1. Check logs: `docker-compose logs db`
2. Try removing and recreating:
   ```bash
   docker-compose down -v
   docker-compose up db
   ```
3. Check if port 5432 is already in use:
   ```bash
   lsof -i :5432
   ```

### Connection Errors (ENOTFOUND db)

**Symptom**: `Error: getaddrinfo ENOTFOUND db`

**Cause**: Backend trying to connect before database is ready.

**Solution**: The docker-compose.yml now includes healthchecks. If issues persist:
1. Stop all containers: `docker-compose down`
2. Start database first: `docker-compose up db`
3. Wait for it to be healthy, then start backend: `docker-compose up backend`

### Port Already in Use

**Symptom**: `Port X is already in use`

**Solution**:
1. Find what's using the port:
   ```bash
   lsof -i :80   # Frontend
   lsof -i :3000 # Backend
   lsof -i :5432 # Database
   ```
2. Either stop the conflicting service or change ports in docker-compose.yml

### Frontend Can't Connect to Backend

**Symptom**: Frontend loads but API calls fail.

**Solution**:
1. Verify backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Test backend directly: `curl http://localhost:3000/api/v1`
4. Verify CORS settings in backend/app.js

### Database Connection Issues

**Symptom**: Backend logs show database connection errors.

**Solution**:
1. Verify database is healthy:
   ```bash
   docker-compose exec db pg_isready -U postgres
   ```
2. Test connection manually:
   ```bash
   docker-compose exec db psql -U postgres -d teamboard
   ```
3. Check environment variables match between backend and db services

## Quick Fixes

### Reset Everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### View All Logs
```bash
docker-compose logs -f
```

### Restart Specific Service
```bash
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

### Check Service Status
```bash
docker-compose ps
```

### Access Container Shell
```bash
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec db sh
```

## Cleanup

### Remove All Containers and Images
```bash
docker-compose down -v
docker rmi course-project-zada-frontend course-project-zada-backend
```

### Remove Unused Docker Resources
```bash
docker system prune -a
```

