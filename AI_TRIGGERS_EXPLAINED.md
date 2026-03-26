# AI Trigger System - Complete Explanation

## How AI Triggers Work - Step by Step

The AI Trigger system automatically creates roleplay preparation sessions when it detects certain keywords in your Outlook emails or Slack messages. Here's exactly how it works:

### The Complete Flow

```
1. EMAIL ARRIVES
   Subject: "Product Demo scheduled for next Tuesday at 2 PM"
   Body: "Looking forward to seeing your platform features"

2. SYSTEM SCANS EMAIL
   • Automatic scan every 30 minutes (configurable)
   • Or manual scan via "Scan Emails Now" button

3. KEYWORD DETECTION
   • System checks email text against your trigger keywords
   • Example: ["demo", "meeting", "call", "presentation"]
   • Match found: "demo" ✓

4. TRIGGER MATCHED
   • System finds active AI trigger with matching keyword
   • Trigger specifies: scenario type, difficulty, duration

5. SESSION CREATED
   • Roleplay session automatically created
   • Assigned to you
   • Scheduled 24 hours before the event
   • Tagged as "auto-generated from Outlook"

6. NOTIFICATION SENT (Optional)
   • If Slack is connected
   • Message posted to your Slack channel
   • Includes session details and link

7. YOU GET NOTIFIED
   • View in: AI Sales Coach → Reports → Roleplay History
   • Session ready for practice
```

## Real World Example

**Scenario:** You receive an email about an upcoming product demo

**Email Content:**
```
From: john@prospectcompany.com
Subject: Product Demo - Tuesday 2 PM

Hi,

Looking forward to our product demonstration next Tuesday at 2 PM.
I'd like to see how your platform handles multi-user workflows.

Best,
John
```

**What Happens:**

1. **Email Scanned** - System detects new email
2. **Keywords Found** - "product demo" and "demonstration" match trigger
3. **Session Created** - Roleplay session generated:
   - Type: Product Demo
   - Difficulty: Medium
   - Duration: 15 minutes
   - Scheduled: Monday 2 PM (24 hours before meeting)
4. **Slack Notification** - Message sent:
   ```
   🎯 New AI Roleplay Prep Session Created!
   Type: demo
   Difficulty: medium
   Triggered by: Product Demo - Tuesday 2 PM
   Duration: 15 minutes
   ```
5. **You Practice** - Do the roleplay prep on Monday to prepare for Tuesday's demo

## Database Structure

### integration_connections
Stores your Outlook/Slack connection details
```javascript
{
  id: "uuid",
  user_id: "your-user-id",
  integration_type: "outlook",
  status: "connected",
  config: {
    email_address: "you@company.com",
    scan_interval_minutes: 30,
    keywords: ["demo", "meeting", "call"]
  }
}
```

### ai_roleplay_triggers
Defines the rules for session creation
```javascript
{
  id: "uuid",
  user_id: "your-user-id",
  trigger_type: "email_demo",
  integration_type: "outlook",
  trigger_config: {
    keywords: ["demo", "demonstration", "showcase"],
    prep_hours_before: 24
  },
  roleplay_template: {
    scenario_type: "demo",
    difficulty_level: "medium",
    duration_minutes: 15
  },
  is_active: true
}
```

### integration_events
Logs every email/message processed
```javascript
{
  id: "uuid",
  connection_id: "connection-uuid",
  event_type: "email_received",
  event_data: {
    subject: "Product Demo - Tuesday 2 PM",
    body: "Looking forward to...",
    sender: "john@prospectcompany.com"
  },
  processed: true,
  roleplay_session_id: "session-uuid"
}
```

### roleplay_sessions
The actual prep session created for you
```javascript
{
  id: "uuid",
  user_id: "your-user-id",
  scenario_type: "demo",
  difficulty: "medium",
  duration: 15,
  status: "scheduled",
  metadata: {
    auto_generated: true,
    source: "outlook",
    trigger_id: "trigger-uuid",
    event_data: {...}
  }
}
```

## Backend Edge Function

**Function Name:** `process-integration-events`

**What it does:**
1. Connects to Microsoft Graph API using your OAuth credentials
2. Retrieves emails since last scan
3. For each email:
   - Creates integration_event record
   - Checks for matching triggers
   - Creates roleplay session if match found
   - Sends Slack notification if configured
4. Updates last_sync timestamp

**Deployment:** Automatically deployed as Supabase Edge Function

## Frontend UI

### Integration Management Page

**Tab 1: Connections**
- Connect Slack (webhook URL, bot token)
- Connect Outlook (client ID, secret, tenant ID)
- View connection status

**Tab 2: AI Triggers**
- Create new triggers
- Set keywords
- Configure roleplay template
- Enable/disable triggers

**Tab 3: Events & Activity**
- View recent events processed
- See which emails triggered sessions
- Manual "Scan Emails Now" button
- Real-time status updates

## API Usage

### Manual Email Scan

```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/process-integration-events`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'scan_emails',
      connectionId: 'your-connection-id'
    })
  }
);

// Response:
{
  "success": true,
  "emails_processed": 5,
  "message": "Scanned and processed 5 emails"
}
```

## Trigger Examples

### 1. Demo Preparation
```javascript
{
  trigger_type: "email_demo",
  keywords: ["demo", "demonstration", "product walkthrough", "showcase"],
  roleplay_template: {
    scenario_type: "demo",
    difficulty: "medium",
    duration: 15
  }
}
```

### 2. Discovery Call Prep
```javascript
{
  trigger_type: "email_meeting",
  keywords: ["discovery call", "initial meeting", "intro call"],
  roleplay_template: {
    scenario_type: "discovery",
    difficulty: "easy",
    duration: 10
  }
}
```

### 3. Negotiation Practice
```javascript
{
  trigger_type: "email_discussion",
  keywords: ["pricing", "contract", "negotiation", "terms"],
  roleplay_template: {
    scenario_type: "negotiation",
    difficulty: "hard",
    duration: 20
  }
}
```

## Configuration Options

### Outlook Settings
- **Scan Interval:** How often to check emails (default: 30 minutes)
- **Prep Hours Before:** When to schedule the prep session (default: 24 hours)
- **Keywords:** List of words/phrases to trigger session creation
- **Auto-detect Meetings:** Automatically detect calendar invites
- **Auto-detect Demos:** Specifically look for demo-related emails

### Slack Settings
- **Auto-post Roleplay:** Automatically share sessions in Slack
- **Notify on Completion:** Send notification when user completes session
- **Default Channel:** Where to post notifications
- **Webhook URL:** Slack webhook for sending messages

## Troubleshooting

### Issue: No events showing up

**Solutions:**
1. Check Outlook connection status (must be "connected")
2. Verify credentials are correct
3. Click "Scan Emails Now" to test manually
4. Check browser console for errors

### Issue: Events created but no sessions

**Solutions:**
1. Verify triggers are active (`is_active = true`)
2. Check if trigger keywords match email content
3. Look at Events & Activity tab to see processing status
4. Verify trigger configuration is correct

### Issue: Slack notifications not working

**Solutions:**
1. Check Slack connection status
2. Verify "auto_post_roleplay" is enabled in Slack settings
3. Test webhook URL with curl:
   ```bash
   curl -X POST -H 'Content-Type: application/json' \
   -d '{"text":"Test"}' YOUR_WEBHOOK_URL
   ```

## Security

- All OAuth tokens encrypted in database
- Row Level Security (RLS) ensures users only see their own data
- Microsoft Graph API uses OAuth 2.0 authentication
- Slack webhooks use HTTPS
- No passwords or secrets exposed in frontend code

## Viewing Your Sessions

After a session is created, find it in:

**Navigation:**
```
AI Sales Coach
  → Reports
    → Roleplay History
```

Look for sessions with:
- Badge: "Auto-generated"
- Source: "Outlook" or "Slack"
- Status: "Scheduled"

Click to start practicing!
