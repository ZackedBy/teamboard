# Security Scanning Quick Start Guide

## Prerequisites Installation

### 1. Install Semgrep (SAST)

**macOS:**
```bash
brew install semgrep
```

**Linux:**
```bash
pipx install semgrep
# or
pip install --user semgrep
```

**Verify:**
```bash
semgrep --version
```

### 2. Install Trivy (Docker Image Scanning)

**macOS:**
```bash
brew install trivy
```

**Linux:**
```bash
# Download from releases
wget https://github.com/aquasecurity/trivy/releases/latest/download/trivy_*_Linux-64bit.tar.gz
tar -xzf trivy_*_Linux-64bit.tar.gz
sudo mv trivy /usr/local/bin/
```

**Verify:**
```bash
trivy --version
```

## Running Scans

### Option 1: Automated Script (Recommended)

```bash
./security/run-security-scans.sh
```

### Option 2: Manual Scans

#### Semgrep (SAST)
```bash
semgrep scan \
  --config p/owasp-top-ten \
  --config p/javascript \
  --config p/react \
  --config p/nodejsscan \
  --config p/secrets \
  --error \
  --text -o security/sast-semgrep.txt
```

#### Trivy (Docker Images)
```bash
# Build images first
docker compose build backend

# Get image name
BACKEND_IMAGE=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep backend | head -1)

# Scan backend
trivy image --format table --output security/trivy-backend.txt "${BACKEND_IMAGE}"

# Scan postgres
trivy image --format table --output security/trivy-postgres.txt postgres:14-alpine
```

#### npm audit
```bash
# Backend
cd backend && npm audit --audit-level=moderate > ../security/npm-audit-backend.txt

# Frontend
cd frontend && npm audit --audit-level=moderate > ../security/npm-audit-frontend.txt
```

## Viewing Results

```bash
# Semgrep results
cat security/sast-semgrep.txt

# Trivy results
cat security/trivy-backend.txt
cat security/trivy-postgres.txt

# npm audit results
cat security/npm-audit-backend.txt
cat security/npm-audit-frontend.txt
```

