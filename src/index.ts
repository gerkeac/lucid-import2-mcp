#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { LucidOAuthClient } from './oauth.js';
import { LucidApiClient } from './lucid-client.js';
import { LucidDocumentBuilder, createSimpleProcessMap } from './builder.js';
import { LucidConfig } from './types.js';

// Configuration from environment variables
const config: LucidConfig = {
  clientId: process.env.LUCID_CLIENT_ID || '',
  clientSecret: process.env.LUCID_CLIENT_SECRET || '',
  redirectUri: process.env.LUCID_REDIRECT_URI || 'http://localhost:3000/callback',
  accessToken: process.env.LUCID_ACCESS_TOKEN,
  refreshToken: process.env.LUCID_REFRESH_TOKEN,
};

const oauthClient = new LucidOAuthClient(config);
let apiClient: LucidApiClient | null = null;

// Initialize API client if we have a token
if (config.accessToken) {
  apiClient = new LucidApiClient(config.accessToken);
}

// Define MCP tools
const tools: Tool[] = [
  {
    name: 'lucid_get_auth_url',
    description: 'Generate OAuth2 authorization URL for user authentication. Users must visit this URL to authorize the application.',
    inputSchema: {
      type: 'object',
      properties: {
        state: {
          type: 'string',
          description: 'Optional state parameter for CSRF protection',
        },
      },
    },
  },
  {
    name: 'lucid_exchange_code',
    description: 'Exchange OAuth2 authorization code for access token after user authorizes the application',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Authorization code from OAuth callback',
        },
      },
      required: ['code'],
    },
  },
  {
    name: 'lucid_set_token',
    description: 'Manually set the access token for API requests',
    inputSchema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Access token to use for API requests',
        },
      },
      required: ['token'],
    },
  },
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
    name: 'lucid_create_custom_diagram',
    description: 'Create a custom diagram using a detailed JSON specification following Lucid Standard Import format',
    inputSchema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the diagram document',
        },
        documentJson: {
          type: 'string',
          description: 'JSON string containing the complete document definition with pages, shapes, and lines',
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
      required: ['title', 'documentJson'],
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
    switch (name) {
      case 'lucid_get_auth_url': {
        const url = oauthClient.getAuthorizationUrl(args?.state as string | undefined);
        return {
          content: [
            {
              type: 'text',
              text: `Please visit this URL to authorize the application:\n\n${url}\n\nAfter authorization, you'll receive a code that you can exchange for an access token using the lucid_exchange_code tool.`,
            },
          ],
        };
      }

      case 'lucid_exchange_code': {
        const code = args?.code as string;
        const tokenResponse = await oauthClient.exchangeCodeForToken(code);
        apiClient = new LucidApiClient(tokenResponse.access_token);
        return {
          content: [
            {
              type: 'text',
              text: `Successfully authenticated! Access token obtained.\n\nToken expires in: ${tokenResponse.expires_in} seconds\n\nYou can now use other tools to create diagrams.`,
            },
          ],
        };
      }

      case 'lucid_set_token': {
        const token = args?.token as string;
        oauthClient.setAccessToken(token);
        apiClient = new LucidApiClient(token);
        return {
          content: [
            {
              type: 'text',
              text: 'Access token set successfully. You can now use other tools to create diagrams.',
            },
          ],
        };
      }

      case 'lucid_get_user_profile': {
        if (!apiClient) {
          throw new Error('Not authenticated. Please set an access token first.');
        }
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
        if (!apiClient) {
          throw new Error('Not authenticated. Please set an access token first.');
        }

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

      case 'lucid_create_custom_diagram': {
        if (!apiClient) {
          throw new Error('Not authenticated. Please set an access token first.');
        }

        const title = args?.title as string;
        const documentJson = args?.documentJson as string;
        const product = (args?.product as 'lucidchart' | 'lucidspark') || 'lucidchart';
        const parentFolderId = args?.parentFolderId as number | undefined;

        const document = JSON.parse(documentJson);
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
              text: `Custom diagram created successfully!\n\nDocument ID: ${result.documentId}\nTitle: ${result.title}\nProduct: ${result.product}\n\nEdit URL: ${result.editUrl}`,
            },
          ],
        };
      }

      case 'lucid_build_diagram_step_by_step': {
        const pageTitle = args?.pageTitle as string;
        const shapes = args?.shapes as any[];
        const connectors = (args?.connectors as any[]) || [];

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

      case 'lucid_import_diagram': {
        if (!apiClient) {
          throw new Error('Not authenticated. Please set an access token first.');
        }

        const title = args?.title as string;
        const documentJson = args?.documentJson as string;
        const product = (args?.product as 'lucidchart' | 'lucidspark') || 'lucidchart';
        const parentFolderId = args?.parentFolderId as number | undefined;

        const document = JSON.parse(documentJson);
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Lucid Import MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
