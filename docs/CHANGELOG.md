# Changelog

This changelog will be based on the syntax provided by [keep a changelog](https://keepachangelog.com/)

## Table of Contents
  - [README](../README.md)
  - Changes
    - [Unreleased](#unreleased---tbd)
    - [1.2.0](#120---tbd)
    - [1.1.12](#1112---2023-11-23)

## [Unreleased] - TBD

### Future
- Authentication
  - Local
  - OAuth2
  - SAML [Unsure]
- Multi-Visit Support
- "Home" country tagging
  - This will most likely be pre-scratched and colored differently
- Full date-picker rather than just "Year"

## [1.2.0] - TBD

This released includes a breaking change noted below.

### Added
- Share/Guest view-only mode using `/share/:map` URL path
- Public GitHub Actions - these were previously in a private repository for debugging
- Environment variable `LOG_LEVEL`
- Express/Node now listen for `SIGTERM` and `SIGINT` for better shutdown processes
- Fullscreen button for map view

### Changed
- BREAKING: Renamed `DBLOCATION` environment variable to `DATA_DIR`
  - Update your `docker run` command, `compose.yaml` file, or other applications environment variable locations
- Database attributes `countries` and `states` have been changed to `world` and `united-states-of-america`
  - The db.json file should be automatically updated for you, including the db version label
- Moved from `npm` to `yarn` due to performance inconsistencies
- Docs are more organized
- Based Docker image to bump Node and Alpine versions
- Dockerfile logic to update alpine packages with apk
- `console.log` has been replaced with `console.info` and `console.debug` to match `LOG_LEVEL`
- json code files moved to subdirectory under `utils/`
- Updated primary packages in `package.json`

### Fixed
- The map had an issue where dragging and releasing on the same entity would cause a click event. A timeout has been added to decrease the change of that.

## [1.1.12] - 2023-11-23

This is a placeholder for the already-released 1.1.12 and previous versions.
