# Changelog

## [1.0.0] - 2025-12-05

### Added

- Initial stable release of the Express REST API.
- Endpoint: GET /api/v1/emojis to retrieve a list of emojis.
- Endpoint: GET /api/v1/emojis/random to retrieve one random emoji.
- **Feature Flag implementation (`FEATURE_RANDOM_EMOJI`) to enable/disable the `/random` endpoint without redeploying.**
- Zod validation for environment variables (PORT, NODE_ENV, FEATURE_RANDOM_EMOJI).
- Centralized error handling middleware.
- Security headers implemented via Helmet.

### Changed

- Updated testing framework to use Vitest and Supertest.
- **Improved integration tests with Schema Validation and Negative Testing (checking for wrong HTTP methods).**
- **Added specific security tests to verify Helmet headers are present on all routes.**

### Fixed

- Fixed issue where 'expect' was not imported in app.test.js, causing tests to fail in CI.

### Removed

- none
