# Lucid Import MCP Server

An MCP (Model Context Protocol) server that enables creation of Lucid chart process maps using the Lucid REST API with OAuth2 authentication and Standard Import JSON format.

## Features

- **OAuth2 Authentication**: Secure per-user authentication with Lucid API
- **Process Map Creation**: Create simple linear process flows with automatic shape placement
- **Custom Diagrams**: Build complex diagrams with full control over shapes, connectors, and styling
- **Step-by-Step Builder**: Construct diagrams programmatically with an intuitive API
- **Standard Import Support**: Full support for Lucid Standard Import JSON format
- **Multi-Product**: Works with both Lucidchart and Lucidspark

## Installation

```bash
npm install
npm run build
```

## Configuration

### Setting up OAuth2 with Lucid

1. Create an OAuth2 client in your Lucid account:
   - Go to Lucid Developer Portal
   - Create a new OAuth2 application
   - Note your `Client ID` and `Client Secret`
   - Set your redirect URI (e.g., `http://localhost:3000/callback`)

2. Set environment variables:

```bash
export LUCID_CLIENT_ID="your_client_id"
export LUCID_CLIENT_SECRET="your_client_secret"
export LUCID_REDIRECT_URI="http://localhost:3000/callback"

# Optional: Set tokens directly if you already have them
export LUCID_ACCESS_TOKEN="your_access_token"
export LUCID_REFRESH_TOKEN="your_refresh_token"
```

### MCP Configuration

Add to your MCP settings file (e.g., Claude Desktop config):

```json
{
  "mcpServers": {
    "lucid-import": {
      "command": "node",
      "args": ["/path/to/lucid-import2-mcp/build/index.js"],
      "env": {
        "LUCID_CLIENT_ID": "your_client_id",
        "LUCID_CLIENT_SECRET": "your_client_secret",
        "LUCID_REDIRECT_URI": "http://localhost:3000/callback"
      }
    }
  }
}
```

## Available Tools

### Authentication Tools

#### `lucid_get_auth_url`
Generate OAuth2 authorization URL for user authentication.

**Parameters:**
- `state` (optional): State parameter for CSRF protection

**Returns:** Authorization URL that users must visit

#### `lucid_exchange_code`
Exchange authorization code for access token.

**Parameters:**
- `code` (required): Authorization code from OAuth callback

**Returns:** Success message with token expiration info

#### `lucid_set_token`
Manually set an access token.

**Parameters:**
- `token` (required): Access token to use

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

#### `lucid_create_custom_diagram`
Create a custom diagram with full JSON specification.

**Parameters:**
- `title` (required): Document title
- `documentJson` (required): Complete document JSON string
- `product` (optional): 'lucidchart' or 'lucidspark'
- `parentFolderId` (optional): Folder ID

## Usage Workflow

### 1. Authentication

First, get the authorization URL:
```
Use tool: lucid_get_auth_url
```

Visit the URL, authorize the application, and get the authorization code.

Exchange the code for a token:
```
Use tool: lucid_exchange_code
Parameters: { "code": "your_authorization_code" }
```

Alternatively, set a token directly:
```
Use tool: lucid_set_token
Parameters: { "token": "your_access_token" }
```

### 2. Create Diagrams

Create a simple process map:
```
Use tool: lucid_create_process_map
Parameters: {
  "title": "My Process",
  "steps": ["Start", "Step 1", "Step 2", "End"]
}
```

Or build a custom diagram:
```
Use tool: lucid_build_diagram_step_by_step
Parameters: {
  "pageTitle": "Custom Diagram",
  "shapes": [...],
  "connectors": [...]
}
```

Then import the generated JSON:
```
Use tool: lucid_import_diagram
Parameters: {
  "title": "My Custom Diagram",
  "documentJson": "..."
}
```

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

## API Scopes

The server requests these OAuth2 scopes:
- `lucidchart.document.content` - Create/edit Lucidchart documents
- `lucidchart.document.app.folder` - Access folders
- `lucidspark.document.content` - Create/edit Lucidspark boards
- `lucidspark.document.app.folder` - Access folders
- `user.profile` - Read user profile

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch mode for development
npm run watch
```

## Troubleshooting

### Authentication Issues
- Ensure CLIENT_ID and CLIENT_SECRET are correct
- Check that redirect URI matches your OAuth app configuration
- Verify that scopes are properly requested

### Import Failures
- Validate JSON structure matches Standard Import format
- Check that all UUIDs are unique
- Ensure file size limits are not exceeded
- Verify access token is valid and not expired

### API Errors
- Check that you have proper permissions for the folder
- Ensure the product type matches your license (lucidchart vs lucidspark)
- Verify network connectivity to api.lucid.co

## Resources

- [Lucid REST API Documentation](https://lucid.readme.io/reference/overview)
- [OAuth 2.0 Authentication](https://lucid.readme.io/reference/using-oauth-20)
- [Standard Import Format](https://lucid.readme.io/docs/overview-si)
- [Standard Import Reference](https://lucid.readme.io/docs/reference-si)
- [MCP Documentation](https://modelcontextprotocol.io)

## License

MIT
