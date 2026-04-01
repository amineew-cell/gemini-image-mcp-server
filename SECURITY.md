# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | Yes                |
| < 2.0   | No                 |

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it
responsibly.

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please use [GitHub Security Advisories](https://github.com/amineew-cell/gemini-image-mcp-server/security/advisories/new)
to report the vulnerability privately.

You should receive a response within 48 hours. If the vulnerability is confirmed,
a fix will be developed and released as soon as possible.

## Security Considerations

This MCP server:

- Requires a `GOOGLE_API_KEY` environment variable. Never commit API keys to source control.
- Reads and writes image files to the local filesystem. Ensure output paths are trusted.
- Makes network requests to the Google Gemini API. All communication uses HTTPS.
- Does not store or log API keys, image content, or prompt text.
