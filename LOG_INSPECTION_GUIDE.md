# Docker Logs Inspection Guide

## Basic Log Commands

### View logs for a specific container
```bash
# Basic logs
docker logs <container-name>

# With timestamps (recommended for debugging)
docker logs <container-name> --timestamps

# Follow logs in real-time (like tail -f)
docker logs <container-name> --follow --timestamps

# Last N lines
docker logs <container-name> --tail 50 --timestamps

# Logs since a specific time
docker logs <container-name> --since 10m --timestamps
```

### View logs using Docker Compose
```bash
# All services
docker compose -f docker-compose.staging.yml logs

# Specific service
docker compose -f docker-compose.staging.yml logs backend

# With timestamps
docker compose -f docker-compose.staging.yml logs --timestamps backend

# Follow logs
docker compose -f docker-compose.staging.yml logs --follow --timestamps backend

# Last 100 lines with timestamps
docker compose -f docker-compose.staging.yml logs --tail 100 --timestamps backend
```

## Identifying Failures and Recovery

### Step 1: Simulate a Crash and Monitor Logs

```bash
# Terminal 1: Follow logs in real-time
docker compose -f docker-compose.staging.yml logs --follow --timestamps backend

# Terminal 2: Simulate crash
docker exec course-project-zada-backend-1 sh -c "kill 1"
```

### Step 2: Look for Error Patterns

**Common error indicators:**
- `FATAL` - Critical errors
- `ERROR` - Error messages
- `Exception` - Exceptions/stack traces
- `ECONNREFUSED` - Connection failures
- `EADDRINUSE` - Port conflicts
- Exit codes (non-zero = failure)

### Step 3: Identify Recovery Messages

**Recovery indicators:**
- `Listening: http://localhost:3000` - Service started
- `Database initialized successfully` - Database connected
- `Up X seconds` - Container restarted
- Timestamp showing service came back online

## Example: Complete Log Analysis Workflow

```bash
# 1. Check current logs
docker compose -f docker-compose.staging.yml logs --tail 50 --timestamps backend

# 2. Simulate a crash
docker exec course-project-zada-backend-1 sh -c "kill 1"

# 3. Wait a moment
sleep 5

# 4. Check logs for error and recovery
docker compose -f docker-compose.staging.yml logs --tail 100 --timestamps backend | grep -E "error|Error|ERROR|FATAL|Listening|started|restart"

# 5. View full logs with timestamps
docker compose -f docker-compose.staging.yml logs --since 5m --timestamps backend
```

## Log Analysis Commands

### Find errors in logs
```bash
docker logs course-project-zada-backend-1 --timestamps 2>&1 | grep -i "error\|fatal\|exception"
```

### Find restart/recovery messages
```bash
docker logs course-project-zada-backend-1 --timestamps 2>&1 | grep -i "listening\|started\|ready\|initialized"
```

### View logs around a specific time
```bash
# Last 10 minutes
docker logs course-project-zada-backend-1 --since 10m --timestamps

# Between two times (requires docker logs with --since and --until)
docker logs course-project-zada-backend-1 --since "2024-12-07T15:00:00" --until "2024-12-07T15:30:00" --timestamps
```

### Count errors
```bash
docker logs course-project-zada-backend-1 --timestamps 2>&1 | grep -ic "error"
```

## Screenshots to Capture

1. **Error Message Screenshot:**
   - Run: `docker compose -f docker-compose.staging.yml logs --tail 50 --timestamps backend | grep -A 5 -B 5 -i "error\|fatal"`
   - Capture the error with timestamp

2. **Recovery Message Screenshot:**
   - Run: `docker compose -f docker-compose.staging.yml logs --tail 50 --timestamps backend | grep -A 5 -B 5 -i "listening\|started\|ready"`
   - Capture the recovery message with timestamp

3. **Full Timeline:**
   - Run: `docker compose -f docker-compose.staging.yml logs --since 5m --timestamps backend`
   - Shows the complete sequence: normal operation → error → recovery

## Practical Exercise

```bash
#!/bin/bash
# Complete log inspection exercise

echo "=== Step 1: Current Logs ==="
docker compose -f docker-compose.staging.yml logs --tail 20 --timestamps backend
echo ""

echo "=== Step 2: Simulating Crash ==="
docker exec course-project-zada-backend-1 sh -c "kill 1" 2>/dev/null
echo "Crash simulated. Waiting for recovery..."
sleep 10
echo ""

echo "=== Step 3: Error Messages ==="
docker compose -f docker-compose.staging.yml logs --tail 50 --timestamps backend | grep -i "error\|fatal\|exception" || echo "No errors found in recent logs"
echo ""

echo "=== Step 4: Recovery Messages ==="
docker compose -f docker-compose.staging.yml logs --tail 50 --timestamps backend | grep -i "listening\|started\|ready\|initialized" || echo "No recovery messages found"
echo ""

echo "=== Step 5: Full Timeline (Last 2 minutes) ==="
docker compose -f docker-compose.staging.yml logs --since 2m --timestamps backend
```

