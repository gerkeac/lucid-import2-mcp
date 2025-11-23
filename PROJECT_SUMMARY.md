# Lucid Import MCP Server - Project Summary

## Overview
Complete MCP server implementation for creating Lucid chart process maps using the Standard Import API. Designed as a **Stateless Middleware** where authentication is handled by the MCP Client (e.g., LibreChat) via OAuth 2.0.

## Project Structure

```
lucid-import2-mcp/
├── src/
│   ├── index.ts           # Main Express server with MCP SSE transport
│   ├── lucid-client.ts    # Lucid REST API client
│   ├── builder.ts         # Document builder for process maps
│   └── types.ts           # TypeScript type definitions
├── build/                 # Compiled JavaScript (generated)
├── docs/
│   ├── README.md          # Complete documentation
│   ├── SETUP.md           # Detailed setup guide
│   ├── QUICKSTART.md      # Quick start guide
│   └── examples.md        # Usage examples
├── package.json           # NPM package configuration
├── tsconfig.json          # TypeScript configuration
├── .env.example           # Environment variable template
├── .gitignore            # Git ignore rules
└── LICENSE               # MIT License
```

## Features Implemented

### Architecture
- ✅ **Stateless Middleware**: No local token storage.
- ✅ **Express Server**: Handles HTTP/SSE connections.
- ✅ **AsyncLocalStorage**: Propagates auth tokens from request headers to tool execution.

### API Client (lucid-client.ts)
- ✅ Document import via Standard Import format
- ✅ Empty document creation
- ✅ User profile retrieval
- ✅ .lucid file generation (ZIP with document.json)
- ✅ Form-data multipart upload

### Document Builder (builder.ts)
- ✅ Process boxes (rectangles)
- ✅ Decision diamonds
- ✅ Start/End ovals
- ✅ Custom shapes with full styling
- ✅ Connectors between shapes
- ✅ Multi-page support
- ✅ Simple linear process generator
- ✅ Custom data and styling

### MCP Tools (index.ts)
1. **lucid_get_user_profile** - Get user information
2. **lucid_create_process_map** - Create simple linear process
3. **lucid_build_diagram_step_by_step** - Build custom diagrams
4. **lucid_import_diagram** - Import and create document

## Technical Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Server**: Express
- **Transport**: MCP SSEServerTransport
- **Framework**: MCP SDK 1.0.4
- **HTTP Client**: node-fetch 3.3.2
- **Archiving**: archiver 7.0.1
- **ID Generation**: uuid 10.0.0

## API Integration

### Lucid REST API
- Base URL: `https://api.lucid.co`
- Authentication: OAuth 2.0 Bearer token (passed from client)
- API Version: 1
- Endpoints used:
  - POST `/documents` - Document creation
  - GET `/users/me` - User profile

## Standard Import Format

The server creates `.lucid` files (ZIP archives) containing:
- `document.json` - Document definition with pages, shapes, lines
- Optional: `/data` folder for CSV data
- Optional: `/images` folder for embedded images

### Document JSON Structure
```json
{
  "version": "1.0",
  "pages": [{
    "id": "uuid",
    "title": "Page Title",
    "shapes": [...],
    "lines": [...]
  }]
}
```

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)

### MCP Client Configuration
Configure your MCP client (e.g., LibreChat) to handle OAuth:
```yaml
mcpServers:
  lucid-chart:
    type: streamable-http
    url: "http://localhost:3000/sse"
    requiresOAuth: true
    oauth:
      # ... Lucid OAuth credentials ...
```

## Usage Workflow

1. **Setup**: Run the MCP server (`npm start`).
2. **Connect**: Configure MCP Client with OAuth credentials.
3. **Authenticate**: User connects via Client UI.
4. **Create**: User prompts Client to create diagrams.
5. **Execute**: Client sends token + request to Server; Server calls Lucid API.

## Security Considerations

- **Stateless**: Server stores no user credentials.
- **HTTPS**: Recommended for production deployment.
- **Token Validation**: Invalid tokens rejected by Lucid API.

## Testing & Validation

- TypeScript strict mode enabled
- Build validation: `npm run build`
- All dependencies installed and verified
- Example workflows provided
- Comprehensive error handling

## Documentation

- **README.md**: Complete API reference and usage
- **SETUP.md**: Step-by-step setup instructions
- **QUICKSTART.md**: 5-minute getting started guide
- **examples.md**: Real-world usage examples
- **Inline comments**: Extensive code documentation

## Status

✅ **Production Ready**
- All core features implemented
- Stateless architecture adopted
- TypeScript compilation successful
- Documentation complete
- Standard Import format validated

Built with ❤️ for the MCP community
