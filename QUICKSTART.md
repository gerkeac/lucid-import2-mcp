# Quick Start Guide

Get up and running with the Lucid Import MCP Server in 5 minutes.

## 1. Install & Build

```bash
npm install
npm run build
```

## 2. Start the Server

```bash
npm start
```

The server will start on `http://localhost:3000`.

## 3. Configure Your MCP Client

You need an MCP Client that supports OAuth 2.0, such as **LibreChat**.

### LibreChat Configuration (`librechat.yaml`)

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
      token_url: "https://api.lucid.co/oauth2/token"
      scope: "lucidchart.document.app lucidchart.document.content lucidspark.document.app lucidspark.document.content user.profile"
      redirect_uri: "https://your-librechat-url.com/api/mcp/lucid-chart/oauth/callback"
```

**Note:** You'll need to create an OAuth2 app in the [Lucid Developer Portal](https://lucid.app/developers) and get your Client ID and Secret.

## 4. Authenticate & Use

1.  Open LibreChat.
2.  Click the **Connect** button for Lucid Chart.
3.  Authorize the application in the popup.
4.  Start creating diagrams!

## 5. Example Prompts

### Simple Process Map
```
Create a process map in Lucidchart titled "Order Processing" with these steps:
- Order Received
- Validate Order
- Process Payment
- Ship Order
- Order Complete
```

### Custom Diagram
```
Build a custom diagram with:
- A start oval at (200, 50) saying "Begin"
- A process box at (200, 150) saying "Process"
- A decision diamond at (200, 260) saying "Approve?"
- Connect them in sequence
```

### Get User Info
```
Get my Lucid user profile
```

## Troubleshooting

**Server not found?**
→ Ensure `npm start` is running.
→ Check the URL in `librechat.yaml` matches your server address.

**Authentication fails?**
→ Verify Client ID and Secret.
→ Check Redirect URI matches exactly what's in Lucid Developer Portal.

**Import fails?**
→ Check your Lucid account has proper permissions.

## Next Steps

- Read [README.md](README.md) for complete documentation.
- Check [examples.md](examples.md) for advanced examples.
