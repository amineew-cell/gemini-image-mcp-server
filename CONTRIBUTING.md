# Contributing

Contributions are welcome! This document explains how to get started.

## Prerequisites

- Node.js >= 18
- A Google AI API key ([get one here](https://aistudio.google.com/apikey))

## Setup

```bash
git clone https://github.com/amineew-cell/gemini-image-mcp-server.git
cd gemini-image-mcp-server
npm install
npm run build
```

## Development

```bash
# Watch mode (recompiles on changes)
npm run dev

# Build once
npm run build

# Run the MCP server
npm start

# Run the CLI
GOOGLE_API_KEY=your-key node dist/cli.js generate -p "test prompt" -o /tmp/test.png
```

## Project Structure

```
src/
  index.ts              # MCP server entry point (stdio transport)
  cli.ts                # CLI entry point (generate/edit commands)
  services/
    gemini.ts           # Google Gemini API client
    imageService.ts     # Image saving and watermark processing
    serviceFactory.ts   # Service initialization
  tools/
    generateImage.ts    # generate_image tool definition and handler
    editImage.ts        # edit_image tool definition and handler
    index.ts            # Tool re-exports
  types/
    index.ts            # Shared TypeScript types
  utils/
    errors.ts           # MCP error utilities
```

## Code Style

- TypeScript with strict mode
- ESM imports with explicit `.js` extensions
- 2-space indentation
- `camelCase` for variables and functions, `PascalCase` for classes
- Keep modules focused: services for external APIs, tools for MCP schemas + handlers, types for interfaces

## Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-change`)
3. Make your changes
4. Build and verify (`npm run build`)
5. Test manually with the CLI or an MCP client
6. Commit with a clear message (e.g., "Add support for PNG output format")
7. Open a pull request

### Pull Request Guidelines

- Include a summary of what changed and why
- Add manual verification steps (commands, expected output)
- Include screenshots or sample outputs for visual changes
- Keep changes focused and minimal

## Reporting Issues

- Use the GitHub issue templates for bug reports and feature requests
- Include your Node.js version, OS, and SDK version
- For API errors, include the error message (but never your API key)
