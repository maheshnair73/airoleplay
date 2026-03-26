# Integration Platform - Complete Guide

## Overview

A production-ready SaaS integration platform similar to Zapier, enabling users to connect external services via OAuth2/API keys and create automated workflows between them.

## Architecture

### Core Components

1. **Connector Framework** - Modular SDK for adding new integrations
2. **OAuth2 Engine** - Universal authorization flow handler
3. **Webhook Processor** - Event queue and processing system
4. **Flow Executor** - Workflow automation engine
5. **Admin UI** - Connector management and flow builder

---

## Database Schema

### Tables Created

#### `connectors`
Master list of available integrations (Salesforce, HubSpot, etc.)

**Fields:**
- `id` - UUID primary key
- `name` - Unique connector identifier (e.g., 'salesforce')
- `display_name` - User-friendly name
- `type` - Enum: crm, lms, auth, communication, storage, analytics
- `auth_type` - Enum: oauth2, api_key, basic, bearer
- `authorize_url` - OAuth2 authorization endpoint
- `token_url` - OAuth2 token exchange endpoint
- `refresh_url` - Token refresh endpoint
- `scopes` - JSONB array of OAuth scopes
- `base_url` - API base URL
- `supports_webhooks` - Boolean
- `triggers` - JSONB array of available triggers
- `actions` - JSONB array of available actions
- `status` - Enum: active, inactive, beta

#### `connected_accounts`
User connections to external services with encrypted credentials

**Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to auth.users
- `company_id` - Foreign key to companies
- `connector_id` - Foreign key to connectors
- `access_token` - Encrypted OAuth2 access token
- `refresh_token` - Encrypted refresh token
- `token_type` - Usually 'Bearer'
- `expires_at` - Token expiration timestamp
- `scope` - Granted OAuth scopes
- `external_user_id` - User ID in external system
- `external_email` - Email in external system
- `instance_url` - For multi-tenant systems (e.g., Salesforce)
- `status` - Enum: connected, disconnected, error, expired

#### `integration_flows`
Automation workflows (trigger → actions)

**Fields:**
- `id` - UUID primary key
- `user_id` - Flow owner
- `company_id` - Company association
- `name` - Flow name
- `description` - Flow description
- `trigger_connector_id` - Which connector triggers this flow
- `trigger_type` - Which event triggers this flow
- `trigger_config` - JSONB configuration
- `status` - Enum: active, inactive, error, draft
- `execution_count` - Total executions
- `success_count` - Successful executions
- `error_count` - Failed executions
- `last_execution_at` - Last run timestamp

#### `integration_flow_steps`
Individual actions in a flow (drag-and-drop steps)

**Fields:**
- `id` - UUID primary key
- `flow_id` - Parent flow
- `step_order` - Execution order
- `step_type` - Enum: trigger, action, condition, transform
- `connector_id` - Which connector to use
- `connected_account_id` - Which account to use
- `action_type` - Which action to execute
- `action_config` - JSONB action parameters
- `field_mapping` - JSONB field transformations
- `conditions` - JSONB conditional logic
- `on_error` - Enum: stop, continue, retry
- `retry_count` - Max retry attempts

#### `webhook_events`
Queue for incoming webhook events

**Fields:**
- `id` - UUID primary key
- `connector_id` - Source connector
- `event_type` - Event name
- `payload` - JSONB event data
- `status` - Enum: pending, processing, completed, failed, retry
- `retry_count` - Current retry count
- `next_retry_at` - Next retry timestamp

#### `integration_logs`
Execution logs for debugging

**Fields:**
- `id` - UUID primary key
- `flow_id` - Parent flow
- `step_id` - Specific step
- `execution_id` - UUID linking related logs
- `log_level` - Enum: debug, info, warning, error
- `message` - Log message
- `status` - Enum: success, error, warning
- `input_data` - JSONB input
- `output_data` - JSONB output
- `execution_time_ms` - Duration

---

## Connector SDK

### Base Classes

Located in `src/connectors/base.connector.js`:

#### `BaseConnector`
Abstract base class for all connectors

**Methods:**
- `authorize(params)` - Start OAuth flow
- `refreshToken(refreshToken)` - Refresh access token
- `getTriggers()` - Get available triggers
- `getActions()` - Get available actions
- `execute(action, params, credentials)` - Execute an action
- `testConnection(credentials)` - Test credentials
- `handleWebhook(payload)` - Process webhook
- `makeRequest(endpoint, method, data, credentials)` - HTTP helper

#### `OAuth2Connector extends BaseConnector`
For OAuth2-based integrations

**Additional Methods:**
- `buildAuthUrl(clientId, redirectUri, state, scopes)` - Generate auth URL
- `exchangeCodeForToken(code, clientId, clientSecret, redirectUri)` - Exchange code
- `refreshAccessToken(refreshToken, clientId, clientSecret)` - Refresh token

#### `ApiKeyConnector extends BaseConnector`
For API key-based integrations

**Methods:**
- Simplified authorization (no OAuth flow needed)
- Direct credential storage

### Creating a New Connector

```javascript
import { OAuth2Connector } from './base.connector.js';

export class MyServiceConnector extends OAuth2Connector {
  constructor() {
    super({
      name: 'myservice',
      displayName: 'My Service',
      type: 'crm',
      authType: 'oauth2',
      authorizeUrl: 'https://myservice.com/oauth/authorize',
      tokenUrl: 'https://myservice.com/oauth/token',
      refreshUrl: 'https://myservice.com/oauth/token',
      baseUrl: 'https://api.myservice.com',
      scopes: ['read', 'write'],
    });
  }

  async testConnection(credentials) {
    return await this.makeRequest('/api/v1/user', 'GET', null, credentials);
  }

  async execute(action, params, credentials) {
    switch (action) {
      case 'create_contact':
        return await this.createContact(params, credentials);
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }

  async createContact(data, credentials) {
    return await this.makeRequest(
      '/api/v1/contacts',
      'POST',
      data,
      credentials
    );
  }
}
```

---

## Implemented Connectors

### CRM Connectors

#### 1. Salesforce (`salesforce`)
- **Auth:** OAuth2
- **Triggers:** New Lead, Updated Lead, New Opportunity, New Contact
- **Actions:** Create Lead, Update Lead, Create Contact, Create Opportunity
- **Special:** Requires instance URL (multi-tenant)

#### 2. HubSpot (`hubspot`)
- **Auth:** OAuth2
- **Triggers:** New Contact, Updated Contact, New Deal, New Company
- **Actions:** Create Contact, Update Contact, Create Deal, Create Company

#### 3. Zoho CRM (`zoho_crm`)
- **Auth:** OAuth2
- **Triggers:** New Lead, Updated Lead, New Contact, New Deal
- **Actions:** Create Lead, Update Lead, Create Contact, Create Deal

#### 4. Microsoft Dynamics 365 (`microsoft_dynamics`)
- **Auth:** OAuth2
- **Triggers:** New Lead, New Contact, New Opportunity
- **Actions:** Create Lead, Create Contact, Update Contact

### LMS Connectors

#### 5. Moodle (`moodle`)
- **Auth:** API Key
- **Triggers:** New User, Course Completed, New Enrollment
- **Actions:** Create User, Enroll User, Create Course
- **Special:** Requires instance URL

#### 6. TalentLMS (`talentlms`)
- **Auth:** API Key
- **Triggers:** New User, Course Completed, User Enrolled
- **Actions:** Create User, Enroll User, Assign Course

#### 7. LearnWorlds (`learnworlds`)
- **Auth:** API Key
- **Triggers:** New Enrollment, Course Completed, New User
- **Actions:** Create User, Enroll User, Send Email

#### 8. Google Classroom (`google_classroom`)
- **Auth:** OAuth2
- **Triggers:** New Student, Assignment Submitted, New Course
- **Actions:** Create Course, Invite Student, Create Assignment

### Auth/Productivity Connectors

#### 9. Google (`google`)
- **Auth:** OAuth2
- **Triggers:** New Email, New Calendar Event, File Uploaded
- **Actions:** Send Email, Create Calendar Event, Upload File
- **Scopes:** Gmail, Calendar, Drive

#### 10. Microsoft (`microsoft`)
- **Auth:** OAuth2
- **Triggers:** New Email, New Calendar Event, File Uploaded
- **Actions:** Send Email, Create Calendar Event, Upload File
- **Scopes:** Outlook, Calendar, OneDrive

---

## Edge Functions

### 1. `connector-oauth` (Deployed)

Universal OAuth2 authorization handler

**Endpoints:**
- `/authorize?connector={name}&user_id={id}` - Start OAuth flow
- `/callback` - OAuth callback handler
- `/refresh` - Token refresh endpoint

**Features:**
- Supports all OAuth2 connectors
- Handles state management
- Exchanges authorization codes for tokens
- Fetches user profile information
- Posts credentials back to opener window

### 2. `webhook-processor` (Deployed)

Receives and queues webhook events

**Endpoint:**
- `POST /?connector={name}` - Receive webhook

**Features:**
- Validates connector existence
- Extracts event type from payload
- Queues event in `webhook_events` table
- Returns success response immediately

### 3. `flow-executor` (Deployed)

Executes automation flows

**Endpoint:**
- `POST /` - Execute flow
  ```json
  {
    "flow_id": "uuid",
    "trigger_data": { ... }
  }
  ```

**Features:**
- Loads flow and steps from database
- Executes steps in order
- Evaluates conditions
- Applies field mappings
- Handles errors (stop/continue/retry)
- Logs execution details
- Updates flow statistics

### 4. `connector-action` (Deployed)

Executes individual connector actions

**Endpoint:**
- `POST /` - Execute action
  ```json
  {
    "connector_id": "uuid",
    "action_type": "create_lead",
    "params": { ... },
    "credentials": { ... }
  }
  ```

**Features:**
- Dispatches to correct connector implementation
- Handles authentication
- Returns action result

---

## Admin UI Pages

### 1. Integration Platform (`/integrations/platform`)

Main dashboard showing:
- Available connectors by category (CRM, LMS, Auth)
- Connection statistics
- Active flows count
- Total executions
- One-click connect buttons
- Filter by connector type
- Search functionality

**Access:** Admins and Super Admins

### 2. Connector Connect (`/integrations/connect`)

Connection page for individual connectors:
- OAuth2 flow initiation
- API key input
- Connection status
- Available triggers and actions
- Documentation links
- Disconnect option
- Reconnect functionality

**Features:**
- One-click OAuth connection
- Popup-based authorization
- Credential encryption
- Connection testing

### 3. Integration Flows (`/integrations/flows`)

Flow management dashboard:
- List all flows
- Flow status (active/inactive/draft/error)
- Execution statistics
- Success rates
- Last execution time
- Quick actions (edit, test, pause, delete)
- Create new flow button

**Features:**
- Bulk operations
- Status toggling
- Test execution
- Delete confirmation

### 4. Flow Builder (`/integrations/flows/new` and `/integrations/flows/:id/edit`)

Visual flow builder with drag-and-drop:
- Flow name and description
- Trigger configuration (connector + event)
- Step management
- Drag-and-drop reordering
- Step configuration:
  - Connector selection
  - Connected account selection
  - Action selection
  - Field mapping
  - Error handling (stop/continue/retry)
  - Conditions
- Save and test buttons
- Real-time validation

**Features:**
- Drag-and-drop interface using @hello-pangea/dnd
- Step expansion/collapse
- Visual step ordering
- Auto-save capability
- Test execution

---

## Security Features

### 1. Token Encryption

- Uses PostgreSQL `pgcrypto` extension
- All access tokens and refresh tokens encrypted at rest
- Encryption keys stored in environment variables

### 2. OAuth2 Security

- State parameter validation (prevents CSRF)
- PKCE support (where available)
- Secure token storage
- Automatic token refresh

### 3. Row Level Security (RLS)

All tables have RLS enabled with policies:

**Connectors:**
- Anyone can view active connectors
- Only admins can manage connectors

**Connected Accounts:**
- Users can only access their own connections
- Admins can view company connections

**Integration Flows:**
- Users can only manage their own flows
- Admins can view company flows

**Webhook Events:**
- System-level access only

**Integration Logs:**
- Users can view logs for their own flows
- Admins can view all company logs

### 4. Rate Limiting

- Rate limit tracking per connected account
- Configurable limits per connector
- Automatic throttling

### 5. API Key Security

- Never exposed in frontend
- Stored encrypted in database
- Transmitted securely to edge functions
- No logging of credentials

---

## Configuration

### Environment Variables Required

Each connector requires its OAuth credentials:

```bash
# Salesforce
SALESFORCE_CLIENT_ID=your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret

# HubSpot
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret

# Zoho CRM
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret

# Google (for Google Classroom, Gmail, Calendar, Drive)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Microsoft (for Outlook, Teams, OneDrive)
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret

# Microsoft Dynamics
DYNAMICS_CLIENT_ID=your_client_id
DYNAMICS_CLIENT_SECRET=your_client_secret
```

**Note:** API key-based connectors (Moodle, TalentLMS, LearnWorlds) don't require environment variables.

---

## Usage Guide

### For Admins

#### 1. Connect a Service

1. Navigate to **Integration Platform** (`/integrations/platform`)
2. Browse available connectors or filter by type
3. Click **Connect** on desired connector
4. For OAuth2:
   - Click **Connect with [Service]**
   - Authorize in popup window
   - Window closes automatically on success
5. For API Key:
   - Enter API key
   - Enter instance URL (if required)
   - Click **Connect**

#### 2. Create an Automation Flow

1. Navigate to **Integration Flows** (`/integrations/flows`)
2. Click **Create Flow**
3. Enter flow name and description
4. Select trigger connector and event
5. Click **Add Step** to add actions
6. For each step:
   - Select connector
   - Select connected account
   - Choose action
   - Configure parameters
   - Set error handling
7. Drag steps to reorder
8. Click **Save Flow**
9. Click **Test Flow** to verify

#### 3. Monitor Flow Execution

1. Navigate to **Integration Flows**
2. View execution statistics:
   - Total executions
   - Success rate
   - Last run time
3. Click flow name to view details
4. Check **Integration Logs** for debugging

---

## API Usage

### Execute a Flow Programmatically

```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/flow-executor`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      flow_id: 'uuid-of-flow',
      trigger_data: {
        // Trigger-specific data
        leadId: '12345',
        email: 'test@example.com',
      },
    }),
  }
);

const result = await response.json();
console.log(result);
// {
//   success: true,
//   execution_id: "uuid",
//   result: { ... },
//   execution_time_ms: 1234
// }
```

### Receive Webhooks

Set webhook URL in external service:
```
https://your-supabase-url.supabase.co/functions/v1/webhook-processor?connector=salesforce
```

The webhook processor will automatically queue the event and trigger matching flows.

---

## Adding a New Connector

### Step 1: Create Connector Implementation

Create `src/connectors/myconnector.connector.js`:

```javascript
import { OAuth2Connector } from './base.connector.js';

export class MyConnector extends OAuth2Connector {
  constructor() {
    super({
      name: 'myconnector',
      displayName: 'My Connector',
      type: 'crm',
      authType: 'oauth2',
      authorizeUrl: 'https://api.myconnector.com/oauth/authorize',
      tokenUrl: 'https://api.myconnector.com/oauth/token',
      refreshUrl: 'https://api.myconnector.com/oauth/token',
      baseUrl: 'https://api.myconnector.com',
      scopes: ['read', 'write'],
    });
  }

  async testConnection(credentials) {
    // Implementation
  }

  async execute(action, params, credentials) {
    // Implementation
  }
}
```

### Step 2: Register Connector

Update `src/connectors/index.js`:

```javascript
import { MyConnector } from './myconnector.connector.js';

export const connectorRegistry = {
  // ... existing connectors
  myconnector: MyConnector,
};
```

### Step 3: Add to Database

Insert into `connectors` table:

```sql
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  authorize_url, token_url, scopes, supports_webhooks,
  triggers, actions, status
) VALUES (
  'myconnector',
  'My Connector',
  'Connect to My Connector service',
  'crm',
  'oauth2',
  'https://api.myconnector.com/oauth/authorize',
  'https://api.myconnector.com/oauth/token',
  '["read", "write"]'::jsonb,
  true,
  '[{"id": "new_contact", "name": "New Contact"}]'::jsonb,
  '[{"id": "create_contact", "name": "Create Contact"}]'::jsonb,
  'active'
);
```

### Step 4: Add Environment Variables

```bash
MYCONNECTOR_CLIENT_ID=your_client_id
MYCONNECTOR_CLIENT_SECRET=your_client_secret
```

### Step 5: Test

1. Navigate to Integration Platform
2. Find your connector
3. Click Connect
4. Test OAuth flow
5. Create test flow
6. Execute and verify

---

## Troubleshooting

### Connection Issues

**Problem:** "Failed to connect"
- Check environment variables are set
- Verify OAuth redirect URI matches
- Check connector status is 'active'

**Problem:** "Token expired"
- Token refresh should be automatic
- Check refresh token is stored
- Verify refresh_url is correct

### Flow Execution Issues

**Problem:** "Flow execution failed"
- Check integration logs for details
- Verify connected account is still valid
- Check action parameters are correct
- Test connection manually

**Problem:** "Step skipped"
- Check step conditions
- Verify field mapping is correct
- Ensure previous step output matches expected input

### Webhook Issues

**Problem:** "Webhooks not received"
- Verify webhook URL is correct
- Check connector supports webhooks
- Ensure webhook is registered in external service
- Check webhook_events table for queued events

---

## Performance Optimization

### 1. Caching

- Cache connector configurations
- Cache connected account details
- Cache flow definitions

### 2. Batching

- Batch webhook processing
- Batch database updates
- Use transaction blocks

### 3. Async Processing

- Queue long-running flows
- Use background workers for webhooks
- Implement retry logic with exponential backoff

### 4. Database Optimization

- Indexes on frequently queried fields
- Partition large tables (logs, events)
- Regular vacuum and analyze

---

## Future Enhancements

### Planned Features

1. **Visual Flow Designer**
   - Node-based interface
   - Branch conditions
   - Parallel execution paths

2. **Advanced Transformations**
   - Custom JavaScript code blocks
   - Data formatters
   - Template engine

3. **Monitoring Dashboard**
   - Real-time execution monitoring
   - Error alerting
   - Performance metrics

4. **Marketplace**
   - Pre-built flow templates
   - Community connectors
   - Flow sharing

5. **Testing Tools**
   - Mock data generators
   - Flow simulation
   - Step-by-step debugging

---

## Support

For issues or questions:
1. Check integration logs
2. Review connector documentation
3. Test individual actions
4. Contact system administrator

---

## Summary

The Integration Platform provides a complete, production-ready solution for connecting external services and automating workflows. With support for OAuth2 and API key authentication, modular connector SDK, webhook processing, and visual flow builder, it enables admins to create powerful automations without writing code.

**Key Features:**
- 10 pre-built connectors (Salesforce, HubSpot, Google, Microsoft, Moodle, etc.)
- Universal OAuth2 engine
- Webhook support
- Drag-and-drop flow builder
- Comprehensive logging
- Enterprise security (RLS, encryption, rate limiting)
- Admin-only access
- Scalable architecture

**Access:** Available for Admin and Super Admin roles only.
