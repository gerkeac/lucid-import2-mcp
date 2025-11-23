export interface LucidConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

export interface Style {
  fill?: {
    color?: string;
    type?: 'solid' | 'gradient';
  };
  stroke?: {
    color?: string;
    width?: number;
    style?: 'solid' | 'dashed' | 'dotted';
  };
  rounding?: number;
}

export interface TextBlock {
  text: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontSize?: number;
  };
}

export interface ShapeDefinition {
  id: string;
  shapeType: string;
  boundingBox: BoundingBox;
  text?: string | TextBlock[];
  style?: Style;
  customData?: Record<string, unknown>;
}

export interface LineDefinition {
  id: string;
  endpoint1: {
    x: number;
    y: number;
    shapeId?: string;
    position?: string;
  };
  endpoint2: {
    x: number;
    y: number;
    shapeId?: string;
    position?: string;
  };
  style?: Style;
  text?: string;
}

export interface PageDefinition {
  id: string;
  title: string;
  shapes: ShapeDefinition[];
  lines: LineDefinition[];
}

export interface DocumentDefinition {
  version: string;
  pages: PageDefinition[];
}

export interface ImportDocumentParams {
  title: string;
  product: 'lucidchart' | 'lucidspark';
  document: DocumentDefinition;
  parentFolderId?: number;
}

export interface CreateDocumentResponse {
  documentId: string;
  title: string;
  product: string;
  editUrl: string;
}
