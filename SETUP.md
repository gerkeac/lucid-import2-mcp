# Setup Guide

Complete guide to setting up and using the Lucid Import MCP Server.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Lucid account (Lucidchart or Lucidspark)
- An MCP-compatible client (e.g., Claude Desktop)

## Step 1: Create Lucid OAuth2 Application

1. **Go to Lucid Developer Portal**
   - Visit [https://lucid.app/developers](https://lucid.app/developers)
   - Sign in with your Lucid account

2. **Create New OAuth2 Application**
   - Click "Create New App" or similar option
   - Fill in application details:
     - **Name**: Your application name (e.g., "MCP Process Map Creator")
     - **Description**: Brief description of your app
     - **Redirect URI**: `http://localhost:3000/callback` (or your preferred URI)
     - **Scopes**: Select all document-related scopes:
       - `lucidchart.document.content`
       - `lucidchart.document.app.folder`
       - `lucidspark.document.content`
       - `lucidspark.document.app.folder`
       - `user.profile`

3. **Save Your Credentials**
   - After creation, you'll receive:
     - **Client ID**: A unique identifier for your app
     - **Client Secret**: A secret key (keep this secure!)
   - Copy both values for the next step

## Step 2: Install the MCP Server

1. **Clone or Download the Repository**
   ```bash
   cd /path/to/lucid-import2-mcp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Project**
   ```bash
   npm run build
   ```

4. **Configure Environment Variables**

   Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   ```bash
   LUCID_CLIENT_ID=your_actual_client_id
   LUCID_CLIENT_SECRET=your_actual_client_secret
   LUCID_REDIRECT_URI=http://localhost:3000/callback
   ```

## Step 3: Configure MCP Client

### For Claude Desktop

1. **Locate Config File**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Add Server Configuration**

   Edit the config file and add:
   ```json
   {
     "mcpServers": {
       "lucid-import": {
         "command": "node",
         "args": ["/absolute/path/to/lucid-import2-mcp/build/index.js"],
         "env": {
           "LUCID_CLIENT_ID": "your_client_id",
           "LUCID_CLIENT_SECRET": "your_client_secret",
           "LUCID_REDIRECT_URI": "http://localhost:3000/callback"
         }
       }
     }
   }
   ```

   **Important**: Replace `/absolute/path/to/lucid-import2-mcp` with the actual absolute path to your installation.

3. **Restart Claude Desktop**
   - Quit Claude Desktop completely
   - Restart the application
   - The MCP server will now be available

### For Other MCP Clients

Refer to your MCP client's documentation for configuration instructions. Generally, you'll need to:
- Specify the command: `node`
- Provide args: `["/path/to/build/index.js"]`
- Set environment variables for OAuth2 credentials

## Step 4: Authenticate with Lucid

### Option A: OAuth2 Flow (Recommended)

1. **Get Authorization URL**

   Ask your MCP client to use the tool:
   ```
   Use the lucid_get_auth_url tool
   ```

2. **Authorize the Application**
   - Copy the URL from the response
   - Open it in your web browser
   - Log in to Lucid if needed
   - Click "Authorize" or "Allow"
   - You'll be redirected to your redirect URI with a code parameter

3. **Extract Authorization Code**

   From the redirect URL:
   ```
   http://localhost:3000/callback?code=AUTHORIZATION_CODE_HERE&state=...
   ```

   Copy the `code` value.

4. **Exchange Code for Token**

   Use the tool:
   ```
   Use lucid_exchange_code with the code parameter
   ```

5. **Verify Authentication**

   Test with:
   ```
   Use lucid_get_user_profile
   ```

### Option B: Manual Token (Quick Testing)

If you already have an access token:

1. **Set Token Directly**
   ```
   Use lucid_set_token with your access token
   ```

2. **Verify**
   ```
   Use lucid_get_user_profile
   ```

## Step 5: Create Your First Process Map

Now you're ready to create diagrams!

**Simple Example:**
```
Use lucid_create_process_map with:
- title: "My First Process"
- steps: ["Start", "Step 1", "Step 2", "End"]
- product: "lucidchart"
```

The tool will:
1. Create a Standard Import JSON document
2. Generate a .lucid file (ZIP with document.json)
3. Upload to Lucid via API
4. Return the document ID and edit URL

**Open Your Diagram:**
- Copy the edit URL from the response
- Open it in your browser
- Your process map will be displayed in Lucidchart!

## Troubleshooting

### Issue: "Not authenticated" Error

**Solution**: Complete authentication first
```
1. Use lucid_get_auth_url
2. Visit the URL and authorize
3. Use lucid_exchange_code with the code
```

### Issue: "Invalid client credentials" Error

**Possible causes:**
- Client ID or Secret is incorrect
- Credentials don't match your Lucid OAuth2 app
- Environment variables not set correctly

**Solution:**
1. Verify credentials in Lucid Developer Portal
2. Check `.env` file or MCP config
3. Restart MCP server after changes

### Issue: "Insufficient permissions" Error

**Possible causes:**
- Access token expired
- Missing required OAuth2 scopes

**Solution:**
1. Re-authenticate with `lucid_get_auth_url`
2. Ensure all required scopes are requested
3. Check OAuth2 app configuration

### Issue: "Import failed" Error

**Possible causes:**
- Invalid JSON structure
- File size exceeds limits
- Network connectivity issues

**Solution:**
1. Validate JSON structure matches Standard Import format
2. Check file size (document.json < 2MB)
3. Test with a simple example first
4. Check network access to api.lucid.co

### Issue: Server Not Found in MCP Client

**Solution:**
1. Verify absolute path to `build/index.js` in config
2. Check that build completed successfully (`npm run build`)
3. Ensure Node.js is in your PATH
4. Restart MCP client completely
5. Check client logs for error messages

## Advanced Configuration

### Using Multiple Lucid Accounts

Create separate MCP server entries with different credentials:

```json
{
  "mcpServers": {
    "lucid-import-work": {
      "command": "node",
      "args": ["/path/to/lucid-import2-mcp/build/index.js"],
      "env": {
        "LUCID_CLIENT_ID": "work_client_id",
        "LUCID_CLIENT_SECRET": "work_client_secret",
        "LUCID_REDIRECT_URI": "http://localhost:3000/callback"
      }
    },
    "lucid-import-personal": {
      "command": "node",
      "args": ["/path/to/lucid-import2-mcp/build/index.js"],
      "env": {
        "LUCID_CLIENT_ID": "personal_client_id",
        "LUCID_CLIENT_SECRET": "personal_client_secret",
        "LUCID_REDIRECT_URI": "http://localhost:3001/callback"
      }
    }
  }
}
```

### Pre-configuring Access Tokens

For automated environments, set tokens directly:

```json
{
  "env": {
    "LUCID_CLIENT_ID": "client_id",
    "LUCID_CLIENT_SECRET": "client_secret",
    "LUCID_REDIRECT_URI": "http://localhost:3000/callback",
    "LUCID_ACCESS_TOKEN": "your_long_lived_token",
    "LUCID_REFRESH_TOKEN": "your_refresh_token"
  }
}
```

**Note**: Access tokens expire. Use refresh tokens for long-term automation.

### Custom Redirect URI

If you want to handle OAuth callbacks yourself:

1. **Set up a web server** on your chosen port
2. **Configure the redirect URI** in both:
   - Lucid OAuth2 app settings
   - MCP server environment variables
3. **Handle the callback** to extract the authorization code
4. **Use lucid_exchange_code** with the extracted code

Example with port 8080:
```bash
LUCID_REDIRECT_URI=http://localhost:8080/auth/lucid/callback
```

## Security Best Practices

1. **Never commit credentials** to version control
   - Add `.env` to `.gitignore` (already included)
   - Use environment variables or secure vaults

2. **Rotate secrets regularly**
   - Generate new client secrets periodically
   - Revoke old tokens when no longer needed

3. **Use separate apps** for development and production
   - Different OAuth2 apps for different environments
   - Never use production credentials in development

4. **Restrict redirect URIs**
   - Only add URIs you actually use
   - Avoid wildcards or broad patterns

5. **Monitor API usage**
   - Check Lucid Developer Portal for usage stats
   - Set up alerts for unusual activity

## Next Steps

- Read [README.md](README.md) for complete API documentation
- Check [examples.md](examples.md) for usage examples
- Explore the [Lucid API documentation](https://lucid.readme.io/reference/overview)
- Try building complex diagrams with custom JSON

## Getting Help

- **Lucid API Issues**: Contact Lucid support or check their documentation
- **MCP Server Issues**: Check server logs and validate configuration
- **OAuth2 Issues**: Review Lucid OAuth2 documentation
- **General Questions**: Refer to the README and examples

## Verification Checklist

Before using the server, verify:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Project built successfully (`npm run build`)
- [ ] `.env` file created with valid credentials
- [ ] MCP client config updated with correct paths
- [ ] MCP client restarted
- [ ] OAuth2 app created in Lucid Developer Portal
- [ ] Redirect URI matches in all locations
- [ ] All required scopes selected in OAuth2 app
- [ ] Authentication completed successfully
- [ ] Test diagram created successfully

## Support Resources

- [Lucid Developer Portal](https://lucid.app/developers)
- [Lucid REST API Docs](https://lucid.readme.io/reference/overview)
- [MCP Documentation](https://modelcontextprotocol.io)
- [OAuth 2.0 Specification](https://oauth.net/2/)

Happy diagramming!
