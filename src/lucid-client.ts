import archiver from 'archiver';
import { Readable } from 'stream';
import {
  DocumentDefinition,
  CreateDocumentResponse,
  ImportDocumentParams,
} from './types.js';

const LUCID_API_BASE = 'https://api.lucid.co';

export class LucidApiClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Update the access token
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Create a .lucid file (ZIP archive) from a document definition
   */
  private async createLucidFile(document: DocumentDefinition): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      archive.on('data', (chunk: Buffer) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      // Add document.json to the archive
      const documentJson = JSON.stringify(document, null, 2);
      archive.append(documentJson, { name: 'document.json' });

      archive.finalize();
    });
  }

  /**
   * Import a document using Standard Import
   */
  async importDocument(params: ImportDocumentParams): Promise<CreateDocumentResponse> {
    // Create the .lucid file
    const lucidFile = await this.createLucidFile(params.document);

    // Create form data
    const formData = new FormData();
    // Convert Buffer to Uint8Array which is compatible with Blob
    const uint8Array = new Uint8Array(lucidFile);
    const blob = new Blob([uint8Array], { type: 'application/zip' });
    formData.append('file', blob, `${params.title}.lucid`);
    formData.append('type', 'standard');
    formData.append('product', params.product);
    formData.append('title', params.title);

    if (params.parentFolderId) {
      formData.append('parent', params.parentFolderId.toString());
    }

    // Make the API request
    const response = await fetch(`${LUCID_API_BASE}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Lucid-Api-Version': '1',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Lucid API Error (Import Document): ${response.status} ${errorBody}`);
      throw new Error(`Failed to import document: ${response.status}. Please check server logs for details.`);
    }

    const result = await response.json();
    return {
      documentId: result.id,
      title: result.title,
      product: result.product,
      editUrl: result.editUrl || `https://lucid.app/documents/${result.id}/edit`,
    };
  }

  /**
   * Create an empty document
   */
  async createEmptyDocument(params: {
    title: string;
    product: 'lucidchart' | 'lucidspark';
    parentFolderId?: number;
  }): Promise<CreateDocumentResponse> {
    const body: Record<string, unknown> = {
      title: params.title,
      product: params.product,
    };

    if (params.parentFolderId) {
      body.parent = params.parentFolderId;
    }

    const response = await fetch(`${LUCID_API_BASE}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Lucid-Api-Version': '1',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Lucid API Error (Create Document): ${response.status} ${errorBody}`);
      throw new Error(`Failed to create document: ${response.status}. Please check server logs for details.`);
    }

    const result = await response.json();
    return {
      documentId: result.id,
      title: result.title,
      product: result.product,
      editUrl: result.editUrl || `https://lucid.app/documents/${result.id}/edit`,
    };
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<{ id: string; name: string; email: string }> {
    const response = await fetch(`${LUCID_API_BASE}/users/me/profile`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Lucid-Api-Version': '1',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Lucid API Error (Get Profile): ${response.status} ${errorBody}`);
      throw new Error(`Failed to get user profile: ${response.status}. Please check server logs for details.`);
    }

    const result = await response.json();
    return {
      id: result.id,
      name: result.name,
      email: result.email,
    };
  }
}
