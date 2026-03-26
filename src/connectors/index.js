import { SalesforceConnector } from './salesforce.connector.js';
import { HubSpotConnector } from './hubspot.connector.js';
import { GoogleConnector } from './google.connector.js';
import { MoodleConnector } from './moodle.connector.js';

export const connectorRegistry = {
  salesforce: SalesforceConnector,
  hubspot: HubSpotConnector,
  google: GoogleConnector,
  google_classroom: GoogleConnector,
  moodle: MoodleConnector,
};

export function getConnector(connectorName) {
  const ConnectorClass = connectorRegistry[connectorName];

  if (!ConnectorClass) {
    throw new Error(`Connector not found: ${connectorName}`);
  }

  return new ConnectorClass();
}

export function listAvailableConnectors() {
  return Object.keys(connectorRegistry);
}

export { SalesforceConnector, HubSpotConnector, GoogleConnector, MoodleConnector };
