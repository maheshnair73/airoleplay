import { OAuth2Connector } from './base.connector.js';

export class SalesforceConnector extends OAuth2Connector {
  constructor() {
    super({
      name: 'salesforce',
      displayName: 'Salesforce',
      type: 'crm',
      authType: 'oauth2',
      authorizeUrl: 'https://login.salesforce.com/services/oauth2/authorize',
      tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
      refreshUrl: 'https://login.salesforce.com/services/oauth2/token',
      baseUrl: '',
      scopes: ['full', 'refresh_token', 'api'],
      additionalAuthParams: {
        response_type: 'code',
        prompt: 'login',
      },
    });
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
      throw new Error(`Salesforce token exchange failed: ${error}`);
    }

    const data = await response.json();

    this.baseUrl = data.instance_url;

    return {
      ...data,
      instance_url: data.instance_url,
      id: data.id,
    };
  }

  async testConnection(credentials) {
    const url = `${credentials.instanceUrl}/services/data/v58.0/sobjects`;
    return await this.makeRequest('/services/data/v58.0/sobjects', 'GET', null, {
      accessToken: credentials.accessToken,
      instanceUrl: credentials.instanceUrl,
    });
  }

  async makeRequest(endpoint, method = 'GET', data = null, credentials = {}) {
    const baseUrl = credentials.instanceUrl || this.baseUrl;
    const url = `${baseUrl}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.accessToken}`,
    };

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
      throw new Error(`Salesforce API error (${response.status}): ${error}`);
    }

    if (response.status === 204) {
      return { success: true };
    }

    return await response.json();
  }

  async execute(action, params, credentials) {
    const { instanceUrl } = credentials;

    switch (action) {
      case 'create_lead':
        return await this.createLead(params, credentials);

      case 'update_lead':
        return await this.updateLead(params, credentials);

      case 'create_contact':
        return await this.createContact(params, credentials);

      case 'create_opportunity':
        return await this.createOpportunity(params, credentials);

      case 'query':
        return await this.query(params.soql, credentials);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async createLead(data, credentials) {
    return await this.makeRequest(
      '/services/data/v58.0/sobjects/Lead',
      'POST',
      data,
      credentials
    );
  }

  async updateLead(data, credentials) {
    const { id, ...updates } = data;
    return await this.makeRequest(
      `/services/data/v58.0/sobjects/Lead/${id}`,
      'PATCH',
      updates,
      credentials
    );
  }

  async createContact(data, credentials) {
    return await this.makeRequest(
      '/services/data/v58.0/sobjects/Contact',
      'POST',
      data,
      credentials
    );
  }

  async createOpportunity(data, credentials) {
    return await this.makeRequest(
      '/services/data/v58.0/sobjects/Opportunity',
      'POST',
      data,
      credentials
    );
  }

  async query(soql, credentials) {
    const encodedQuery = encodeURIComponent(soql);
    return await this.makeRequest(
      `/services/data/v58.0/query?q=${encodedQuery}`,
      'GET',
      null,
      credentials
    );
  }

  async handleWebhook(payload) {
    return {
      event: payload.event || 'unknown',
      data: payload.sobject || payload,
      timestamp: new Date().toISOString(),
    };
  }
}
