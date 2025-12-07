# Resilience Plan

This document describes how the TeamBoard application detects, mitigates, and recovers from common failures.

## 1. Failure: Database Container Crash

### Detection

How will we know the database is down?

- [x] Health check endpoint `/ready` returns 503 Service Unavailable
- [x] Database container status shows "Exited" or "Restarting" in `docker ps`
- [x] Backend logs show database connection errors
- [x] Monitoring alerts trigger when `/ready` endpoint fails
- [ ] Users report "Database connection failed" errors

### Immediate Impact

Which parts of the app are affected?

- [x] All API endpoints that require database access fail
- [x] User authentication fails (can't verify credentials)
- [x] Task and team management operations fail
- [x] Read operations fail (no cached data available)
- [ ] Health check endpoint `/health` still works (doesn't require DB)

### Mitigation

What can we do to reduce impact?

- [x] Docker restart policy (`restart: unless-stopped`) automatically restarts the container
- [x] Health check endpoint allows monitoring systems to detect the issue
- [x] Database healthcheck ensures container is ready before backend starts
- [ ] Implement connection pooling with retry logic (already in place via pg.Pool)
- [ ] Add database connection retry logic in application code (already implemented in `src/index.js`)

### Recovery

How do we restore service?

- [x] Docker automatically restarts the database container
- [x] Database schema is automatically initialized on startup
- [x] If data is lost, restore from backup using `./restore.sh <backup_file>`
- [x] Verify recovery by checking `/ready` endpoint returns 200
- [ ] Monitor logs to ensure database reconnects successfully

---

## 2. Failure: Backend API Container Crash

### Detection

How will we know the backend API is down?

- [x] Health check endpoint `/health` returns connection refused or timeout
- [x] Frontend shows "API unavailable" errors
- [x] Container status shows "Exited" or "Restarting" in `docker ps`
- [x] Monitoring alerts trigger when `/health` endpoint is unreachable
- [ ] Users report "Cannot connect to server" errors

### Immediate Impact

Which parts of the app are affected?

- [x] All API endpoints are unavailable
- [x] Frontend cannot communicate with backend
- [x] Users cannot perform any operations (login, create tasks, etc.)
- [x] Static frontend may still load but functionality is broken
- [ ] Database remains operational but inaccessible

### Mitigation

What can we do to reduce impact?

- [x] Docker restart policy (`restart: unless-stopped`) automatically restarts the container
- [x] Health check endpoint allows monitoring systems to detect the issue
- [x] Backend waits for database to be healthy before starting (depends_on with condition)
- [ ] Implement graceful shutdown handling
- [ ] Add request queuing or circuit breaker pattern

### Recovery

How do we restore service?

- [x] Docker automatically restarts the backend container
- [x] Backend automatically reconnects to database on startup
- [x] Verify recovery by checking `/health` endpoint returns 200
- [x] Verify database connectivity by checking `/ready` endpoint returns 200
- [ ] Monitor logs to ensure backend starts successfully
- [ ] Check application logs for any startup errors

---

## 3. Failure: Frontend Container Crash

### Detection

How will we know the frontend is down?

- [x] Users cannot access the web application
- [x] HTTP requests to port 80 return connection refused
- [x] Container status shows "Exited" or "Restarting" in `docker ps`
- [x] Monitoring alerts trigger when frontend is unreachable
- [ ] Browser shows "This site can't be reached" errors

### Immediate Impact

Which parts of the app are affected?

- [x] Users cannot access the web interface
- [x] All user interactions are unavailable
- [ ] API endpoints remain functional (but inaccessible via web UI)
- [ ] Database remains operational

### Mitigation

What can we do to reduce impact?

- [x] Docker restart policy (`restart: unless-stopped`) automatically restarts the container
- [x] Frontend depends on backend, so it won't start until backend is ready
- [ ] Implement static asset caching
- [ ] Add CDN for static assets

### Recovery

How do we restore service?

- [x] Docker automatically restarts the frontend container
- [x] Frontend automatically reconnects to backend on startup
- [x] Verify recovery by accessing the web application
- [ ] Check browser console for any connection errors
- [ ] Verify API connectivity from frontend

---

## 4. Failure: Database Data Loss or Corruption

### Detection

How will we know data is lost or corrupted?

- [x] Database queries return errors or unexpected results
- [x] Application logs show data integrity errors
- [x] Users report missing or incorrect data
- [ ] Database integrity checks fail
- [ ] Backup verification reveals data inconsistencies

### Immediate Impact

Which parts of the app are affected?

- [x] Data-dependent operations fail
- [x] Users may see incorrect or missing information
- [x] Application may crash if critical data is missing
- [ ] Read-only operations may still work with cached data

### Mitigation

What can we do to reduce impact?

- [x] Automated backups run every 12 hours via cron (`0 */12 * * *`)
- [x] Backups are compressed and stored in `./backups/` directory
- [x] Old backups are automatically cleaned up (keeps last 7 days)
- [ ] Implement database replication for high availability
- [ ] Add backup verification to ensure backups are valid
- [ ] Store backups in offsite location (S3, etc.)

### Recovery

How do we restore service?

- [x] Identify the most recent valid backup using `ls -lh ./backups/`
- [x] Stop the database container: `docker compose -f docker-compose.staging.yml stop postgres`
- [x] Restore from backup using `./restore.sh <backup_file>`
- [x] Verify data integrity after restore
- [x] Restart services and verify functionality
- [ ] Investigate root cause to prevent future data loss
- [ ] Update backup strategy if needed

---

## 5. Failure: Docker Host/VM Failure

### Detection

How will we know the Docker host is down?

- [x] All containers are unreachable
- [x] SSH connection to server fails
- [x] All health check endpoints fail
- [x] Monitoring alerts trigger for host unavailability
- [ ] Users report complete service outage

### Immediate Impact

Which parts of the app are affected?

- [x] Complete service outage
- [x] All containers stop running
- [x] Database, backend, and frontend all unavailable
- [x] No user access to the application

### Mitigation

What can we do to reduce impact?

- [x] Docker restart policies ensure containers restart when host reboots
- [x] Database data is persisted in Docker volumes
- [x] Regular backups stored outside the host
- [ ] Implement multi-host deployment with load balancing
- [ ] Use orchestration platform (Kubernetes, Docker Swarm)
- [ ] Implement automated failover to secondary host

### Recovery

How do we restore service?

- [x] Restart Docker daemon on host
- [x] Containers automatically restart due to restart policies
- [x] Verify all services are running: `docker compose -f docker-compose.staging.yml ps`
- [x] Check health endpoints: `/health` and `/ready`
- [x] If data volume is lost, restore from backup
- [ ] Investigate root cause of host failure
- [ ] Review and improve infrastructure resilience

---

## 6. Failure: Network Connectivity Issues

### Detection

How will we know there are network issues?

- [x] Health check endpoints timeout
- [x] Frontend cannot connect to backend API
- [x] Backend cannot connect to database
- [x] Container logs show connection refused errors
- [ ] Network monitoring tools detect packet loss

### Immediate Impact

Which parts of the app are affected?

- [x] Inter-service communication fails
- [x] Frontend cannot reach backend
- [x] Backend cannot reach database
- [x] User requests fail or timeout
- [ ] Individual services may be running but isolated

### Mitigation

What can we do to reduce impact?

- [x] Docker Compose network ensures containers can communicate
- [x] Health checks help identify connectivity issues
- [x] Connection timeouts prevent indefinite hangs
- [ ] Implement connection retry logic with exponential backoff
- [ ] Add circuit breaker pattern to prevent cascade failures
- [ ] Use service mesh for better network resilience

### Recovery

How do we restore service?

- [x] Restart affected containers
- [x] Verify Docker network connectivity: `docker network inspect`
- [x] Check container logs for connection errors
- [x] Verify service discovery (container names resolve correctly)
- [x] Test connectivity between containers
- [ ] Review network configuration if issues persist

---

## 7. Failure: Application Code Errors/Crashes

### Detection

How will we know the application has crashed?

- [x] Health check endpoint `/health` fails or returns errors
- [x] Application logs show unhandled exceptions
- [x] Container status shows "Exited" with non-zero exit code
- [x] Users report application errors
- [ ] Monitoring alerts trigger on error rates

### Immediate Impact

Which parts of the app are affected?

- [x] Specific API endpoints may fail
- [x] Application may crash completely
- [x] Users experience errors or timeouts
- [ ] Database remains operational
- [ ] Other services may be unaffected

### Mitigation

What can we do to reduce impact?

- [x] Docker restart policy automatically restarts crashed containers
- [x] Error handling middleware catches and logs errors
- [x] Health checks help identify failing services quickly
- [ ] Implement graceful error handling in application code
- [ ] Add request validation to prevent invalid requests
- [ ] Use process managers (PM2) for better crash recovery

### Recovery

How do we restore service?

- [x] Docker automatically restarts the container
- [x] Application logs help identify the root cause
- [x] Fix the code issue and redeploy
- [x] Verify recovery by testing affected endpoints
- [ ] Review error logs to prevent future occurrences
- [ ] Update error handling if needed

---

## Monitoring and Alerting

### Health Check Endpoints

- **`/health`** - Liveness check (always returns 200 if server is running)
- **`/ready`** - Readiness check (returns 200 if database is connected, 503 if not)

### Log Monitoring

- Container logs: `docker compose -f docker-compose.staging.yml logs`
- Application logs: Check backend container logs for errors
- Database logs: Check postgres container logs for connection issues

### Automated Recovery

- **Restart Policies**: All containers use `restart: unless-stopped`
- **Health Checks**: Database has healthcheck to ensure readiness
- **Dependencies**: Services wait for dependencies to be healthy before starting

### Backup Strategy

- **Frequency**: Every 12 hours (cron: `0 */12 * * *`)
- **Retention**: Last 7 days of backups
- **Location**: `./backups/` directory
- **Format**: Compressed SQL dumps (`.sql.gz`)

---

## Testing Resilience

### How to Test Each Failure Scenario

1. **Database Crash**: `docker kill course-project-zada-postgres-1`
2. **Backend Crash**: `docker kill course-project-zada-backend-1`
3. **Frontend Crash**: `docker kill course-project-zada-frontend-1`
4. **Data Loss**: Remove volume and restore from backup
5. **Host Reboot**: Simulate with `sudo reboot` (containers should auto-restart)

### Verification Steps

After each test:
1. Check container status: `docker compose -f docker-compose.staging.yml ps`
2. Check health endpoints: `curl http://localhost:3000/health` and `/ready`
3. Verify logs: `docker compose -f docker-compose.staging.yml logs`
4. Test application functionality

---

## Continuous Improvement

### Future Enhancements

- [ ] Implement database replication for high availability
- [ ] Add automated backup verification
- [ ] Store backups in cloud storage (S3, etc.)
- [ ] Implement monitoring dashboard (Prometheus, Grafana)
- [ ] Add alerting system (PagerDuty, Slack notifications)
- [ ] Implement blue-green deployments for zero-downtime updates
- [ ] Add load balancing for multiple backend instances
- [ ] Implement circuit breaker pattern for external dependencies

