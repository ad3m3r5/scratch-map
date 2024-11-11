# Changelog

This changelog will be based on the syntax provided by [keep a changelog](https://keepachangelog.com/)

## Table of Contents
  - [README](../README.md)
  - Changes
    - [Unreleased](#unreleased---2024-11-10)

## [Unreleased] - 2024-11-10

This released includes a breaking change noted below.

### Added
- Environment variable `LOG_LEVEL`
- Express/Node now listen for `SIGTERM` and `SIGINT` for better shutdown processes
- Fullscreen button for map view

### Changed
- BREAKING: Renamed `DBLOCATION` environment variable to `DATA_DIR`
  - Update your `docker run` command, `compose.yaml` file, or other applications environment variable locations
- Database attributes `countries` and `states` have been changed to `world` and `united-states-of-america`
  - The db.json file should be automatically updated for you, including the db version label
- Docs are more organized
- Based Docker image to bump Node and Alpine versions
- Dockerfile logic to update alpine packages with apk
- `console.log` has been replaced with `console.info` and `console.debug` to match `LOG_LEVEL`
- json code files moved to subdirectory under `utils/`

### Fixed
- The map had an issue where dragging and releasing on the same entity would cause a click event. A timeout has been added to decrease the change of that.
