# Changelog

## [1.0.0] - 2025-12-04

### Added

- Initial stable release of the Express REST API.
- Endpoint: GET /api/v1/emojis to retrieve a list of emojis.
- Endpoint: GET /api/v1/emojis/random to retrieve one random emoji.
- Zod validation for environment variables (PORT, NODE_ENV).
- Centralized error handling middleware.
- Security headers implemented via Helmet.

### Changed

- Updated testing framework to use Vitest and Supertest.
- Improved integration tests with schema validation checks.

### Fixed

- Fixed issue where 'expect' was not imported in app.test.js.

### Removed

- Nothing
