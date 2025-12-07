#!/bin/bash
set -e

echo "=== Trivy Docker Image Scanning ==="
echo ""

# Check if Trivy is installed
if ! command -v trivy &> /dev/null
then
    echo "❌ Trivy not found. Please install it:"
    echo "   macOS: brew install trivy"
    echo "   Linux: See https://aquasecurity.github.io/trivy/latest/getting-started/installation/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null
then
    echo "❌ Docker daemon is not running. Please start Docker and try again."
    exit 1
fi

# Create reports directory
mkdir -p security/reports

# Image names
BACKEND_IMAGE="${BACKEND_IMAGE:-course-project-zada-backend:local}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-course-project-zada-frontend:local}"

# Build images if they don't exist or if --build flag is provided
if [ "$1" == "--build" ] || ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${BACKEND_IMAGE}$"; then
    echo "--- Building Backend Image ---"
    docker build -t "${BACKEND_IMAGE}" ./backend
    echo "✅ Backend image built: ${BACKEND_IMAGE}"
    echo ""
fi

if [ "$1" == "--build" ] || ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${FRONTEND_IMAGE}$"; then
    echo "--- Building Frontend Image ---"
    docker build -t "${FRONTEND_IMAGE}" ./frontend
    echo "✅ Frontend image built: ${FRONTEND_IMAGE}"
    echo ""
fi

# Scan backend image
echo "--- Scanning Backend Image: ${BACKEND_IMAGE} ---"
trivy image \
  -f table \
  --scanners vuln,secret,config \
  --exit-code 0 \
  --output security/reports/trivy-backend.txt \
  "${BACKEND_IMAGE}"

# Also generate JSON report
trivy image \
  -f json \
  --scanners vuln,secret,config \
  --exit-code 0 \
  --output security/reports/trivy-backend.json \
  "${BACKEND_IMAGE}"

echo "✅ Backend scan complete. Reports saved to:"
echo "   - security/reports/trivy-backend.txt"
echo "   - security/reports/trivy-backend.json"
echo ""

# Scan frontend image
echo "--- Scanning Frontend Image: ${FRONTEND_IMAGE} ---"
trivy image \
  -f table \
  --scanners vuln,secret,config \
  --exit-code 0 \
  --output security/reports/trivy-frontend.txt \
  "${FRONTEND_IMAGE}"

# Also generate JSON report
trivy image \
  -f json \
  --scanners vuln,secret,config \
  --exit-code 0 \
  --output security/reports/trivy-frontend.json \
  "${FRONTEND_IMAGE}"

echo "✅ Frontend scan complete. Reports saved to:"
echo "   - security/reports/trivy-frontend.txt"
echo "   - security/reports/trivy-frontend.json"
echo ""

# Scan postgres image (if used)
echo "--- Scanning Postgres Base Image: postgres:14-alpine ---"
trivy image \
  -f table \
  --scanners vuln,secret,config \
  --exit-code 0 \
  --output security/reports/trivy-postgres.txt \
  postgres:14-alpine

trivy image \
  -f json \
  --scanners vuln,secret,config \
  --exit-code 0 \
  --output security/reports/trivy-postgres.json \
  postgres:14-alpine

echo "✅ Postgres scan complete. Reports saved to:"
echo "   - security/reports/trivy-postgres.txt"
echo "   - security/reports/trivy-postgres.json"
echo ""

echo "=== Trivy Scanning Complete ==="
echo "Review reports in the 'security/reports/' directory."
echo ""
echo "To view results:"
echo "  cat security/reports/trivy-backend.txt"
echo "  cat security/reports/trivy-frontend.txt"
echo "  cat security/reports/trivy-postgres.txt"

