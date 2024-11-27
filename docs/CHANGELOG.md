# Changelog

This changelog will be based on the syntax provided by [keep a changelog](https://keepachangelog.com/)

## Table of Contents
  - [README](../README.md)
  - Changes
    - [Unreleased](#unreleased---tbd)
    - [1.2.0](#120---2024-11-26)
    - [1.1.12](#1112---2023-11-23)

## [Unreleased] - TBD

### Planned
- Authentication
  - Local
  - OAuth2
- Multi-Visit Support
- "Home" country tagging
- Full date-picker rather than just "Year"

## [1.2.0] - 2024-11-26

This released includes a breaking change noted below.

### Added
- View-only page using `/view/:map` URL path
  - Enabled with `ENABLE_SHARE` environment variable
  - Button provided on `/map/:map` page to create and copy link
- Public GitHub Actions - these were previously in a private repository for debugging
- Environment variable `LOG_LEVEL`
- Express/Node now listen for `SIGTERM` and `SIGINT` for better shutdown processes
- Fullscreen button for map view

### Changed
- BREAKING: Renamed `DBLOCATION` environment variable to `DATA_DIR`
  - Update your `docker run` command, `compose.yaml` file, or other applications environment variable locations
  - Although it is labeled as breaking, there is currently a remap for backwards compatibility
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
- The was an XSS vulnerabiltiy with the URL input for a photo album. This was fixed with input sanitization and validation. Discovered by [l4rm4nd](https://github.com/l4rm4nd)
- The map had an issue where dragging and releasing on the same entity would cause a click event. A timeout has been added to decrease the change of that.

## [1.1.12] - 2023-11-23

This is a placeholder for the already-released 1.1.12 and previous versions.
