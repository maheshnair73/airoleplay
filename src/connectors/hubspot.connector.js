import { OAuth2Connector } from './base.connector.js';

export class HubSpotConnector extends OAuth2Connector {
  constructor() {
    super({
      name: 'hubspot',
      displayName: 'HubSpot',
      type: 'crm',
      authType: 'oauth2',
      authorizeUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      refreshUrl: 'https://api.hubapi.com/oauth/v1/token',
      baseUrl: 'https://api.hubapi.com',
      scopes: [
        'crm.objects.contacts.read',
        'crm.objects.contacts.write',
        'crm.objects.deals.read',
        'crm.objects.deals.write',
        'crm.objects.companies.read',
        'crm.objects.companies.write',
      ],
    });
  }

  async testConnection(credentials) {
    return await this.makeRequest('/crm/v3/objects/contacts?limit=1', 'GET', null, credentials);
  }

  async execute(action, params, credentials) {
    switch (action) {
      case 'create_contact':
        return await this.createContact(params, credentials);

      case 'update_contact':
        return await this.updateContact(params, credentials);

      case 'create_deal':
        return await this.createDeal(params, credentials);

      case 'create_company':
        return await this.createCompany(params, credentials);

      case 'search_contacts':
        return await this.searchContacts(params, credentials);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async createContact(data, credentials) {
    return await this.makeRequest(
      '/crm/v3/objects/contacts',
      'POST',
      { properties: data },
      credentials
    );
  }

  async updateContact(data, credentials) {
    const { id, ...properties } = data;
    return await this.makeRequest(
      `/crm/v3/objects/contacts/${id}`,
      'PATCH',
      { properties },
      credentials
    );
  }

  async createDeal(data, credentials) {
    return await this.makeRequest(
      '/crm/v3/objects/deals',
      'POST',
      { properties: data },
      credentials
    );
  }

  async createCompany(data, credentials) {
    return await this.makeRequest(
      '/crm/v3/objects/companies',
      'POST',
      { properties: data },
      credentials
    );
  }

  async searchContacts(params, credentials) {
    return await this.makeRequest(
      '/crm/v3/objects/contacts/search',
      'POST',
      params,
      credentials
    );
  }

  async handleWebhook(payload) {
    return {
      event: payload.subscriptionType,
      objectId: payload.objectId,
      objectType: payload.objectType,
      data: payload,
      timestamp: new Date(payload.occurredAt).toISOString(),
    };
  }
}
