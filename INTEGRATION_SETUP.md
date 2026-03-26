# Integration Management Setup Guide

## Overview

The Integration Management system allows admins to connect external platforms (Slack, Outlook) and create automated AI roleplay triggers based on events from these platforms.

## Features

### 1. Slack Integration
- **Send roleplay scenarios** to Slack channels
- **Receive notifications** about roleplay completions
- **Auto-post roleplay sessions** to designated channels
- Configure workspace, webhooks, and bot tokens

### 2. Outlook Integration
- **Read emails** and detect meetings, demos, and discussions
- **Auto-detect events** based on configurable keywords
- **Trigger AI roleplay preparation** before scheduled events
- Set preparation time window (e.g., 24 hours before meeting)
- Configurable email scanning interval

### 3. AI Roleplay Triggers
- Create automated triggers based on integration events
- Configure keywords to detect relevant events
- Set roleplay scenario type and difficulty
- Enable/disable triggers on demand

## Database Schema

### Tables Created

1. **integration_connections**
   - Stores connection details for each integration
   - Fields: integration_type, status, access_token, config, metadata
   - Supports: Slack, Outlook, Gmail, Teams, Zoom

2. **ai_roleplay_triggers**
   - Defines rules for automatically creating roleplay sessions
   - Fields: trigger_type, integration_type, trigger_config, roleplay_template
   - Trigger types: email_meeting, email_demo, slack_mention, calendar_event

3. **integration_events**
   - Logs all events received from integrations
   - Links to created roleplay sessions
   - Tracks processing status

## Access

**Navigation:** Admin section → Integration Management

**Required Role:** Admin, Company Admin, or Super Admin

**Tabs:**
1. **Connections** - Connect and configure Slack/Outlook
2. **AI Triggers** - Create rules for automatic session generation
3. **Events & Activity** - View recent events and manually scan emails

## Setup Instructions

### Slack Setup

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app or select existing app
3. Enable "Incoming Webhooks" and create a webhook URL
4. Under "OAuth & Permissions", add these scopes:
   - `channels:read`
   - `chat:write`
   - `users:read`
5. Install the app to your workspace
6. Copy the Bot User OAuth Token
7. In Integration Management, click "Connect Slack"
8. Paste your credentials and configure settings

### Outlook Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Register a new application
3. Add Microsoft Graph API permissions:
   - `Mail.Read`
   - `Calendars.Read`
4. Create a client secret
5. Copy Application ID, Tenant ID, and Client Secret
6. In Integration Management, click "Connect Outlook"
7. Paste credentials and configure detection settings

## Creating AI Triggers

1. Ensure at least one integration is connected
2. Click "New Trigger" button
3. Select integration type (Slack or Outlook)
4. Choose trigger type:
   - **Meeting Scheduled**: Triggers when keywords like "meeting" are detected
   - **Demo Scheduled**: Triggers for product demo invitations
   - **Discussion Scheduled**: Triggers for discussion events
5. Add detection keywords (e.g., "demo", "meeting", "call")
6. Configure roleplay template:
   - Scenario type (discovery, demo, objection handling, etc.)
   - Difficulty level (easy, medium, hard)
7. Save and enable the trigger

## How It Works

### Outlook Email Detection Flow

**Automatic Scanning (Backend):**
1. System scans emails at configured interval (default: 30 minutes)
2. Edge function `process-integration-events` connects to Microsoft Graph API
3. Retrieves emails received since last scan
4. For each email, checks subject and body for trigger keywords

**Manual Scanning (Frontend):**
1. Admin navigates to Integration Management → Events & Activity tab
2. Clicks "Scan Emails Now" button
3. Triggers immediate email scan via edge function
4. Results appear in Recent Integration Events

**Event Processing:**
1. When keyword match found, creates `integration_event` record in database
2. Checks `ai_roleplay_triggers` table for matching active triggers
3. If match found and trigger is active:
   - Creates `roleplay_session` with specified scenario type and difficulty
   - Sets session for X hours before event (default: 24 hours)
   - Links event to session via `roleplay_session_id`
   - Assigns to the user who owns the integration
4. If Slack is connected and auto-post is enabled:
   - Sends notification to configured Slack channel
   - Includes session details and link to start prep

**Example Workflow:**
```
Email arrives: "Meeting scheduled for Product Demo next Tuesday at 2 PM"
  ↓
Keyword "demo" detected in trigger
  ↓
Roleplay session created:
- Type: Product Demo
- Difficulty: Medium
- Scheduled: 24 hours before meeting (Monday 2 PM)
  ↓
Slack notification sent: "🎯 New AI Roleplay Prep Session Created!"
  ↓
User sees session in AI Roleplay → Reports → Roleplay History
```

### Slack Integration Flow

1. User mentions or sends message in monitored channel
2. Webhook receives event
3. System creates integration_event record
4. Checks for matching triggers
5. Creates roleplay session if conditions met
6. Posts roleplay link back to Slack channel

## Security

- All access tokens are stored securely in the database
- RLS policies ensure users can only see their own integrations
- OAuth tokens are refreshed automatically when needed
- Sensitive credentials are never exposed in API responses

## Future Enhancements

- Google Calendar integration
- Microsoft Teams integration
- Zoom meeting detection
- Webhook support for custom integrations
- Advanced trigger conditions (time-based, user-based)
- Multi-channel Slack support
- Email reply detection
