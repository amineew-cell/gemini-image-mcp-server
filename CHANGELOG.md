# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-04-01

### Changed

- **BREAKING**: Migrated from `@google/generative-ai` SDK to `@google/genai` SDK
- **BREAKING**: `aspectRatio` parameter now accepts ratio strings (`4:5`, `16:9`, etc.) instead of preset names (`square`, `landscape`, `portrait`)
- Default model changed to `gemini-3-pro-image-preview`
- `edit_image` tool now accepts `aspectRatio`, `imageSize`, and `model` parameters

### Added

- Native `imageConfig` support with 14 aspect ratios: `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`, `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9`
- `imageSize` parameter with 4 resolution tiers: `512`, `1K`, `2K`, `4K`
- `model` parameter to override the Gemini model per request
- CLI flags: `--size / -z` for image size, `--model / -m` for model selection
- CLI flags for edit command: `--aspect / -a`, `--size / -z`, `--model / -m`

### Removed

- Aspect ratio helper images (`assets/square.png`, `assets/landscape.png`, `assets/portrait.png`)
- Prompt suffix hack ("Use the white image only as a guide for the aspect ratio")
- `scripts/copyAssets.mjs` build step
