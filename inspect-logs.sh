#!/bin/bash
# Comprehensive log inspection script

CONTAINER_NAME="course-project-zada-backend-1"
COMPOSE_FILE="docker-compose.staging.yml"
SERVICE="backend"

echo "=== Docker Logs Inspection Tool ==="
echo ""

# Function to show section header
show_section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 1. Current container status
show_section "1. Container Status"
docker compose -f $COMPOSE_FILE ps $SERVICE

# 2. Recent logs with timestamps
show_section "2. Recent Logs (Last 20 lines with timestamps)"
docker compose -f $COMPOSE_FILE logs --tail 20 --timestamps $SERVICE

# 3. Error messages
show_section "3. Error Messages (Last 100 lines)"
docker compose -f $COMPOSE_FILE logs --tail 100 --timestamps $SERVICE 2>&1 | \
    grep -i -E "error|fatal|exception|failed|crash" | \
    tail -10 || echo "No errors found in recent logs"

# 4. Recovery/Startup messages
show_section "4. Recovery/Startup Messages (Last 100 lines)"
docker compose -f $COMPOSE_FILE logs --tail 100 --timestamps $SERVICE 2>&1 | \
    grep -i -E "listening|started|ready|initialized|database.*success|listening on" | \
    tail -10 || echo "No recovery messages found"

# 5. Database connection messages
show_section "5. Database Connection Messages"
docker compose -f $COMPOSE_FILE logs --tail 100 --timestamps $SERVICE 2>&1 | \
    grep -i -E "database|postgres|connection|connect" | \
    tail -10 || echo "No database messages found"

# 6. Logs from last 5 minutes
show_section "6. Logs from Last 5 Minutes (Full Timeline)"
docker compose -f $COMPOSE_FILE logs --since 5m --timestamps $SERVICE | tail -30

# 7. Summary statistics
show_section "7. Log Statistics"
TOTAL_LINES=$(docker compose -f $COMPOSE_FILE logs --tail 1000 $SERVICE 2>&1 | wc -l)
ERROR_COUNT=$(docker compose -f $COMPOSE_FILE logs --tail 1000 $SERVICE 2>&1 | grep -ic "error\|fatal\|exception")
RECOVERY_COUNT=$(docker compose -f $COMPOSE_FILE logs --tail 1000 $SERVICE 2>&1 | grep -ic "listening\|started\|ready")

echo "Total log lines (last 1000): $TOTAL_LINES"
echo "Error messages found: $ERROR_COUNT"
echo "Recovery messages found: $RECOVERY_COUNT"
echo ""

# 8. Instructions for real-time monitoring
show_section "8. Real-time Log Monitoring Commands"
echo "To follow logs in real-time, use:"
echo "  docker compose -f $COMPOSE_FILE logs --follow --timestamps $SERVICE"
echo ""
echo "To filter for specific patterns:"
echo "  docker compose -f $COMPOSE_FILE logs --follow --timestamps $SERVICE | grep -i 'error'"
echo ""

echo "=== Inspection Complete ==="

