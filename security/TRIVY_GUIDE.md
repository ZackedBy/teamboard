# Trivy Docker Image Scanning Guide

**Trivy** is a comprehensive security scanner for container images that detects:
- **Vulnerabilities** (CVEs) in installed packages
- **Secrets** (API keys, passwords, tokens) in images
- **Misconfigurations** (security best practices)

---

## Installation

### macOS
```bash
brew install trivy
```

### Linux (Debian/Ubuntu)
```bash
sudo apt-get install wget gnupg
wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor | sudo tee /usr/share/keyrings/trivy.gpg > /dev/null
echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
sudo apt-get update
sudo apt-get install trivy
```

### Verify Installation
```bash
trivy --version
```

---

## Quick Start

### Option 1: Use the Automated Script
```bash
./security/trivy-scan.sh
```

This script will:
1. Check if Docker is running
2. Build images if they don't exist (or use `--build` flag)
3. Scan backend, frontend, and postgres images
4. Generate reports in `security/reports/`

### Option 2: Manual Scanning

#### Step 1: Build Images
```bash
# Build backend image
docker build -t course-project-zada-backend:local ./backend

# Build frontend image
docker build -t course-project-zada-frontend:local ./frontend
```

#### Step 2: Scan Images
```bash
# Scan backend image
trivy image -f table --scanners vuln,secret,config course-project-zada-backend:local

# Scan frontend image
trivy image -f table --scanners vuln,secret,config course-project-zada-frontend:local

# Scan postgres base image
trivy image -f table --scanners vuln,secret,config postgres:14-alpine
```

#### Step 3: Generate Reports
```bash
# Create reports directory
mkdir -p security/reports

# Scan with output to file
trivy image \
  -f table \
  --scanners vuln,secret,config \
  --output security/reports/trivy-backend.txt \
  course-project-zada-backend:local

# Also generate JSON report
trivy image \
  -f json \
  --scanners vuln,secret,config \
  --output security/reports/trivy-backend.json \
  course-project-zada-backend:local
```

---

## Scanner Types

Trivy uses three types of scanners:

1. **`vuln`** - Vulnerability scanner
   - Detects known CVEs in installed packages
   - Checks against vulnerability databases

2. **`secret`** - Secret scanner
   - Detects hardcoded secrets (API keys, passwords, tokens)
   - Scans file contents for sensitive data

3. **`config`** - Configuration scanner
   - Detects security misconfigurations
   - Checks Dockerfile best practices

---

## Understanding Results

### Vulnerability Severity Levels
- **CRITICAL** - Immediate action required
- **HIGH** - Fix as soon as possible
- **MEDIUM** - Fix in next release cycle
- **LOW** - Consider fixing when convenient

### Example Output
```
Total: 15 (CRITICAL: 2, HIGH: 5, MEDIUM: 6, LOW: 2)

┌─────────────────┬────────────────┬──────────┬─────────────────────┐
│    Library      │ Vulnerability  │ Severity │   Installed Version  │
├─────────────────┼────────────────┼──────────┼─────────────────────┤
│ node            │ CVE-2024-12345 │ CRITICAL │ 22.0.0               │
│ express         │ CVE-2024-67890 │ HIGH     │ 5.1.0                │
└─────────────────┴────────────────┴──────────┴─────────────────────┘
```

---

## Common Issues and Fixes

### Issue: Vulnerabilities in Base Images
**Problem**: Base images (e.g., `node:22-alpine`) may contain vulnerabilities.

**Solution**:
1. Update to latest base image version
2. Use minimal base images (Alpine Linux)
3. Regularly rebuild images to get security updates

### Issue: Secrets Detected
**Problem**: Trivy found hardcoded secrets in image.

**Solution**:
1. Remove secrets from Dockerfile and source code
2. Use environment variables or secret management
3. Add `.dockerignore` to exclude sensitive files

### Issue: Configuration Warnings
**Problem**: Security misconfigurations detected.

**Solution**:
1. Run as non-root user
2. Use specific image tags (not `latest`)
3. Minimize image layers
4. Use multi-stage builds

---

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'course-project-zada-backend:latest'
    format: 'sarif'
    output: 'trivy-results.sarif'
    scanners: 'vuln,secret,config'
```

### GitLab CI Example
```yaml
trivy:
  image: aquasec/trivy:latest
  script:
    - trivy image --exit-code 0 --format table course-project-zada-backend:latest
```

---

## Best Practices

1. **Scan Before Deployment**
   - Always scan images before pushing to registry
   - Fail builds on critical vulnerabilities

2. **Regular Scanning**
   - Scan images weekly or monthly
   - Monitor for new vulnerabilities

3. **Fix High Priority Issues**
   - Address CRITICAL and HIGH vulnerabilities immediately
   - Keep dependencies updated

4. **Use Minimal Base Images**
   - Prefer Alpine Linux images
   - Remove unnecessary packages

5. **Multi-Stage Builds**
   - Reduce final image size
   - Exclude build dependencies

---

## Resources

- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [Trivy GitHub](https://github.com/aquasecurity/trivy)
- [Container Security Best Practices](https://owasp.org/www-project-docker-top-10/)

---

## Troubleshooting

### Docker Daemon Not Running
```bash
# Check Docker status
docker info

# Start Docker (macOS)
open -a Docker

# Start Docker (Linux)
sudo systemctl start docker
```

### Image Not Found
```bash
# List available images
docker images

# Build missing image
docker build -t course-project-zada-backend:local ./backend
```

### Trivy Database Update
```bash
# Update vulnerability database
trivy image --download-db-only
```

