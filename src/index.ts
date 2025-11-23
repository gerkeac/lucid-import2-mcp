#!/usr/bin/env node

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import { AsyncLocalStorage } from 'async_hooks';
import { LucidApiClient } from './lucid-client.js';
import { LucidDocumentBuilder, createSimpleProcessMap } from './builder.js';

// AsyncLocalStorage to store the auth token for the current request context
const authStorage = new AsyncLocalStorage<string>();

// Helper to get the API client for the current request
function getApiClient(): LucidApiClient {
  const token = authStorage.getStore();
  if (!token) {
    throw new Error('Authentication required. No access token found in request context.');
  }
  return new LucidApiClient(token);
}

// Define MCP tools
const tools: Tool[] = [
  {
    name: 'lucid_get_user_profile',
    description: 'Get the authenticated user profile information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'lucid_create_process_map',
    description: 'Create a simple linear process map with steps in Lucidchart',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the process map document',
        },
        steps: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of process steps (first and last will be start/end ovals)',
        },
        product: {
          type: 'string',
          enum: ['lucidchart', 'lucidspark'],
          description: 'Product type (lucidchart or lucidspark)',
          default: 'lucidchart',
        },
        parentFolderId: {
          type: 'number',
          description: 'Optional folder ID to create document in',
        },
      },
      required: ['title', 'steps'],
    },
  },

  {
    name: 'lucid_build_diagram_step_by_step',
    description: 'Build a diagram step-by-step by adding shapes and connectors. Returns JSON that can be imported.',
    inputSchema: {
      type: 'object',
      properties: {
        pageTitle: {
          type: 'string',
          description: 'Title of the page',
        },
        shapes: {
          type: 'array',
          description: 'Array of shapes to add',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['rectangle', 'ellipse', 'diamond', 'process', 'decision', 'start', 'end'],
                description: 'Type of shape',
              },
              x: { type: 'number', description: 'X coordinate' },
              y: { type: 'number', description: 'Y coordinate' },
              width: { type: 'number', description: 'Width of shape' },
              height: { type: 'number', description: 'Height of shape' },
              text: { type: 'string', description: 'Text content' },
              fillColor: { type: 'string', description: 'Fill color (hex)' },
              strokeColor: { type: 'string', description: 'Stroke color (hex)' },
            },
            required: ['type', 'x', 'y', 'text'],
          },
        },
        connectors: {
          type: 'array',
          description: 'Array of connectors between shapes (use 0-based indices)',
          items: {
            type: 'object',
            properties: {
              from: { type: 'number', description: 'Index of source shape' },
              to: { type: 'number', description: 'Index of target shape' },
              text: { type: 'string', description: 'Optional label for connector' },
            },
            required: ['from', 'to'],
          },
        },
      },
      required: ['pageTitle', 'shapes'],
    },
  },
  {
    name: 'lucid_import_diagram',
    description: 'Import a diagram JSON into Lucidchart/Lucidspark and create the document',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the document',
        },
        documentJson: {
          type: 'string',
          description: 'JSON string of the document to import',
        },
        product: {
          type: 'string',
          enum: ['lucidchart', 'lucidspark'],
          description: 'Product type',
          default: 'lucidchart',
        },
        parentFolderId: {
          type: 'number',
          description: 'Optional folder ID',
        },
      },
      required: ['title', 'documentJson'],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: 'lucid-import-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools,
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // For tools that don't need authentication (none in this list currently, but good practice)
    if (name === 'lucid_build_diagram_step_by_step') {
      const pageTitle = args?.pageTitle as string;
      const shapes = args?.shapes as any[];
      const connectors = (args?.connectors as any[]) || [];

      if (!Array.isArray(shapes)) {
        throw new Error('Shapes must be an array');
      }

      // Validate shapes structure
      for (const [index, shape] of shapes.entries()) {
        if (!shape.type || typeof shape.x !== 'number' || typeof shape.y !== 'number') {
          throw new Error(`Invalid shape at index ${index}: missing required properties (type, x, y)`);
        }
      }

      const builder = new LucidDocumentBuilder();
      builder.addPage(pageTitle);

      const shapeIds: string[] = [];

      // Add all shapes
      for (const shape of shapes) {
        let shapeId: string;

        if (shape.type === 'process' || shape.type === 'rectangle') {
          shapeId = builder.addProcessBox({
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            text: shape.text,
            fillColor: shape.fillColor,
            strokeColor: shape.strokeColor,
          });
        } else if (shape.type === 'decision' || shape.type === 'diamond') {
          shapeId = builder.addDecisionDiamond({
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            text: shape.text,
            fillColor: shape.fillColor,
            strokeColor: shape.strokeColor,
          });
        } else if (shape.type === 'start' || shape.type === 'end' || shape.type === 'ellipse') {
          shapeId = builder.addStartEnd({
            x: shape.x,
            y: shape.y,
            width: shape.width,
            height: shape.height,
            text: shape.text,
            fillColor: shape.fillColor,
            strokeColor: shape.strokeColor,
          });
        } else {
          shapeId = builder.addShape({
            shapeType: shape.type,
            x: shape.x,
            y: shape.y,
            width: shape.width || 100,
            height: shape.height || 60,
            text: shape.text,
          });
        }

        shapeIds.push(shapeId);
      }

      // Add connectors
      for (const connector of connectors) {
        builder.addConnector({
          fromShapeId: shapeIds[connector.from],
          toShapeId: shapeIds[connector.to],
          text: connector.text,
        });
      }

      const document = builder.build();
      const documentJson = JSON.stringify(document, null, 2);

      return {
        content: [
          {
            type: 'text',
            text: `Diagram built successfully!\n\nUse the lucid_import_diagram tool with this JSON to create the document:\n\n${documentJson}`,
          },
        ],
      };
    }

    // Tools requiring authentication
    const apiClient = getApiClient();

    switch (name) {
      case 'lucid_get_user_profile': {
        const profile = await apiClient.getUserProfile();
        return {
          content: [
            {
              type: 'text',
              text: `User Profile:\n\nID: ${profile.id}\nName: ${profile.name}\nEmail: ${profile.email}`,
            },
          ],
        };
      }

      case 'lucid_create_process_map': {
        const title = args?.title as string;
        const steps = args?.steps as string[];
        const product = (args?.product as 'lucidchart' | 'lucidspark') || 'lucidchart';
        const parentFolderId = args?.parentFolderId as number | undefined;

        const document = createSimpleProcessMap({ title, steps });
        const result = await apiClient.importDocument({
          title,
          product,
          document,
          parentFolderId,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Process map created successfully!\n\nDocument ID: ${result.documentId}\nTitle: ${result.title}\nProduct: ${result.product}\n\nEdit URL: ${result.editUrl}`,
            },
          ],
        };
      }



      case 'lucid_import_diagram': {
        const title = args?.title as string;
        const documentJson = args?.documentJson as string;
        const product = (args?.product as 'lucidchart' | 'lucidspark') || 'lucidchart';
        const parentFolderId = args?.parentFolderId as number | undefined;

        let document;
        try {
          document = JSON.parse(documentJson);
        } catch (e) {
          throw new Error('Invalid documentJson: Failed to parse JSON');
        }

        if (!document.version || !Array.isArray(document.pages)) {
          throw new Error('Invalid document structure: Missing version or pages array');
        }

        const result = await apiClient.importDocument({
          title,
          product,
          document,
          parentFolderId,
        });

        return {
          content: [
            {
              type: 'text',
              text: `Diagram imported successfully!\n\nDocument ID: ${result.documentId}\nTitle: ${result.title}\nProduct: ${result.product}\n\nEdit URL: ${result.editUrl}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Initialize Express app
const app = express();
app.disable('x-powered-by');
app.use(cors());

// OAuth Proxy Endpoint
// Translates LibreChat's client_secret_basic (header) to Lucid's client_secret_post (body)
// Body parsing is applied ONLY to this endpoint to avoid consuming the SSE stream
app.post('/oauth/token',
  express.json(),
  express.urlencoded({ extended: true }),
  async (req, res) => {
    try {
      // Extract Authorization header
      const authHeader = req.headers['authorization'];

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        console.error('[OAuth Proxy] Missing or invalid Authorization header');
        return res.status(401).json({ error: 'invalid_client', error_description: 'Missing client credentials' });
      }

      // Decode Base64 credentials
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [clientId, clientSecret] = credentials.split(':');

      if (!clientId || !clientSecret) {
        console.error('[OAuth Proxy] Invalid credentials format');
        return res.status(401).json({ error: 'invalid_client', error_description: 'Invalid client credentials' });
      }

      console.log('[OAuth Proxy] Forwarding token request to Lucid API');

      // Forward to Lucid with credentials in body
      const lucidResponse = await fetch('https://api.lucid.co/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: req.body.grant_type || 'authorization_code',
          code: req.body.code || '',
          redirect_uri: req.body.redirect_uri || '',
          client_id: clientId,
          client_secret: clientSecret,
          ...(req.body.refresh_token && { refresh_token: req.body.refresh_token }),
        }),
      });

      const responseText = await lucidResponse.text();

      // Forward Lucid's response status and body
      res.status(lucidResponse.status);

      // Try to parse as JSON, otherwise send as text
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('[OAuth Proxy] Token exchange successful');
        res.json(jsonResponse);
      } catch {
        console.error('[OAuth Proxy] Token exchange failed:', lucidResponse.status);
        res.send(responseText);
      }
    } catch (error) {
      console.error('[OAuth Proxy] Error during token exchange:', error instanceof Error ? error.message : 'Unknown error');
      res.status(500).json({ error: 'server_error', error_description: 'Internal server error during token exchange' });
    }
  });

// Set up SSE transport
let transport: SSEServerTransport;

app.get('/sse', async (req, res) => {
  console.log('New SSE connection established');
  transport = new SSEServerTransport('/sse', res);
  await server.connect(transport);
});

app.post('/sse', async (req, res) => {
  if (!transport) {
    res.status(400).send('No active SSE connection');
    return;
  }

  // Extract Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).send('Missing Authorization Token');
    return;
  }

  const token = authHeader.split(' ')[1];

  // Run the request handler within the AsyncLocalStorage context
  await authStorage.run(token, async () => {
    await transport.handlePostMessage(req, res);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lucid Import MCP Server running on port ${PORT}`);
  console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
});
