# Changelog

## Table of Contents
  - [README](../README.md)
  - Changes
    - [Unreleased](#unreleased---2024-11-10)

## [Unreleased] - 2024-11-10

This released includes breaking changes noted below.

### Added
- Environment variable `LOG_LEVEL`
- Express/Node now listen for `SIGTERM` and `SIGINT` for better shutdown processes

### Changed
- BREAKING: Renamed `DBLOCATION` environment variable to `DATA_DIR`
  - Update your `docker run` command, `compose.yaml` file, or other applications environment variable locations
- Docs are more organized
- Based Docker image to bump Node and Alpine versions
- Dockerfile logic to update alpine packages with apk
- `console.log` has been replaced with `console.info` and `console.debug` to match `LOG_LEVEL`
