# Restart Policy Testing Guide

## Restart Policy Configuration

All services in both `docker-compose.yml` and `docker-compose.staging.yml` now use:
- **`restart: unless-stopped`** - Automatically restarts containers if they crash or if Docker daemon restarts, but won't restart if manually stopped.

## Testing Restart Policies

### Step 1: Check Initial Container Status

```bash
docker compose -f docker-compose.staging.yml ps
```

**Expected output:** All containers should be in "Up" status.

### Step 2: Simulate a Container Crash

**Important:** Use `docker kill` (not `docker stop`) to simulate a crash. 
- `docker stop` = graceful shutdown (won't restart with `unless-stopped`)
- `docker kill` = crash simulation (will restart automatically)

Kill one container to simulate a crash:

```bash
# Kill the backend container (simulates a crash)
docker kill course-project-zada-backend-1

# Or kill postgres
docker kill course-project-zada-postgres-1
```

### Step 3: Verify Container Status During "Crash"

```bash
docker compose -f docker-compose.staging.yml ps
```

**Expected output:** The stopped container should show "Exited" status.

### Step 4: Observe Automatic Recovery

Wait a few seconds, then check again:

```bash
# Wait 5 seconds
sleep 5

# Check container status again
docker compose -f docker-compose.staging.yml ps
```

**Expected output:** The container should automatically restart and show "Up" status again.

### Step 5: Verify Service is Working

Test that the service recovered properly:

```bash
# If you stopped backend, test the health endpoint
curl http://172.16.7.59:3000/health

# If you stopped postgres, test the ready endpoint
curl http://172.16.7.59:3000/ready
```

## Restart Policy Options

- **`restart: no`** - Never restart (default)
- **`restart: always`** - Always restart, even if manually stopped
- **`restart: on-failure`** - Only restart on failure (non-zero exit code)
- **`restart: unless-stopped`** - Restart unless manually stopped (recommended for production)

## Screenshots to Capture

1. **Before crash:** `docker ps` showing all containers running
2. **During crash:** `docker ps` showing the stopped container
3. **After recovery:** `docker ps` showing the container automatically restarted
4. **docker-compose.yml:** Screenshot showing the restart policies

