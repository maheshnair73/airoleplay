import { ApiKeyConnector } from './base.connector.js';

export class MoodleConnector extends ApiKeyConnector {
  constructor() {
    super({
      name: 'moodle',
      displayName: 'Moodle',
      type: 'lms',
      authType: 'api_key',
      baseUrl: '',
      scopes: [],
    });
  }

  setInstanceUrl(url) {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }

  async makeRequest(endpoint, method = 'GET', data = null, credentials = {}) {
    const instanceUrl = credentials.instanceUrl || this.baseUrl;

    if (!instanceUrl) {
      throw new Error('Moodle instance URL is required');
    }

    const url = new URL(`${instanceUrl}/webservice/rest/server.php`);
    url.searchParams.set('wstoken', credentials.apiKey);
    url.searchParams.set('moodlewsrestformat', 'json');

    if (data && data.wsfunction) {
      url.searchParams.set('wsfunction', data.wsfunction);
      delete data.wsfunction;

      Object.entries(data).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const options = {
      method,
    };

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Moodle API error (${response.status}): ${error}`);
    }

    const result = await response.json();

    if (result.exception) {
      throw new Error(`Moodle error: ${result.message}`);
    }

    return result;
  }

  async testConnection(credentials) {
    return await this.makeRequest(
      '',
      'GET',
      { wsfunction: 'core_webservice_get_site_info' },
      credentials
    );
  }

  async execute(action, params, credentials) {
    switch (action) {
      case 'create_user':
        return await this.createUser(params, credentials);

      case 'enroll_user':
        return await this.enrollUser(params, credentials);

      case 'create_course':
        return await this.createCourse(params, credentials);

      case 'get_user':
        return await this.getUser(params, credentials);

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async createUser(data, credentials) {
    return await this.makeRequest(
      '',
      'POST',
      {
        wsfunction: 'core_user_create_users',
        'users[0][username]': data.username,
        'users[0][password]': data.password,
        'users[0][firstname]': data.firstname,
        'users[0][lastname]': data.lastname,
        'users[0][email]': data.email,
      },
      credentials
    );
  }

  async enrollUser(data, credentials) {
    return await this.makeRequest(
      '',
      'POST',
      {
        wsfunction: 'enrol_manual_enrol_users',
        'enrolments[0][roleid]': data.roleid || 5,
        'enrolments[0][userid]': data.userid,
        'enrolments[0][courseid]': data.courseid,
      },
      credentials
    );
  }

  async createCourse(data, credentials) {
    return await this.makeRequest(
      '',
      'POST',
      {
        wsfunction: 'core_course_create_courses',
        'courses[0][fullname]': data.fullname,
        'courses[0][shortname]': data.shortname,
        'courses[0][categoryid]': data.categoryid || 1,
      },
      credentials
    );
  }

  async getUser(data, credentials) {
    return await this.makeRequest(
      '',
      'GET',
      {
        wsfunction: 'core_user_get_users',
        'criteria[0][key]': 'email',
        'criteria[0][value]': data.email,
      },
      credentials
    );
  }

  async handleWebhook(payload) {
    return {
      event: payload.eventname,
      userid: payload.userid,
      courseid: payload.courseid,
      data: payload,
      timestamp: new Date(payload.timecreated * 1000).toISOString(),
    };
  }
}
