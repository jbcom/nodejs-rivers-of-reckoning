# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Automated semantic versioning with python-semantic-release
- Comprehensive E2E testing with Playwright following best practices
- Modernized build workflow using tox-gh-actions
- Ruff auto-formatting and linting

### Changed
- Updated all GitHub Actions to latest versions with SHA pins
- Refactored test suite to separate unit, integration, and E2E tests
- Improved CI/CD pipeline with proper job dependencies

### Fixed
- Critical bug: confused players can no longer walk through walls
- Build failures in E2E tests by separating build and test phases
- Ruff configuration to use proper lint subsections

### Removed
- Failing AI review workflows (Claude, Codex, OpenRouter)

## [0.5.0] - 2025-12-25

### Added
- Initial game release
- Procedural world generation with infinite biomes
- ECS architecture with esper
- Web deployment via pygbag
- Comprehensive test suite
- Sphinx documentation

[unreleased]: https://github.com/arcade-cabinet/rivers-of-reckoning/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/arcade-cabinet/rivers-of-reckoning/releases/tag/v0.5.0
