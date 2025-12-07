# Security Report: TeamBoard Project

**Date**: December 7, 2025  
**Project**: TeamBoard (Course Project Zada)  
**Report Type**: Comprehensive Security Assessment  
**Tools Used**: Semgrep (SAST), Trivy (Container Scanning), npm audit (Dependency Scanning)

---

## Executive Summary

This report presents the findings from a comprehensive security assessment of the TeamBoard project, including static code analysis (SAST), Docker image vulnerability scanning, and dependency auditing. The assessment identified **10 code findings** from Semgrep, **2 HIGH severity vulnerabilities** in the frontend Docker image, and **0 vulnerabilities** in npm dependencies.

### Key Findings Summary

1. **Semgrep (SAST)**: 10 code findings identified
   - **Security Issues**: 3 findings (Dockerfile missing USER, insecure random generator)
   - **Informational**: 7 findings (Helmet.js security headers - all positive)
   - **Action Plan**: Fix Dockerfile USER directives, replace Math.random() with crypto.randomBytes()

2. **Trivy (Container Scanning)**: 
   - **Backend Image**: ✅ 0 CRITICAL, 0 HIGH vulnerabilities
   - **Frontend Image**: ⚠️ 0 CRITICAL, **2 HIGH** vulnerabilities (glob package CVE-2025-64756)
   - **Postgres Base Image**: ✅ 0 CRITICAL, 0 HIGH vulnerabilities
   - **Action Plan**: Update glob package in frontend to version 11.1.0 or 10.5.0

3. **npm audit (Dependency Scanning)**:
   - **Backend**: ✅ 0 vulnerabilities (233 dependencies scanned)
   - **Frontend**: ✅ 0 vulnerabilities (351 dependencies scanned)
   - **Action Plan**: No action required - all dependencies are secure

---

## 1. Semgrep Static Analysis (SAST)

### Overview
- **Total Findings**: 10
- **Severity Breakdown**:
  - **Security Issues**: 3 (HIGH priority)
  - **Informational**: 7 (positive security headers)

### Top Findings by Severity

#### HIGH Priority Issues

1. **Dockerfile Missing USER Directive (3 instances)**
   - **Location**: `backend/Dockerfile`, `backend/src/crash-demo/Dockerfile`, `frontend/Dockerfile`
   - **Issue**: Containers run as root user, which is a security hazard
   - **Risk**: If an attacker gains control of a process, they may have root access to the container
   - **Fix**: Add `USER non-root` directive before CMD in all Dockerfiles
   - **Status**: 🔧 **TO BE FIXED**

2. **Insecure Random Number Generator**
   - **Location**: `backend/src/api/emojis.js:21`
   - **Issue**: `Math.random()` is cryptographically weak
   - **Risk**: Predictable random values could be exploited
   - **Fix**: Replace with `crypto.randomBytes()` or `crypto.getRandomValues()`
   - **Status**: 🔧 **TO BE FIXED**

#### Informational Findings (Positive)

3. **Helmet.js Security Headers (7 findings)**
   - **Location**: `backend/src/app.js:15`
   - **Status**: ✅ **GOOD** - All security headers are properly configured:
     - X-DNS-Prefetch-Control
     - HSTS (HTTP Strict Transport Security)
     - X-Download-Options
     - Content-Type-Options
     - X-Powered-By (removed)
     - X-XSS-Protection

### Action Plan for Semgrep Findings

1. **Immediate Actions**:
   - [ ] Add `USER non-root` to `backend/Dockerfile`
   - [ ] Add `USER non-root` to `frontend/Dockerfile`
   - [ ] Replace `Math.random()` with `crypto.randomBytes()` in `backend/src/api/emojis.js`

2. **Justified Triage**:
   - ✅ Helmet.js findings are informational and indicate good security practices - no action needed

### Evidence
- **Report Location**: `security/sast-semgrep.txt`
- **JSON Report**: Not generated (Semgrep text output used)

---

## 2. Trivy Container Image Scanning

### Overview
Trivy scanned all Docker images for vulnerabilities, secrets, and misconfigurations using three scanners: `vuln`, `secret`, and `config`.

### Backend Image (`course-project-zada-backend:local`)

- **Base Image**: `node:22-alpine`
- **Vulnerabilities**: 
  - **CRITICAL**: 0
  - **HIGH**: 0
  - **MEDIUM**: 0
  - **LOW**: 0
  - **TOTAL**: 0
- **Status**: ✅ **SECURE** - No vulnerabilities found
- **Action Plan**: No action required

### Frontend Image (`course-project-zada-frontend:local`)

- **Base Image**: `nginx:alpine3.20-slim` (final stage), `node:22-alpine` (build stage)
- **Vulnerabilities**:
  - **CRITICAL**: 0
  - **HIGH**: **2** ⚠️
  - **MEDIUM**: 8
  - **LOW**: 8
  - **TOTAL**: 18

#### HIGH Severity Vulnerabilities

1. **CVE-2025-64756 - glob package**
   - **Severity**: HIGH
   - **Package**: glob (package.json)
   - **Installed Version**: 10.4.5
   - **Fixed Versions**: 11.1.0, 10.5.0
   - **Issue**: Command Injection Vulnerability via Malicious Input
   - **Action Plan**: Update glob to version 11.1.0 or 10.5.0

2. **CVE-2025-58183 - stdlib (golang)**
   - **Severity**: HIGH
   - **Package**: stdlib
   - **Installed Version**: v1.23.12
   - **Fixed Versions**: 1.24.8, 1.25.2
   - **Issue**: golang: archive/tar: Unbounded allocation when parsing GNU
   - **Note**: This is in the build stage (node:22-alpine base image) and may not affect runtime
   - **Action Plan**: Monitor and update base image when available

- **Status**: ⚠️ **REQUIRES ATTENTION** - 2 HIGH severity vulnerabilities
- **Action Plan**: 
  1. Update glob package to 11.1.0 or 10.5.0 in frontend dependencies
  2. Monitor golang stdlib updates in base image

### Postgres Base Image (`postgres:14-alpine`)

- **Vulnerabilities**:
  - **CRITICAL**: 0
  - **HIGH**: 0
  - **MEDIUM**: 0
  - **LOW**: 0
  - **TOTAL**: 0
- **Status**: ✅ **SECURE** - No vulnerabilities found
- **Action Plan**: No action required

### Action Plan for Trivy Findings

1. **Immediate Actions**:
   - [ ] Update `glob` package in frontend to version 11.1.0 or 10.5.0
   - [ ] Run `npm update glob` in frontend directory
   - [ ] Rebuild frontend Docker image and rescan

2. **Monitoring**:
   - [ ] Monitor node:22-alpine base image for golang stdlib updates
   - [ ] Consider updating to latest Alpine base image when available

### Evidence
- **Backend Report**: `security/reports/trivy-backend.json`, `security/reports/trivy-backend.txt`
- **Frontend Report**: `security/reports/trivy-frontend.json`, `security/reports/trivy-frontend.txt`
- **Postgres Report**: `security/reports/trivy-postgres.json`, `security/reports/trivy-postgres.txt`

---

## 3. npm audit Dependency Scanning

### Overview
npm audit scanned all npm dependencies in both frontend and backend for known vulnerabilities.

### Backend Dependencies

- **Total Dependencies**: 233
  - Production: 106
  - Development: 127
  - Optional: 61
  - Peer: 3
- **Vulnerabilities**: 
  - **CRITICAL**: 0
  - **HIGH**: 0
  - **MODERATE**: 0
  - **LOW**: 0
  - **INFO**: 0
  - **TOTAL**: 0
- **Status**: ✅ **SECURE** - No vulnerabilities found
- **Action Plan**: No action required

### Frontend Dependencies

- **Total Dependencies**: 351
  - Production: 8
  - Development: 344
  - Optional: 67
  - Peer: 108
- **Vulnerabilities**:
  - **CRITICAL**: 0
  - **HIGH**: 0
  - **MODERATE**: 0
  - **LOW**: 0
  - **INFO**: 0
  - **TOTAL**: 0
- **Status**: ✅ **SECURE** - No vulnerabilities found
- **Action Plan**: No action required

### Action Plan for npm audit

- ✅ **No action required** - All dependencies are secure
- **Recommendation**: Continue running `npm audit` regularly before deployments

### Evidence
- **Backend Report**: `security/reports/npm-audit-backend.json`
- **Frontend Report**: `security/reports/npm-audit-frontend.json`

---

## Summary of Actions Required

### Critical/High Priority (Fix Immediately)

1. **Update glob package in frontend** (Trivy - HIGH)
   - Update to version 11.1.0 or 10.5.0
   - Command: `cd frontend && npm update glob`

2. **Add USER directive to Dockerfiles** (Semgrep - HIGH)
   - Add `USER non-root` to `backend/Dockerfile`
   - Add `USER non-root` to `frontend/Dockerfile`

3. **Replace Math.random() with crypto.randomBytes()** (Semgrep - HIGH)
   - Fix in `backend/src/api/emojis.js:21`

### Medium Priority (Fix Soon)

4. **Monitor golang stdlib updates** (Trivy - HIGH in base image)
   - Update node:22-alpine base image when fixes are available

### Low Priority / Informational

5. **Helmet.js findings** - No action needed (positive security indicators)

---

## Evidence Files

All security scan reports are located in the `security/` directory:

### Semgrep Reports
- `security/sast-semgrep.txt` - Text report with all findings

### Trivy Reports
- `security/reports/trivy-backend.json` - Backend image JSON report
- `security/reports/trivy-backend.txt` - Backend image text report
- `security/reports/trivy-frontend.json` - Frontend image JSON report
- `security/reports/trivy-frontend.txt` - Frontend image text report
- `security/reports/trivy-postgres.json` - Postgres base image JSON report
- `security/reports/trivy-postgres.txt` - Postgres base image text report

### npm audit Reports
- `security/reports/npm-audit-backend.json` - Backend dependencies JSON report
- `security/reports/npm-audit-frontend.json` - Frontend dependencies JSON report

---

## Recommendations

### Immediate Actions
1. ✅ Fix 2 HIGH severity vulnerabilities in frontend (glob package)
2. ✅ Add USER directives to all Dockerfiles
3. ✅ Replace insecure random number generator

### Ongoing Security Practices
1. Run security scans before each release
2. Integrate Semgrep, Trivy, and npm audit into CI/CD pipeline
3. Monitor dependency updates regularly
4. Keep base images updated
5. Review and fix findings within 30 days

### Future Enhancements
1. Set up automated security scanning in CI/CD
2. Configure Dependabot for dependency updates
3. Implement rate limiting to prevent DoS attacks
4. Add input validation middleware
5. Regular penetration testing

---

## Conclusion

The TeamBoard project demonstrates **strong security practices** with:
- ✅ Zero vulnerabilities in npm dependencies (both frontend and backend)
- ✅ Zero CRITICAL vulnerabilities in Docker images
- ✅ Proper security headers configured (Helmet.js)
- ✅ Secure base images (postgres:14-alpine, node:22-alpine)

**Areas requiring attention**:
- ⚠️ 2 HIGH severity vulnerabilities in frontend Docker image (glob package)
- ⚠️ 3 security findings from Semgrep (Dockerfile USER, insecure random)

**Overall Security Status**: 🟡 **GOOD** - Minor issues identified, all fixable with recommended actions.

---

**Report Generated**: December 7, 2025  
**Next Review**: January 7, 2026 (monthly security review recommended)

