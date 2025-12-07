# Security Report Evidence Files

This document lists all evidence files referenced in the security report.

---

## Report Location

- **Main Report**: `security/SECURITY_REPORT.md`
- **PDF Version**: `security/SECURITY_REPORT_name.pdf` (to be generated)

---

## Evidence Files

### 1. Semgrep (SAST) Reports

**Text Report:**
- `security/sast-semgrep.txt` - Complete Semgrep findings (10 code findings)

**Note**: Semgrep JSON output was not generated. The text report contains all findings.

---

### 2. Trivy (Container Scanning) Reports

#### Backend Image
- **JSON**: `security/reports/trivy-backend.json` (268 KB)
- **Text**: `security/reports/trivy-backend.txt`

#### Frontend Image
- **JSON**: `security/reports/trivy-frontend.json` (139 KB)
- **Text**: `security/reports/trivy-frontend.txt`

#### Postgres Base Image
- **JSON**: `security/reports/trivy-postgres.json` (130 KB)
- **Text**: `security/reports/trivy-postgres.txt`

---

### 3. npm audit (Dependency Scanning) Reports

#### Backend
- **JSON**: `security/reports/npm-audit-backend.json` (365 bytes)
  - 0 vulnerabilities found
  - 233 dependencies scanned

#### Frontend
- **JSON**: `security/reports/npm-audit-frontend.json` (365 bytes)
  - 0 vulnerabilities found
  - 351 dependencies scanned

---

## Commands Used to Generate Reports

### Semgrep
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

### Trivy
```bash
# Build images
docker build -t course-project-zada-backend:local ./backend
docker build -t course-project-zada-frontend:local ./frontend

# Scan backend
trivy image \
  -f json \
  --scanners vuln,secret,config \
  --output security/reports/trivy-backend.json \
  course-project-zada-backend:local

trivy image \
  -f table \
  --scanners vuln,secret,config \
  --output security/reports/trivy-backend.txt \
  course-project-zada-backend:local

# Scan frontend
trivy image \
  -f json \
  --scanners vuln,secret,config \
  --output security/reports/trivy-frontend.json \
  course-project-zada-frontend:local

trivy image \
  -f table \
  --scanners vuln,secret,config \
  --output security/reports/trivy-frontend.txt \
  course-project-zada-frontend:local

# Scan postgres
trivy image \
  -f json \
  --scanners vuln,secret,config \
  --output security/reports/trivy-postgres.json \
  postgres:14-alpine

trivy image \
  -f table \
  --scanners vuln,secret,config \
  --output security/reports/trivy-postgres.txt \
  postgres:14-alpine
```

### npm audit
```bash
# Frontend
cd frontend
npm ci
npm audit --json > ../security/reports/npm-audit-frontend.json

# Backend
cd ../backend
npm ci
npm audit --json > ../security/reports/npm-audit-backend.json
```

---

## File Verification

To verify all evidence files exist:

```bash
# Check all JSON reports
ls -lh security/reports/*.json

# Check text reports
ls -lh security/reports/*.txt security/sast-semgrep.txt

# Expected output:
# - security/reports/npm-audit-backend.json
# - security/reports/npm-audit-frontend.json
# - security/reports/trivy-backend.json
# - security/reports/trivy-backend.txt
# - security/reports/trivy-frontend.json
# - security/reports/trivy-frontend.txt
# - security/reports/trivy-postgres.json
# - security/reports/trivy-postgres.txt
# - security/sast-semgrep.txt
```

---

## Converting Report to PDF

### Option 1: Using Pandoc (Recommended)
```bash
# Install pandoc (if not installed)
# macOS: brew install pandoc
# Linux: sudo apt-get install pandoc

# Convert to PDF
pandoc security/SECURITY_REPORT.md -o security/SECURITY_REPORT_name.pdf \
  --pdf-engine=xelatex \
  -V geometry:margin=1in \
  -V fontsize=11pt
```

### Option 2: Using Markdown to PDF (Node.js)
```bash
# Install markdown-pdf
npm install -g markdown-pdf

# Convert to PDF
markdown-pdf security/SECURITY_REPORT.md -o security/SECURITY_REPORT_name.pdf
```

### Option 3: Using Online Tools
1. Open `security/SECURITY_REPORT.md` in a markdown viewer
2. Use browser "Print to PDF" function
3. Save as `SECURITY_REPORT_name.pdf`

### Option 4: Using VS Code
1. Install "Markdown PDF" extension in VS Code
2. Open `security/SECURITY_REPORT.md`
3. Right-click → "Markdown PDF: Export (pdf)"

---

## Screenshots Required

The report mentions screenshots of terminal runs. You should capture:

1. **Semgrep Scan**:
   ```bash
   semgrep scan --config p/owasp-top-ten --config p/javascript --config p/react --config p/nodejsscan --config p/secrets --error --text -o security/sast-semgrep.txt
   ```

2. **Trivy Scan** (one example):
   ```bash
   trivy image -f table --scanners vuln,secret,config course-project-zada-backend:local
   ```

3. **npm audit** (one example):
   ```bash
   cd backend && npm audit --json
   ```

---

## Report Summary Statistics

- **Semgrep Findings**: 10 (3 security issues, 7 informational)
- **Trivy Backend**: 0 CRITICAL, 0 HIGH
- **Trivy Frontend**: 0 CRITICAL, 2 HIGH
- **Trivy Postgres**: 0 CRITICAL, 0 HIGH
- **npm audit Backend**: 0 vulnerabilities
- **npm audit Frontend**: 0 vulnerabilities

---

## Next Steps

1. ✅ Review all evidence files
2. ✅ Convert `SECURITY_REPORT.md` to PDF
3. ✅ Capture screenshots of terminal runs
4. ✅ Include PDF and screenshots in submission

