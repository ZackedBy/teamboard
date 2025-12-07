#!/bin/bash
# Comprehensive Security Scanning Script
# Runs SAST (Semgrep), Docker image scanning (Trivy), and npm audit

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECURITY_DIR="${REPO_ROOT}/security"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "=== Security Scanning Suite ==="
echo "Timestamp: $(date)"
echo "Repository: ${REPO_ROOT}"
echo "Reports directory: ${SECURITY_DIR}"
echo ""

mkdir -p "${SECURITY_DIR}"

# Part 1: Static Code Analysis (SAST) with Semgrep
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Part 1: Static Code Analysis (SAST) - Semgrep"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v semgrep &> /dev/null; then
    echo "Running Semgrep scan..."
    semgrep scan \
      --config p/owasp-top-ten \
      --config p/javascript \
      --config p/react \
      --config p/nodejsscan \
      --config p/secrets \
      --error \
      --text -o "${SECURITY_DIR}/sast-semgrep-${TIMESTAMP}.txt" \
      "${REPO_ROOT}" 2>&1 || true
    
    echo "Semgrep scan complete. Report: ${SECURITY_DIR}/sast-semgrep-${TIMESTAMP}.txt"
    echo ""
    
    # Count findings
    if [ -f "${SECURITY_DIR}/sast-semgrep-${TIMESTAMP}.txt" ]; then
        FINDINGS=$(grep -c "finding\|error\|warning" "${SECURITY_DIR}/sast-semgrep-${TIMESTAMP}.txt" 2>/dev/null || echo "0")
        echo "Findings detected: ${FINDINGS}"
    fi
else
    echo "⚠️  Semgrep not installed. Skipping SAST scan."
    echo "Install with: brew install semgrep (macOS) or pipx install semgrep (Linux)"
    echo ""
fi

# Part 2: Docker Image Scanning with Trivy
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Part 2: Docker Image Scanning - Trivy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v trivy &> /dev/null; then
    # Check if Docker is running
    if ! docker info &> /dev/null; then
        echo "⚠️  Docker daemon is not running. Skipping Docker image scans."
        echo "   Start Docker and run: ./security/trivy-scan.sh"
        echo ""
    else
        # Image names
        BACKEND_IMAGE="${BACKEND_IMAGE:-course-project-zada-backend:local}"
        FRONTEND_IMAGE="${FRONTEND_IMAGE:-course-project-zada-frontend:local}"
        
        # Build images if they don't exist
        if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${BACKEND_IMAGE}$"; then
            echo "Building backend image: ${BACKEND_IMAGE}"
            docker build -t "${BACKEND_IMAGE}" "${REPO_ROOT}/backend" 2>&1 || echo "⚠️  Failed to build backend image"
        fi
        
        if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${FRONTEND_IMAGE}$"; then
            echo "Building frontend image: ${FRONTEND_IMAGE}"
            docker build -t "${FRONTEND_IMAGE}" "${REPO_ROOT}/frontend" 2>&1 || echo "⚠️  Failed to build frontend image"
        fi
        
        # Scan backend image
        if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${BACKEND_IMAGE}$"; then
            echo "Scanning backend image: ${BACKEND_IMAGE}"
            trivy image \
              -f table \
              --scanners vuln,secret,config \
              --exit-code 0 \
              --output "${SECURITY_DIR}/trivy-backend-${TIMESTAMP}.txt" \
              "${BACKEND_IMAGE}" 2>&1 || true
            
            trivy image \
              -f json \
              --scanners vuln,secret,config \
              --exit-code 0 \
              --output "${SECURITY_DIR}/trivy-backend-${TIMESTAMP}.json" \
              "${BACKEND_IMAGE}" 2>&1 || true
            
            echo "✅ Backend scan complete. Reports:"
            echo "   - ${SECURITY_DIR}/trivy-backend-${TIMESTAMP}.txt"
            echo "   - ${SECURITY_DIR}/trivy-backend-${TIMESTAMP}.json"
        else
            echo "⚠️  Backend image not found. Build it first."
        fi
        echo ""
        
        # Scan frontend image
        if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${FRONTEND_IMAGE}$"; then
            echo "Scanning frontend image: ${FRONTEND_IMAGE}"
            trivy image \
              -f table \
              --scanners vuln,secret,config \
              --exit-code 0 \
              --output "${SECURITY_DIR}/trivy-frontend-${TIMESTAMP}.txt" \
              "${FRONTEND_IMAGE}" 2>&1 || true
            
            trivy image \
              -f json \
              --scanners vuln,secret,config \
              --exit-code 0 \
              --output "${SECURITY_DIR}/trivy-frontend-${TIMESTAMP}.json" \
              "${FRONTEND_IMAGE}" 2>&1 || true
            
            echo "✅ Frontend scan complete. Reports:"
            echo "   - ${SECURITY_DIR}/trivy-frontend-${TIMESTAMP}.txt"
            echo "   - ${SECURITY_DIR}/trivy-frontend-${TIMESTAMP}.json"
        else
            echo "⚠️  Frontend image not found. Build it first."
        fi
        echo ""
        
        # Scan postgres base image
        echo "Scanning postgres base image: postgres:14-alpine"
        trivy image \
          -f table \
          --scanners vuln,secret,config \
          --exit-code 0 \
          --output "${SECURITY_DIR}/trivy-postgres-${TIMESTAMP}.txt" \
          postgres:14-alpine 2>&1 || true
        
        trivy image \
          -f json \
          --scanners vuln,secret,config \
          --exit-code 0 \
          --output "${SECURITY_DIR}/trivy-postgres-${TIMESTAMP}.json" \
          postgres:14-alpine 2>&1 || true
        
        echo "✅ Postgres scan complete. Reports:"
        echo "   - ${SECURITY_DIR}/trivy-postgres-${TIMESTAMP}.txt"
        echo "   - ${SECURITY_DIR}/trivy-postgres-${TIMESTAMP}.json"
        echo ""
    fi
else
    echo "⚠️  Trivy not installed. Skipping Docker image scans."
    echo "Install with: brew install trivy (macOS) or download from https://github.com/aquasecurity/trivy/releases"
    echo ""
fi

# Part 3: npm audit for Backend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Part 3: npm audit - Backend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "${REPO_ROOT}/backend" ] && [ -f "${REPO_ROOT}/backend/package.json" ]; then
    echo "Running npm audit for backend..."
    cd "${REPO_ROOT}/backend"
    npm audit --audit-level=moderate > "${SECURITY_DIR}/npm-audit-backend-${TIMESTAMP}.txt" 2>&1 || true
    echo "Backend audit complete. Report: ${SECURITY_DIR}/npm-audit-backend-${TIMESTAMP}.txt"
    echo ""
    
    # Generate JSON report
    npm audit --json > "${SECURITY_DIR}/npm-audit-backend-${TIMESTAMP}.json" 2>&1 || true
else
    echo "⚠️  Backend directory or package.json not found."
    echo ""
fi

# Part 4: npm audit for Frontend
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Part 4: npm audit - Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "${REPO_ROOT}/frontend" ] && [ -f "${REPO_ROOT}/frontend/package.json" ]; then
    echo "Running npm audit for frontend..."
    cd "${REPO_ROOT}/frontend"
    npm audit --audit-level=moderate > "${SECURITY_DIR}/npm-audit-frontend-${TIMESTAMP}.txt" 2>&1 || true
    echo "Frontend audit complete. Report: ${SECURITY_DIR}/npm-audit-frontend-${TIMESTAMP}.txt"
    echo ""
    
    # Generate JSON report
    npm audit --json > "${SECURITY_DIR}/npm-audit-frontend-${TIMESTAMP}.json" 2>&1 || true
else
    echo "⚠️  Frontend directory or package.json not found."
    echo ""
fi

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Scan Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "All reports saved to: ${SECURITY_DIR}/"
echo ""
echo "Generated reports:"
ls -lh "${SECURITY_DIR}"/*.txt "${SECURITY_DIR}"/*.json 2>/dev/null | awk '{print "  - " $9 " (" $5 ")"}' || echo "  No reports generated"
echo ""
echo "=== Security Scanning Complete ==="

