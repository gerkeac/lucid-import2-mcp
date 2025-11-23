import { LucidConfig, OAuthTokenResponse } from './types.js';

const LUCID_AUTH_URL = 'https://lucid.app/oauth2/authorize';
const LUCID_TOKEN_URL = 'https://api.lucid.co/oauth2/token';

export class LucidOAuthClient {
  private config: LucidConfig;

  constructor(config: LucidConfig) {
    this.config = config;
  }

  /**
   * Generate the OAuth2 authorization URL for users to authenticate
   */
  getAuthorizationUrl(state?: string): string {
    const scopes = [
      'lucidchart.document.content',
      'lucidchart.document.app.folder',
      'lucidspark.document.content',
      'lucidspark.document.app.folder',
      'user.profile'
    ];

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
    });

    if (state) {
      params.append('state', state);
    }

    return `${LUCID_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<OAuthTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    });

    const response = await fetch(LUCID_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const tokenData = await response.json() as OAuthTokenResponse;
    this.config.accessToken = tokenData.access_token;
    this.config.refreshToken = tokenData.refresh_token;

    return tokenData;
  }

  /**
   * Refresh the access token using the refresh token
   */
  async refreshAccessToken(): Promise<OAuthTokenResponse> {
    if (!this.config.refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.config.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    const response = await fetch(LUCID_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const tokenData = await response.json() as OAuthTokenResponse;
    this.config.accessToken = tokenData.access_token;
    if (tokenData.refresh_token) {
      this.config.refreshToken = tokenData.refresh_token;
    }

    return tokenData;
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | undefined {
    return this.config.accessToken;
  }

  /**
   * Set the access token manually
   */
  setAccessToken(token: string): void {
    this.config.accessToken = token;
  }

  /**
   * Check if the client has a valid access token
   */
  hasAccessToken(): boolean {
    return !!this.config.accessToken;
  }
}
