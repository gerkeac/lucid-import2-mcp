# Quick Start Guide

Get up and running with the Lucid Import MCP Server in 5 minutes.

## 1. Install Dependencies

```bash
npm install
npm run build
```

## 2. Set Up OAuth2 Credentials

1. Go to [Lucid Developer Portal](https://lucid.app/developers)
2. Create a new OAuth2 application
3. Copy your Client ID and Client Secret
4. Set redirect URI to `http://localhost:3000/callback`

## 3. Configure Environment

Create a `.env` file:

```bash
LUCID_CLIENT_ID=your_client_id_here
LUCID_CLIENT_SECRET=your_client_secret_here
LUCID_REDIRECT_URI=http://localhost:3000/callback
```

## 4. Add to MCP Client

For Claude Desktop, edit your config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "lucid-import": {
      "command": "node",
      "args": ["/full/path/to/lucid-import2-mcp/build/index.js"],
      "env": {
        "LUCID_CLIENT_ID": "your_client_id",
        "LUCID_CLIENT_SECRET": "your_client_secret",
        "LUCID_REDIRECT_URI": "http://localhost:3000/callback"
      }
    }
  }
}
```

**Important**: Replace `/full/path/to` with the actual absolute path!

## 5. Restart Claude Desktop

Quit and restart Claude Desktop completely.

## 6. Authenticate

In Claude, say:

```
Use the lucid_get_auth_url tool to get the authorization URL
```

1. Open the URL in your browser
2. Authorize the application
3. Copy the `code` parameter from the redirect URL
4. Exchange it for a token:

```
Use lucid_exchange_code with code: "your_code_here"
```

## 7. Create Your First Process Map

```
Create a process map in Lucidchart titled "Order Processing" with these steps:
- Order Received
- Validate Order
- Process Payment
- Ship Order
- Order Complete
```

Claude will use `lucid_create_process_map` and return an edit URL!

## Quick Commands

### Simple Process Map
```
Create a process map with steps: Start, Step 1, Step 2, End
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

**"Not authenticated" error?**
→ Run through steps 6 to authenticate first

**Server not found?**
→ Check that the path in config is absolute and correct
→ Verify `npm run build` completed successfully
→ Restart Claude Desktop

**Import fails?**
→ Check your Lucid account has proper permissions
→ Verify you have access to Lucidchart/Lucidspark

## Next Steps

- Read [README.md](README.md) for complete documentation
- Check [examples.md](examples.md) for advanced examples
- See [SETUP.md](SETUP.md) for detailed setup instructions

## Example: Complete Workflow

```
1. "Get the Lucid authorization URL"
   → Visit URL, authorize, get code

2. "Exchange this code: ABC123DEF456"
   → Authenticated!

3. "Create a simple process map for customer onboarding with 5 steps"
   → Process map created with edit URL

4. "Now create a more complex approval workflow with decision points"
   → Custom diagram with diamonds and branches
```

## Tips

- Start with simple process maps to test your setup
- Use descriptive titles for your documents
- Lucidchart is great for flowcharts and process diagrams
- Lucidspark is better for brainstorming and boards
- Keep shape text short (2-4 words) for readability
- Leave space between shapes (120+ pixels vertically)

## Common Use Cases

**Business Process Mapping**
```
Map out our employee onboarding process with all steps from offer letter to first day
```

**Software Workflows**
```
Create a diagram showing our CI/CD pipeline from commit to deployment
```

**Decision Trees**
```
Build a decision tree for customer support ticket routing
```

**System Architecture**
```
Create a diagram showing how our microservices communicate
```

## Getting Help

- Full docs: [README.md](README.md)
- Detailed setup: [SETUP.md](SETUP.md)
- Examples: [examples.md](examples.md)
- Lucid API: https://lucid.readme.io/reference/overview

Happy diagramming! 🎨
