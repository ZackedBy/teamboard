# Security Scanning Documentation

This directory contains security scanning reports and tools for the TeamBoard project.

## Tools Required

### 1. Semgrep (SAST)
Installation:
- **macOS**: `brew install semgrep`
- **Linux**: `pipx install semgrep` or `pip install --user semgrep`
- **Windows**: `pipx install semgrep`

Verify: `semgrep --version`

### 2. Trivy (Docker Image Scanning)
Installation:
- **macOS**: `brew install trivy`
- **Linux**: Download from https://github.com/aquasecurity/trivy/releases
- **Windows**: Download from https://github.com/aquasecurity/trivy/releases

Verify: `trivy --version`

### 3. npm (for npm audit)
Should be installed with Node.js. Verify: `npm --version`

## Running Security Scans

### Quick Start (All Scans)

Run the comprehensive security scanning script:

```bash
./security/run-security-scans.sh
```

This will run all scans and save reports to the `security/` directory.

### Individual Scans

#### 1. Static Code Analysis (Semgrep)

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

View results:
```bash
cat security/sast-semgrep.txt
```

#### 2. Docker Image Scanning (Trivy)

**Quick Start (Recommended):**
```bash
# Use the automated script
./security/trivy-scan.sh --build
```

**Manual Scanning:**
```bash
# Build images first
docker build -t course-project-zada-backend:local ./backend
docker build -t course-project-zada-frontend:local ./frontend

# Scan with all scanners (vulnerabilities, secrets, config)
trivy image -f table --scanners vuln,secret,config course-project-zada-backend:local
trivy image -f table --scanners vuln,secret,config course-project-zada-frontend:local

# Generate reports
mkdir -p security/reports
trivy image -f table --scanners vuln,secret,config --output security/reports/trivy-backend.txt course-project-zada-backend:local
trivy image -f json --scanners vuln,secret,config --output security/reports/trivy-backend.json course-project-zada-backend:local
```

**Postgres Base Image:**
```bash
trivy image -f table --scanners vuln,secret,config --output security/reports/trivy-postgres.txt postgres:14-alpine
```

**See `TRIVY_GUIDE.md` for detailed documentation.**

#### 3. npm audit

**Backend:**
```bash
cd backend
npm audit --audit-level=moderate > ../security/npm-audit-backend.txt
npm audit --json > ../security/npm-audit-backend.json
```

**Frontend:**
```bash
cd frontend
npm audit --audit-level=moderate > ../security/npm-audit-frontend.txt
npm audit --json > ../security/npm-audit-frontend.json
```

## Report Files

All reports are saved in the `security/` directory with timestamps:

- `sast-semgrep-YYYYMMDD_HHMMSS.txt` - Semgrep SAST findings
- `trivy-backend-YYYYMMDD_HHMMSS.txt` - Backend Docker image vulnerabilities
- `trivy-postgres-YYYYMMDD_HHMMSS.txt` - Postgres Docker image vulnerabilities
- `npm-audit-backend-YYYYMMDD_HHMMSS.txt` - Backend npm vulnerabilities (text)
- `npm-audit-backend-YYYYMMDD_HHMMSS.json` - Backend npm vulnerabilities (JSON)
- `npm-audit-frontend-YYYYMMDD_HHMMSS.txt` - Frontend npm vulnerabilities (text)
- `npm-audit-frontend-YYYYMMDD_HHMMSS.json` - Frontend npm vulnerabilities (JSON)

## Interpreting Results

### Semgrep Findings
- **High/Critical**: Security vulnerabilities that should be fixed immediately
- **Medium**: Security issues that should be addressed
- **Low/Info**: Best practices and code quality suggestions

### Trivy Findings
- **CRITICAL**: Fix immediately
- **HIGH**: Fix as soon as possible
- **MEDIUM**: Fix when convenient
- **LOW**: Consider fixing

### npm audit Findings
- **Critical**: Fix immediately
- **High**: Fix as soon as possible
- **Moderate**: Fix when convenient
- **Low**: Consider fixing

## Fixing Issues

### Common Fixes

1. **Update dependencies**: `npm update` or `npm audit fix`
2. **Fix Semgrep findings**: Review and fix code issues manually
3. **Update Docker base images**: Update to latest versions in Dockerfiles
4. **Apply security patches**: Follow recommendations from scan reports

### Triage Process

1. Review all findings
2. Prioritize by severity (Critical > High > Medium > Low)
3. Fix or document why issues are acceptable
4. Update this document with triage decisions

## Continuous Security

### Recommended Practices

- Run scans before each release
- Integrate scans into CI/CD pipeline
- Review and fix findings regularly
- Keep dependencies up to date
- Monitor security advisories

