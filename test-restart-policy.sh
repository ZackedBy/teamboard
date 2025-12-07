#!/bin/bash
# Test script to verify restart policy works and inspect logs

echo "=== Testing Docker Restart Policy with Log Inspection ==="
echo ""

# 1. Check initial status
echo "1. Initial container status:"
docker compose -f docker-compose.staging.yml ps backend
echo ""

# 2. Show current logs
echo "2. Current logs (last 10 lines with timestamps):"
docker compose -f docker-compose.staging.yml logs --tail 10 --timestamps backend
echo ""

# 3. Simulate a real crash by making the process exit with error
echo "3. Simulating a crash by killing the main process inside the container..."
docker exec course-project-zada-backend-1 sh -c "kill 1" 2>/dev/null || echo "Container might already be restarting..."
echo ""

# 4. Wait a moment for restart
echo "4. Waiting 10 seconds for Docker to detect and restart..."
sleep 10
echo ""

# 5. Check status after crash
echo "5. Container status after crash:"
docker compose -f docker-compose.staging.yml ps backend
echo ""

# 6. Show logs with error and recovery messages
echo "6. Logs showing error and recovery (last 30 lines with timestamps):"
docker compose -f docker-compose.staging.yml logs --tail 30 --timestamps backend
echo ""

# 7. Extract error messages
echo "7. Error messages found:"
docker compose -f docker-compose.staging.yml logs --tail 50 --timestamps backend 2>&1 | grep -i "error\|fatal\|exception" || echo "No errors found in recent logs"
echo ""

# 8. Extract recovery messages
echo "8. Recovery messages found:"
docker compose -f docker-compose.staging.yml logs --tail 50 --timestamps backend 2>&1 | grep -i "listening\|started\|ready\|initialized" || echo "No recovery messages found"
echo ""

# 9. Check if it's running
echo "9. Testing if service is accessible:"
curl -s http://172.16.7.59:3000/health | head -1 || echo "Service not yet ready"
echo ""

echo "=== Test Complete ==="
echo ""
echo "Key points to look for in logs:"
echo "  - Error messages: Look for 'ERROR', 'FATAL', 'Exception'"
echo "  - Recovery messages: Look for 'Listening', 'started', 'ready'"
echo "  - Timestamps: Show when errors occurred and when recovery happened"
echo ""
echo "The restart policy ensures containers recover automatically from crashes."

