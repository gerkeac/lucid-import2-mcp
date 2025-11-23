# Lucid Import MCP Server

An MCP (Model Context Protocol) server that enables creation of Lucid chart process maps using the Lucid REST API. This server is designed to run as a **Stateless Middleware**, where authentication is handled by the MCP Client (e.g., LibreChat) and tokens are passed to the server with each request.

## Features

- **Stateless Architecture**: No local token storage; secure and scalable.
- **Process Map Creation**: Create simple linear process flows with automatic shape placement.
- **Custom Diagrams**: Build complex diagrams with full control over shapes, connectors, and styling.
- **Step-by-Step Builder**: Construct diagrams programmatically with an intuitive API.
- **Standard Import Support**: Full support for Lucid Standard Import JSON format.
- **Multi-Product**: Works with both Lucidchart and Lucidspark.

## Installation

```bash
npm install
npm run build
```

## Running the Server

The server runs as an Express app with an SSE (Server-Sent Events) endpoint.

```bash
npm start
```

This will start the server on port 3000 (default).
SSE Endpoint: `http://localhost:3000/sse`

## Configuration

### MCP Client Configuration (e.g., LibreChat)

Configure your MCP client to use the SSE transport and handle OAuth 2.0.

```yaml
mcpServers:
  lucid-chart:
    type: streamable-http
    url: "http://localhost:3000/sse"
    requiresOAuth: true
    oauth:
      client_id: "${LUCID_CLIENT_ID}"
      client_secret: "${LUCID_CLIENT_SECRET}"
      authorization_url: "https://lucid.app/oauth2/authorize"
      token_url: "https://lucid.app/oauth2/token"
      scope: "lucidchart.document.app lucidchart.document.content lucidspark.document.app lucidspark.document.content user.profile"
      redirect_uri: "https://your-client-url.com/api/mcp/lucid-chart/oauth/callback"
```

### Environment Variables (Server)

The server itself is stateless and doesn't need the OAuth secrets, but you can configure the port:

```bash
PORT=3000
```

## Available Tools

### User Tools

#### `lucid_get_user_profile`
Get authenticated user's profile information.

**Returns:** User ID, name, and email

### Document Creation Tools

#### `lucid_create_process_map`
Create a simple linear process map.

**Parameters:**
- `title` (required): Document title
- `steps` (required): Array of process step names
- `product` (optional): 'lucidchart' or 'lucidspark' (default: 'lucidchart')
- `parentFolderId` (optional): Folder ID to create document in

**Example:**
```json
{
  "title": "Order Fulfillment Process",
  "steps": [
    "Start",
    "Receive Order",
    "Check Inventory",
    "Process Payment",
    "Ship Order",
    "End"
  ],
  "product": "lucidchart"
}
```

#### `lucid_build_diagram_step_by_step`
Build a diagram step-by-step with shapes and connectors.

**Parameters:**
- `pageTitle` (required): Page title
- `shapes` (required): Array of shape definitions
- `connectors` (optional): Array of connector definitions

**Shape Types:**
- `process` / `rectangle`: Process box
- `decision` / `diamond`: Decision diamond
- `start` / `end` / `ellipse`: Start/End oval

**Example:**
```json
{
  "pageTitle": "Approval Workflow",
  "shapes": [
    {
      "type": "start",
      "x": 200,
      "y": 50,
      "text": "Start",
      "fillColor": "#C5E0B4"
    },
    {
      "type": "process",
      "x": 200,
      "y": 150,
      "width": 120,
      "height": 60,
      "text": "Submit Request",
      "fillColor": "#FFFFFF"
    },
    {
      "type": "decision",
      "x": 200,
      "y": 250,
      "text": "Approved?",
      "fillColor": "#FFE699"
    }
  ],
  "connectors": [
    { "from": 0, "to": 1 },
    { "from": 1, "to": 2 }
  ]
}
```

#### `lucid_import_diagram`
Import a complete diagram JSON into Lucid.

**Parameters:**
- `title` (required): Document title
- `documentJson` (required): JSON string of document definition
- `product` (optional): 'lucidchart' or 'lucidspark'
- `parentFolderId` (optional): Folder ID



## Usage Workflow

1.  **Connect**: User clicks "Connect" in the MCP Client (e.g., LibreChat).
2.  **Authenticate**: User logs in to Lucid via the OAuth popup.
3.  **Use Tools**: User asks Claude/LLM to create diagrams.
    - The Client sends the access token in the `Authorization` header.
    - The Server uses the token to call the Lucid API.

## Standard Import Format

The server uses Lucid's Standard Import format, which consists of a `.lucid` file (ZIP archive) containing a `document.json` file.

### Document Structure

```json
{
  "version": "1.0",
  "pages": [
    {
      "id": "page-uuid",
      "title": "Page 1",
      "shapes": [
        {
          "id": "shape-uuid",
          "shapeType": "rectangle",
          "boundingBox": {
            "x": 100,
            "y": 100,
            "w": 120,
            "h": 60
          },
          "text": "Process Step",
          "style": {
            "fill": { "color": "#FFFFFF", "type": "solid" },
            "stroke": { "color": "#000000", "width": 2, "style": "solid" }
          }
        }
      ],
      "lines": [
        {
          "id": "line-uuid",
          "endpoint1": {
            "x": 0,
            "y": 0,
            "shapeId": "shape-uuid-1",
            "position": "auto"
          },
          "endpoint2": {
            "x": 0,
            "y": 0,
            "shapeId": "shape-uuid-2",
            "position": "auto"
          },
          "style": {
            "stroke": { "color": "#000000", "width": 2, "style": "solid" }
          }
        }
      ]
    }
  ]
}
```

## Shape Types

- `rectangle`: Rectangle/Process box
- `ellipse`: Oval/Ellipse
- `diamond`: Diamond/Decision shape
- `circle`: Circle
- `triangle`: Triangle
- `parallelogram`: Parallelogram
- `trapezoid`: Trapezoid
- `hexagon`: Hexagon

## Color Formats

Colors are specified as hex strings:
- `#FFFFFF` - White
- `#000000` - Black
- `#C5E0B4` - Light green
- `#FFE699` - Light yellow
- `#BDD7EE` - Light blue

## Limitations

Per Lucid Standard Import specifications:
- ZIP file contents: 50MB maximum
- document.json: 2MB maximum
- All items must have unique UUIDs
- At least one page required

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start Server
npm start
```

## Resources

- [Lucid REST API Documentation](https://lucid.readme.io/reference/overview)
- [OAuth 2.0 Authentication](https://lucid.readme.io/reference/using-oauth-20)
- [Standard Import Format](https://lucid.readme.io/docs/overview-si)
- [Standard Import Reference](https://lucid.readme.io/docs/reference-si)
- [MCP Documentation](https://modelcontextprotocol.io)

## License

MIT
