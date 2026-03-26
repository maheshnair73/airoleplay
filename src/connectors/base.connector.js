export class BaseConnector {
  constructor(config) {
    this.name = config.name;
    this.displayName = config.displayName;
    this.type = config.type;
    this.authType = config.authType;
    this.baseUrl = config.baseUrl;
    this.config = config;
  }

  async authorize(params) {
    throw new Error('authorize() must be implemented by connector');
  }

  async refreshToken(refreshToken) {
    throw new Error('refreshToken() must be implemented by connector');
  }

  async getTriggers() {
    return this.config.triggers || [];
  }

  async getActions() {
    return this.config.actions || [];
  }

  async execute(action, params, credentials) {
    throw new Error('execute() must be implemented by connector');
  }

  async testConnection(credentials) {
    throw new Error('testConnection() must be implemented by connector');
  }

  async handleWebhook(payload) {
    throw new Error('handleWebhook() must be implemented by connector');
  }

  buildAuthUrl(clientId, redirectUri, state, scopes) {
    const url = new URL(this.config.authorizeUrl);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    url.searchParams.set('response_type', 'code');

    if (scopes && scopes.length > 0) {
      url.searchParams.set('scope', scopes.join(' '));
    }

    if (this.config.additionalAuthParams) {
      Object.entries(this.config.additionalAuthParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return url.toString();
  }

  async exchangeCodeForToken(code, clientId, clientSecret, redirectUri) {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    return await response.json();
  }

  async refreshAccessToken(refreshToken, clientId, clientSecret) {
    if (!this.config.refreshUrl) {
      throw new Error('Refresh URL not configured for this connector');
    }

    const response = await fetch(this.config.refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    return await response.json();
  }

  async makeRequest(endpoint, method = 'GET', data = null, credentials = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
    };

    if (credentials.accessToken) {
      headers['Authorization'] = `${credentials.tokenType || 'Bearer'} ${credentials.accessToken}`;
    } else if (credentials.apiKey) {
      headers['Authorization'] = `Bearer ${credentials.apiKey}`;
    }

    const options = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed (${response.status}): ${error}`);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  validateCredentials(credentials) {
    if (this.authType === 'oauth2') {
      if (!credentials.accessToken) {
        throw new Error('Access token is required');
      }
    } else if (this.authType === 'api_key') {
      if (!credentials.apiKey) {
        throw new Error('API key is required');
      }
    } else if (this.authType === 'bearer') {
      if (!credentials.token) {
        throw new Error('Bearer token is required');
      }
    }
  }

  mapFields(data, mapping) {
    const result = {};

    Object.entries(mapping).forEach(([targetField, sourceField]) => {
      const value = this.getNestedValue(data, sourceField);
      if (value !== undefined) {
        this.setNestedValue(result, targetField, value);
      }
    });

    return result;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }
}

export class OAuth2Connector extends BaseConnector {
  constructor(config) {
    super(config);
    if (this.authType !== 'oauth2') {
      throw new Error('OAuth2Connector requires authType to be oauth2');
    }
  }

  async authorize(params) {
    const { clientId, redirectUri, state, scopes } = params;
    return this.buildAuthUrl(clientId, redirectUri, state, scopes);
  }

  async refreshToken(refreshToken, clientId, clientSecret) {
    return await this.refreshAccessToken(refreshToken, clientId, clientSecret);
  }
}

export class ApiKeyConnector extends BaseConnector {
  constructor(config) {
    super(config);
    if (this.authType !== 'api_key' && this.authType !== 'bearer') {
      throw new Error('ApiKeyConnector requires authType to be api_key or bearer');
    }
  }

  async authorize(params) {
    return { success: true, message: 'API key authentication does not require OAuth flow' };
  }

  async refreshToken() {
    throw new Error('API key authentication does not support token refresh');
  }

  async testConnection(credentials) {
    return await this.makeRequest('/api/v1/user', 'GET', null, credentials);
  }
}
