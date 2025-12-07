# Running TeamBoard with Docker

This guide explains how to run the entire TeamBoard application using Docker Compose.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed (version 20.10 or later)
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually included with Docker Desktop)

## Quick Start

### 1. Navigate to Project Root

```bash
cd /path/to/course-project-zada
```

### 2. Build and Start All Services

```bash
docker-compose up --build
```

This command will:
- Build Docker images for frontend and backend
- Pull the PostgreSQL image
- Start all three services (frontend, backend, database)
- Show logs from all services

### 3. Access the Application

Once all services are running, you can access:

- **Frontend**: http://localhost:80 (or http://localhost)
- **Backend API**: http://localhost:3000
- **PostgreSQL Database**: localhost:5432

## Docker Compose Commands

### Start Services (in Background)

```bash
docker-compose up -d
```

The `-d` flag runs containers in detached mode (in the background).

### Stop Services

```bash
docker-compose down
```

This stops and removes all containers.

### Stop Services and Remove Volumes

```bash
docker-compose down -v
```

⚠️ **Warning**: This will delete all database data!

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up --build

# Or rebuild specific service
docker-compose up --build frontend
docker-compose up --build backend
```

### Check Service Status

```bash
docker-compose ps
```

### Execute Commands in Containers

```bash
# Access frontend container
docker-compose exec frontend sh

# Access backend container
docker-compose exec backend sh

# Access database
docker-compose exec db psql -U postgres -d teamboard
```

## Service Details

### Frontend Service
- **Port**: 80
- **Build Context**: `./frontend`
- **Image**: Multi-stage build (Node.js → Nginx)
- **Environment**: `VITE_API_BASE_URL=http://backend:3000/api/v1`

### Backend Service
- **Port**: 3000
- **Build Context**: `./backend`
- **Environment Variables**:
  - `PORT=3000`
  - `NODE_ENV=production`

### Database Service
- **Image**: `postgres:16-alpine`
- **Port**: 5432
- **Database**: `teamboard`
- **User**: `postgres`
- **Password**: `postgres`
- **Volume**: `postgres_data` (persists data)

## Environment Variables

### Frontend
The frontend uses the environment variable `VITE_API_BASE_URL` which is set in `docker-compose.yml`:
- In Docker: `http://backend:3000/api/v1` (uses internal Docker network)
- For local development: `http://localhost:3000/api/v1`

### Backend
If you need to configure backend environment variables, add them to the `backend` service in `docker-compose.yml`:

```yaml
backend:
  environment:
    - PORT=3000
    - NODE_ENV=production
    - DATABASE_URL=postgresql://postgres:postgres@db:5432/teamboard
    # Add other environment variables here
```

## Troubleshooting

### Port Already in Use

If you get an error that port 80, 3000, or 5432 is already in use:

1. **Change ports in docker-compose.yml**:
```yaml
frontend:
  ports:
    - "8080:80"  # Changed to 8080

backend:
  ports:
    - "3001:3000"  # Changed to 3001
```

2. **Or stop the service using the port**:
```bash
# Find what's using port 80
lsof -i :80
# or
sudo netstat -tulpn | grep :80
```

### Frontend Can't Connect to Backend

Make sure:
- Backend container is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- The API URL in docker-compose.yml uses `backend` (Docker service name), not `localhost`

### Database Connection Issues

1. Wait for database to be ready (it takes a few seconds)
2. Check database logs: `docker-compose logs db`
3. Verify connection from backend container:
```bash
docker-compose exec backend sh
# Inside container, test connection to db
```

### Rebuild Everything from Scratch

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images
docker-compose rm -f

# Rebuild
docker-compose up --build
```

## Development Workflow

### For Development

If you want to run services individually for development:

1. **Start only database**:
```bash
docker-compose up db
```

2. **Run frontend locally** (in another terminal):
```bash
cd frontend
npm install
npm run dev
```

3. **Run backend locally** (in another terminal):
```bash
cd backend
npm install
npm run dev
```

### For Production Testing

Use `docker-compose up` to test the production build.

## Clean Up

### Remove Everything

```bash
# Stop containers and remove volumes
docker-compose down -v

# Remove Docker images
docker rmi course-project-zada-frontend
docker rmi course-project-zada-backend

# Or remove all unused images
docker image prune -a
```

### Remove Only Containers

```bash
docker-compose down
```

## Docker Network

All services are on the same Docker network and can communicate using service names:
- Frontend → Backend: `http://backend:3000`
- Backend → Database: `db:5432`

## Next Steps

1. Make sure your backend API endpoints are implemented
2. Check that database migrations/initialization is set up
3. Test authentication flow
4. Verify CORS settings allow frontend to access backend

---

**Note**: The first build may take several minutes as it downloads base images and installs dependencies. Subsequent builds will be faster due to Docker layer caching.

