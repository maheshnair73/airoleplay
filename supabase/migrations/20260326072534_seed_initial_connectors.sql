/*
  # Seed Initial Connectors
  
  Adds pre-configured connectors for:
  - CRM: Salesforce, HubSpot, Zoho CRM, Microsoft Dynamics
  - LMS: Moodle, TalentLMS, LearnWorlds, Google Classroom
  - Auth/Productivity: Google, Microsoft
*/

-- Salesforce Connector
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  authorize_url, token_url, refresh_url,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'salesforce',
  'Salesforce',
  'Connect to Salesforce CRM for leads, contacts, opportunities, and accounts management',
  'crm',
  'oauth2',
  'SALESFORCE_CLIENT_ID',
  'SALESFORCE_CLIENT_SECRET',
  'https://login.salesforce.com/services/oauth2/authorize',
  'https://login.salesforce.com/services/oauth2/token',
  'https://login.salesforce.com/services/oauth2/token',
  'https://api.salesforce.com',
  '["full", "refresh_token", "api"]'::jsonb,
  true,
  '[
    {"id": "new_lead", "name": "New Lead", "description": "Triggers when a new lead is created"},
    {"id": "updated_lead", "name": "Updated Lead", "description": "Triggers when a lead is updated"},
    {"id": "new_opportunity", "name": "New Opportunity", "description": "Triggers when a new opportunity is created"},
    {"id": "new_contact", "name": "New Contact", "description": "Triggers when a new contact is created"}
  ]'::jsonb,
  '[
    {"id": "create_lead", "name": "Create Lead", "description": "Creates a new lead"},
    {"id": "update_lead", "name": "Update Lead", "description": "Updates an existing lead"},
    {"id": "create_contact", "name": "Create Contact", "description": "Creates a new contact"},
    {"id": "create_opportunity", "name": "Create Opportunity", "description": "Creates a new opportunity"}
  ]'::jsonb,
  'active',
  'https://developer.salesforce.com/docs/apis'
) ON CONFLICT (name) DO NOTHING;

-- HubSpot Connector
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  authorize_url, token_url, refresh_url,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'hubspot',
  'HubSpot',
  'Connect to HubSpot CRM for contacts, deals, companies, and marketing automation',
  'crm',
  'oauth2',
  'HUBSPOT_CLIENT_ID',
  'HUBSPOT_CLIENT_SECRET',
  'https://app.hubspot.com/oauth/authorize',
  'https://api.hubapi.com/oauth/v1/token',
  'https://api.hubapi.com/oauth/v1/token',
  'https://api.hubapi.com',
  '["crm.objects.contacts.read", "crm.objects.contacts.write", "crm.objects.deals.read", "crm.objects.deals.write", "crm.objects.companies.read", "crm.objects.companies.write"]'::jsonb,
  true,
  '[
    {"id": "new_contact", "name": "New Contact", "description": "Triggers when a new contact is created"},
    {"id": "updated_contact", "name": "Updated Contact", "description": "Triggers when a contact is updated"},
    {"id": "new_deal", "name": "New Deal", "description": "Triggers when a new deal is created"},
    {"id": "new_company", "name": "New Company", "description": "Triggers when a new company is created"}
  ]'::jsonb,
  '[
    {"id": "create_contact", "name": "Create Contact", "description": "Creates a new contact"},
    {"id": "update_contact", "name": "Update Contact", "description": "Updates a contact"},
    {"id": "create_deal", "name": "Create Deal", "description": "Creates a new deal"},
    {"id": "create_company", "name": "Create Company", "description": "Creates a new company"}
  ]'::jsonb,
  'active',
  'https://developers.hubspot.com/docs/api/overview'
) ON CONFLICT (name) DO NOTHING;

-- Zoho CRM Connector
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  authorize_url, token_url, refresh_url,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'zoho_crm',
  'Zoho CRM',
  'Connect to Zoho CRM for leads, contacts, deals, and accounts management',
  'crm',
  'oauth2',
  'ZOHO_CLIENT_ID',
  'ZOHO_CLIENT_SECRET',
  'https://accounts.zoho.com/oauth/v2/auth',
  'https://accounts.zoho.com/oauth/v2/token',
  'https://accounts.zoho.com/oauth/v2/token',
  'https://www.zohoapis.com/crm/v3',
  '["ZohoCRM.modules.ALL"]'::jsonb,
  true,
  '[
    {"id": "new_lead", "name": "New Lead", "description": "Triggers when a new lead is created"},
    {"id": "updated_lead", "name": "Updated Lead", "description": "Triggers when a lead is updated"},
    {"id": "new_contact", "name": "New Contact", "description": "Triggers when a new contact is created"},
    {"id": "new_deal", "name": "New Deal", "description": "Triggers when a new deal is created"}
  ]'::jsonb,
  '[
    {"id": "create_lead", "name": "Create Lead", "description": "Creates a new lead"},
    {"id": "update_lead", "name": "Update Lead", "description": "Updates a lead"},
    {"id": "create_contact", "name": "Create Contact", "description": "Creates a new contact"},
    {"id": "create_deal", "name": "Create Deal", "description": "Creates a new deal"}
  ]'::jsonb,
  'active',
  'https://www.zoho.com/crm/developer/docs/api/v3/'
) ON CONFLICT (name) DO NOTHING;

-- Microsoft Dynamics 365 Connector
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  authorize_url, token_url, refresh_url,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'microsoft_dynamics',
  'Microsoft Dynamics 365',
  'Connect to Microsoft Dynamics 365 CRM for comprehensive business management',
  'crm',
  'oauth2',
  'DYNAMICS_CLIENT_ID',
  'DYNAMICS_CLIENT_SECRET',
  'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  'https://api.businesscentral.dynamics.com/v2.0',
  '["https://api.businesscentral.dynamics.com/.default"]'::jsonb,
  true,
  '[
    {"id": "new_lead", "name": "New Lead", "description": "Triggers when a new lead is created"},
    {"id": "new_contact", "name": "New Contact", "description": "Triggers when a new contact is created"},
    {"id": "new_opportunity", "name": "New Opportunity", "description": "Triggers when a new opportunity is created"}
  ]'::jsonb,
  '[
    {"id": "create_lead", "name": "Create Lead", "description": "Creates a new lead"},
    {"id": "create_contact", "name": "Create Contact", "description": "Creates a new contact"},
    {"id": "update_contact", "name": "Update Contact", "description": "Updates a contact"}
  ]'::jsonb,
  'active',
  'https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/api-reference/v2.0/'
) ON CONFLICT (name) DO NOTHING;

-- Moodle Connector
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  authorize_url, token_url, base_url,
  scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'moodle',
  'Moodle',
  'Connect to Moodle LMS for course and user management',
  'lms',
  'api_key',
  null,
  null,
  null,
  null,
  'https://moodle.org',
  '[]'::jsonb,
  true,
  '[
    {"id": "new_user", "name": "New User", "description": "Triggers when a new user enrolls"},
    {"id": "course_completed", "name": "Course Completed", "description": "Triggers when a user completes a course"},
    {"id": "new_enrollment", "name": "New Enrollment", "description": "Triggers when a user enrolls in a course"}
  ]'::jsonb,
  '[
    {"id": "create_user", "name": "Create User", "description": "Creates a new user"},
    {"id": "enroll_user", "name": "Enroll User", "description": "Enrolls a user in a course"},
    {"id": "create_course", "name": "Create Course", "description": "Creates a new course"}
  ]'::jsonb,
  'active',
  'https://docs.moodle.org/dev/Web_services'
) ON CONFLICT (name) DO NOTHING;

-- TalentLMS Connector
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'talentlms',
  'TalentLMS',
  'Connect to TalentLMS for training and course management',
  'lms',
  'api_key',
  'https://api.talentlms.com',
  '[]'::jsonb,
  true,
  '[
    {"id": "new_user", "name": "New User", "description": "Triggers when a new user is added"},
    {"id": "course_completed", "name": "Course Completed", "description": "Triggers when a course is completed"},
    {"id": "user_enrolled", "name": "User Enrolled", "description": "Triggers when a user enrolls"}
  ]'::jsonb,
  '[
    {"id": "create_user", "name": "Create User", "description": "Creates a new user"},
    {"id": "enroll_user", "name": "Enroll User", "description": "Enrolls a user in a course"},
    {"id": "assign_course", "name": "Assign Course", "description": "Assigns a course to a user"}
  ]'::jsonb,
  'active',
  'https://www.talentlms.com/pages/docs/TalentLMS-API-Documentation.pdf'
) ON CONFLICT (name) DO NOTHING;

-- LearnWorlds Connector
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'learnworlds',
  'LearnWorlds',
  'Connect to LearnWorlds for online course creation and management',
  'lms',
  'api_key',
  null,
  null,
  'https://api.learnworlds.com',
  '[]'::jsonb,
  true,
  '[
    {"id": "new_enrollment", "name": "New Enrollment", "description": "Triggers when a student enrolls"},
    {"id": "course_completed", "name": "Course Completed", "description": "Triggers when a course is completed"},
    {"id": "new_user", "name": "New User", "description": "Triggers when a new user registers"}
  ]'::jsonb,
  '[
    {"id": "create_user", "name": "Create User", "description": "Creates a new user"},
    {"id": "enroll_user", "name": "Enroll User", "description": "Enrolls a user in a course"},
    {"id": "send_email", "name": "Send Email", "description": "Sends an email to a user"}
  ]'::jsonb,
  'active',
  'https://www.learnworlds.com/help/article/learnworlds-api/'
) ON CONFLICT (name) DO NOTHING;

-- Google Classroom Connector
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  authorize_url, token_url, refresh_url,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'google_classroom',
  'Google Classroom',
  'Connect to Google Classroom for educational course management',
  'lms',
  'oauth2',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'https://accounts.google.com/o/oauth2/v2/auth',
  'https://oauth2.googleapis.com/token',
  'https://oauth2.googleapis.com/token',
  'https://classroom.googleapis.com/v1',
  '["https://www.googleapis.com/auth/classroom.courses", "https://www.googleapis.com/auth/classroom.rosters", "https://www.googleapis.com/auth/classroom.profile.emails"]'::jsonb,
  true,
  '[
    {"id": "new_student", "name": "New Student", "description": "Triggers when a student joins a course"},
    {"id": "assignment_submitted", "name": "Assignment Submitted", "description": "Triggers when an assignment is submitted"},
    {"id": "new_course", "name": "New Course", "description": "Triggers when a new course is created"}
  ]'::jsonb,
  '[
    {"id": "create_course", "name": "Create Course", "description": "Creates a new course"},
    {"id": "invite_student", "name": "Invite Student", "description": "Invites a student to a course"},
    {"id": "create_assignment", "name": "Create Assignment", "description": "Creates a new assignment"}
  ]'::jsonb,
  'active',
  'https://developers.google.com/classroom'
) ON CONFLICT (name) DO NOTHING;

-- Google OAuth Connector (for general Google services)
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  authorize_url, token_url, refresh_url,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'google',
  'Google',
  'Connect to Google services (Gmail, Calendar, Drive, etc.)',
  'auth',
  'oauth2',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'https://accounts.google.com/o/oauth2/v2/auth',
  'https://oauth2.googleapis.com/token',
  'https://oauth2.googleapis.com/token',
  'https://www.googleapis.com',
  '["openid", "profile", "email", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/drive.file"]'::jsonb,
  true,
  '[
    {"id": "new_email", "name": "New Email", "description": "Triggers when a new email is received"},
    {"id": "new_calendar_event", "name": "New Calendar Event", "description": "Triggers when a calendar event is created"},
    {"id": "file_uploaded", "name": "File Uploaded", "description": "Triggers when a file is uploaded to Drive"}
  ]'::jsonb,
  '[
    {"id": "send_email", "name": "Send Email", "description": "Sends an email via Gmail"},
    {"id": "create_event", "name": "Create Calendar Event", "description": "Creates a calendar event"},
    {"id": "upload_file", "name": "Upload File", "description": "Uploads a file to Google Drive"}
  ]'::jsonb,
  'active',
  'https://developers.google.com/identity/protocols/oauth2'
) ON CONFLICT (name) DO NOTHING;

-- Microsoft OAuth Connector (for general Microsoft services)
INSERT INTO connectors (
  name, display_name, description, type, auth_type,
  client_id_env, client_secret_env,
  authorize_url, token_url, refresh_url,
  base_url, scopes, supports_webhooks,
  triggers, actions, status, documentation_url
) VALUES (
  'microsoft',
  'Microsoft',
  'Connect to Microsoft services (Outlook, Teams, OneDrive, etc.)',
  'auth',
  'oauth2',
  'MICROSOFT_CLIENT_ID',
  'MICROSOFT_CLIENT_SECRET',
  'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  'https://graph.microsoft.com/v1.0',
  '["openid", "profile", "email", "offline_access", "Mail.Read", "Calendars.ReadWrite", "Files.ReadWrite"]'::jsonb,
  true,
  '[
    {"id": "new_email", "name": "New Email", "description": "Triggers when a new email is received"},
    {"id": "new_calendar_event", "name": "New Calendar Event", "description": "Triggers when a calendar event is created"},
    {"id": "file_uploaded", "name": "File Uploaded", "description": "Triggers when a file is uploaded to OneDrive"}
  ]'::jsonb,
  '[
    {"id": "send_email", "name": "Send Email", "description": "Sends an email via Outlook"},
    {"id": "create_event", "name": "Create Calendar Event", "description": "Creates a calendar event"},
    {"id": "upload_file", "name": "Upload File", "description": "Uploads a file to OneDrive"}
  ]'::jsonb,
  'active',
  'https://learn.microsoft.com/en-us/graph/overview'
) ON CONFLICT (name) DO NOTHING;
