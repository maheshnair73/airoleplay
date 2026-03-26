import { OAuth2Connector } from './base.connector.js';

export class GoogleConnector extends OAuth2Connector {
  constructor() {
    super({
      name: 'google',
      displayName: 'Google',
      type: 'auth',
      authType: 'oauth2',
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      refreshUrl: 'https://oauth2.googleapis.com/token',
      baseUrl: 'https://www.googleapis.com',
      scopes: [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/drive.file',
      ],
      additionalAuthParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    });
  }

  async testConnection(credentials) {
    return await this.makeRequest('/oauth2/v2/userinfo', 'GET', null, credentials);
  }

  async execute(action, params, credentials) {
    switch (action) {
      case 'send_email':
        return await this.sendEmail(params, credentials);

      case 'create_event':
        return await this.createCalendarEvent(params, credentials);

      case 'upload_file':
        return await this.uploadFile(params, credentials);

      case 'list_events':
        return await this.listCalendarEvents(params, credentials);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async sendEmail(data, credentials) {
    const { to, subject, body } = data;

    const email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body,
    ].join('\n');

    const encodedEmail = btoa(email)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return await this.makeRequest(
      '/gmail/v1/users/me/messages/send',
      'POST',
      { raw: encodedEmail },
      credentials
    );
  }

  async createCalendarEvent(data, credentials) {
    return await this.makeRequest(
      '/calendar/v3/calendars/primary/events',
      'POST',
      data,
      credentials
    );
  }

  async listCalendarEvents(params, credentials) {
    const queryParams = new URLSearchParams(params).toString();
    return await this.makeRequest(
      `/calendar/v3/calendars/primary/events?${queryParams}`,
      'GET',
      null,
      credentials
    );
  }

  async uploadFile(data, credentials) {
    const { name, mimeType, content } = data;

    const metadata = {
      name,
      mimeType,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', content);

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
      },
      body: form,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Drive upload failed: ${error}`);
    }

    return await response.json();
  }

  async handleWebhook(payload) {
    return {
      event: payload.kind,
      resourceId: payload.resourceId,
      resourceUri: payload.resourceUri,
      data: payload,
      timestamp: new Date().toISOString(),
    };
  }
}
