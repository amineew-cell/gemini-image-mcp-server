# Gemini Image MCP Server

[![npm version](https://img.shields.io/npm/v/gemini-image-mcp-server)](https://www.npmjs.com/package/gemini-image-mcp-server)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/amineew-cell/gemini-image-mcp-server/actions/workflows/ci.yml/badge.svg)](https://github.com/amineew-cell/gemini-image-mcp-server/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/node/v/gemini-image-mcp-server)](https://nodejs.org)

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for generating and editing images using Google's Gemini AI models. Provides two tools that any MCP client can use to create images from text descriptions and modify existing images with natural language instructions.

## Features

- **14 aspect ratios** natively supported via Gemini's `imageConfig`: `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`, `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9`
- **4 resolution tiers**: `512` (Flash models only), `1K`, `2K`, `4K`
- **Multiple Gemini models**: `gemini-3-pro-image-preview` (high-fidelity, accurate text) and `gemini-3.1-flash-image-preview` (fast, cost-efficient), with any model string accepted
- **Image editing**: modify existing images with natural language instructions, including aspect ratio changes
- **Reference images**: provide context images to guide generation style and composition
- **Watermarking**: overlay brand logos or watermarks with configurable positioning
- **CLI included**: standalone command-line interface for terminal workflows
- **MCP + stdio transport**: works with any MCP client (Claude Desktop, Claude Code, VS Code, Cursor, and more)

## Quick Start

### Prerequisites

A Google AI API key is required. Get one free at [Google AI Studio](https://aistudio.google.com/apikey).

### Install and Run

```bash
npx gemini-image-mcp-server
```

Or install globally:

```bash
npm install -g gemini-image-mcp-server
```

## Installation

Configure the server in your MCP client. The server communicates over stdio.

<details>
<summary><strong>Claude Desktop</strong></summary>

Add to your `claude_desktop_config.json`:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "npx",
      "args": ["-y", "gemini-image-mcp-server"],
      "env": {
        "GOOGLE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude mcp add gemini-image -- npx -y gemini-image-mcp-server
```

Then set your API key in the environment or in your `.claude/settings.json`:

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "npx",
      "args": ["-y", "gemini-image-mcp-server"],
      "env": {
        "GOOGLE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>VS Code (Copilot)</strong></summary>

Add to your VS Code `settings.json`:

```json
{
  "mcp": {
    "servers": {
      "gemini-image": {
        "command": "npx",
        "args": ["-y", "gemini-image-mcp-server"],
        "env": {
          "GOOGLE_API_KEY": "your-api-key-here"
        }
      }
    }
  }
}
```

</details>

<details>
<summary><strong>Cursor</strong></summary>

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "npx",
      "args": ["-y", "gemini-image-mcp-server"],
      "env": {
        "GOOGLE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

</details>

<details>
<summary><strong>From Source (all clients)</strong></summary>

Clone and build, then point your MCP client to the compiled entry:

```bash
git clone https://github.com/amineew-cell/gemini-image-mcp-server.git
cd gemini-image-mcp-server
npm install
npm run build
```

Use in your MCP client config:

```json
{
  "mcpServers": {
    "gemini-image": {
      "command": "node",
      "args": ["/absolute/path/to/gemini-image-mcp-server/dist/index.js"],
      "env": {
        "GOOGLE_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

</details>

## Configuration

| Environment Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | Yes | Google AI API key from [AI Studio](https://aistudio.google.com/apikey) |

## Tools

### `generate_image`

Create a new image from a text description. Use this tool when you need to generate fresh visual content.

Best for: product shots, illustrations, social media graphics, concept art, textures, backgrounds.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `description` | string | Yes | | Detailed description of the image to generate |
| `aspectRatio` | string | No | `1:1` | Output aspect ratio. One of: `1:1`, `1:4`, `1:8`, `2:3`, `3:2`, `3:4`, `4:1`, `4:3`, `4:5`, `5:4`, `8:1`, `9:16`, `16:9`, `21:9` |
| `imageSize` | string | No | `1K` | Resolution tier. One of: `512` (Flash only), `1K`, `2K`, `4K`. Must be uppercase K. |
| `model` | string | No | `gemini-3-pro-image-preview` | Gemini model ID. Use `gemini-3.1-flash-image-preview` for faster, cheaper generation. |
| `style` | string | No | | Style hint (e.g., "minimalist", "watercolor", "photorealistic") |
| `images` | string[] | No | | File paths to reference images that guide the generation |
| `outputPath` | string | No | cwd | Where to save the image. Can be a directory or full file path. |
| `watermarkPath` | string | No | | Path to a watermark image to overlay |
| `watermarkPosition` | string | No | `bottom-right` | Watermark corner: `top-left`, `top-right`, `bottom-left`, `bottom-right` |

**Returns:** The absolute file path of the saved image.

**Example tool call:**

```json
{
  "name": "generate_image",
  "arguments": {
    "description": "A brown leather wallet on a white marble surface, overhead studio lighting, minimal composition",
    "aspectRatio": "4:5",
    "imageSize": "2K",
    "outputPath": "./images/wallet-hero.png"
  }
}
```

### `edit_image`

Modify an existing image using natural language instructions. Use this tool when you have an image and want to change specific elements, adjust composition, or transform the aspect ratio.

Best for: retouching, background changes, adding/removing elements, recomposing for different aspect ratios, style transfer.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `description` | string | Yes | | Instructions describing the edits to apply |
| `image` | string | Yes | | Path to the source image to edit |
| `aspectRatio` | string | No | | Output aspect ratio. Use this to recompose an image for a different format (e.g., square to portrait). |
| `imageSize` | string | No | | Resolution tier for the output |
| `model` | string | No | `gemini-3-pro-image-preview` | Gemini model ID |
| `outputPath` | string | No | cwd | Where to save the edited image |

**Returns:** The absolute file path of the saved edited image.

**Example tool call:**

```json
{
  "name": "edit_image",
  "arguments": {
    "description": "Extend the background naturally to fill a taller portrait composition. Keep the subject centered.",
    "image": "./images/product-square.png",
    "aspectRatio": "4:5",
    "outputPath": "./images/product-portrait.png"
  }
}
```

### Choosing Between Tools

| Scenario | Tool | Why |
|---|---|---|
| Create an image from scratch | `generate_image` | No source image needed |
| Change aspect ratio of existing image | `edit_image` | Preserves content while recomposing |
| Add/remove elements from a photo | `edit_image` | Modifies specific parts |
| Generate variations inspired by a reference | `generate_image` with `images` | Uses reference as style guide, creates new content |
| Apply a watermark | `generate_image` | Built-in watermark support |

## Usage Examples

These are natural language prompts you can use with any MCP client:

**Generate a product shot for Instagram:**
> Generate an image of a leather notebook on a wooden desk with soft window light. Use 4:5 aspect ratio for Instagram feed.

**Create a wide banner:**
> Create a panoramic minimalist workspace scene with a pen and folio. 16:9 ratio, 2K resolution.

**Edit an existing image:**
> Edit this image: extend the background to change it from square to 4:5 portrait format. Keep the subject centered and extend the background naturally.

**Generate with a reference image:**
> Generate a product shot inspired by this reference image, but with a darker background and warmer lighting. Use the same composition style.

**High-resolution texture:**
> Generate a close-up of leather grain texture with warm directional lighting. Square format, 2K resolution.

## CLI

The server includes a standalone CLI for terminal workflows.

### Generate

```bash
gemini-image generate \
  --prompt "A leather wallet on white marble, studio lighting" \
  --aspect 4:5 \
  --size 2K \
  --output ./images/wallet.png
```

### Edit

```bash
gemini-image edit \
  --prompt "Make the background darker and add warm highlights" \
  --input ./images/original.png \
  --aspect 4:5 \
  --output ./images/edited.png
```

### All CLI Flags

**Generate command:**

| Flag | Short | Description |
|---|---|---|
| `--prompt` | `-p` | Image description (required) |
| `--aspect` | `-a` | Aspect ratio (e.g., `4:5`, `16:9`). Default: `1:1` |
| `--size` | `-z` | Image size: `512`, `1K`, `2K`, `4K`. Default: `1K` |
| `--model` | `-m` | Gemini model ID |
| `--style` | `-s` | Style hint |
| `--context` | `-c` | Reference image path (repeatable) |
| `--output` | `-o` | Output path |
| `--watermark` | | Watermark image path |
| `--watermark-position` | | Watermark corner position |

**Edit command:**

| Flag | Short | Description |
|---|---|---|
| `--prompt` | `-p` | Edit instructions (required) |
| `--input` | `-i` | Source image path (required) |
| `--aspect` | `-a` | Output aspect ratio |
| `--size` | `-z` | Output image size |
| `--model` | `-m` | Gemini model ID |
| `--output` | `-o` | Output path |

## Available Models

| Model | Best For | Notes |
|---|---|---|
| `gemini-3-pro-image-preview` | Complex design, high-fidelity output, accurate text in images | Default. Higher quality, slower. |
| `gemini-3.1-flash-image-preview` | High-volume generation, fast iteration, cost-efficient | Faster and cheaper. Supports `512` image size. |

You can pass any valid Gemini model ID via the `model` parameter.

## Troubleshooting

### "GOOGLE_API_KEY environment variable is required"

The API key is not set. Ensure your MCP client config includes the `env` block with `GOOGLE_API_KEY`, or export it in your shell for CLI usage.

### "models/xxx is not found" (404 error)

The model ID is invalid or not available for your API key. Check:
- The model name is spelled correctly (e.g., `gemini-3-pro-image-preview`, not `gemini-3-pro`)
- Your API key has access to the model (some models require allowlisting)

### Image has wrong aspect ratio

Verify you are passing the `aspectRatio` parameter. If omitted, the default is `1:1`. The ratio must be one of the 14 supported values.

### "Gemini finish reason: SAFETY" or empty response

The prompt or generated content triggered Gemini's safety filters. Try:
- Rephrasing the prompt to be more specific and less ambiguous
- Using a different model (Flash may have different filtering thresholds)

### Image file not saved / permission error

- Ensure the output directory exists or the server has permission to create it
- If specifying a directory, end the path with `/`
- Use absolute paths to avoid ambiguity

### Server not connecting to MCP client

- Verify the `command` and `args` in your client config are correct
- Check that `node` is in your PATH
- Look at stderr output for error messages (the server logs to stderr)
- Try running `npx gemini-image-mcp-server` directly to verify it starts

## Development

```bash
git clone https://github.com/amineew-cell/gemini-image-mcp-server.git
cd gemini-image-mcp-server
npm install
npm run build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development guidelines.

## License

[Apache-2.0](LICENSE)
