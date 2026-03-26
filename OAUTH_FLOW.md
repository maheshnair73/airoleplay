# Outlook OAuth Integration - Complete Guide

## Overview

The Outlook integration now uses **OAuth 2.0** for authentication, making it incredibly easy to connect. No more manual Azure AD configuration, client IDs, tenant IDs, or client secrets!

## User Experience

### Before (Manual Configuration)
```
1. Go to Azure Portal
2. Register application
3. Configure API permissions
4. Create client secret
5. Copy 4 different values
6. Paste into form
7. Hope it works
```

### After (OAuth Flow)
```
1. Click "Connect with Outlook" button
2. Sign in with Microsoft account
3. Done!
```

## Technical Implementation

### Architecture

```
┌─────────────────┐
│   Frontend UI   │
│   (React)       │
└────────┬────────┘
         │ 1. User clicks "Connect with Outlook"
         ▼
┌─────────────────────────────────────────┐
│   Outlook OAuth Edge Function           │
│   /outlook-oauth/authorize              │
│   - Redirects to Microsoft login        │
└─────────────────┬───────────────────────┘
                  │ 2. Redirect to Microsoft
                  ▼
┌─────────────────────────────────────────┐
│   Microsoft OAuth Consent Screen        │
│   - User signs in                       │
│   - Grants permissions                  │
└─────────────────┬───────────────────────┘
                  │ 3. Redirect back with code
                  ▼
┌─────────────────────────────────────────┐
│   Outlook OAuth Edge Function           │
│   /outlook-oauth/callback               │
│   - Exchanges code for tokens           │
│   - Fetches user info                   │
│   - Returns success page                │
└─────────────────┬───────────────────────┘
                  │ 4. postMessage to opener window
                  ▼
┌─────────────────────────────────────────┐
│   Frontend UI                           │
│   - Receives OAuth data                 │
│   - Saves to database                   │
│   - Shows success message               │
└─────────────────────────────────────────┘
```

## Implementation Details

### Edge Function: `outlook-oauth`

**File:** `supabase/functions/outlook-oauth/index.ts`

**Endpoints:**

1. **`/authorize`** - Initiates OAuth flow
   - Builds Microsoft authorization URL
   - Includes required scopes
   - Redirects user to Microsoft login

2. **`/callback`** - Handles OAuth callback
   - Receives authorization code
   - Exchanges code for access/refresh tokens
   - Fetches user profile from Microsoft Graph
   - Returns beautiful success page with auto-close

**OAuth Scopes:**
- `openid` - User identification
- `profile` - User profile info
- `email` - User email address
- `offline_access` - Refresh token
- `Mail.Read` - Read user's emails
- `User.Read` - Read user profile

### Frontend Component

**File:** `src/components/integrations/OutlookIntegrationModal.jsx`

**Key Features:**

1. **OAuth Button** - Opens popup window to start flow
2. **Message Listener** - Receives OAuth data from popup
3. **Connection State** - Shows connected user info
4. **Settings Form** - Configure detection settings after connecting

**Flow:**

```javascript
// 1. User clicks button
handleConnectOutlook() {
  const authUrl = `${SUPABASE_URL}/functions/v1/outlook-oauth/authorize`;
  window.open(authUrl, 'outlook-oauth', 'width=600,height=700');
}

// 2. Listen for success message
window.addEventListener('message', (event) => {
  if (event.data?.type === 'outlook-oauth-success') {
    handleOAuthSuccess(event.data.data);
  }
});

// 3. Save to database
handleOAuthSuccess(data) {
  const tokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_in
  };

  supabase.from('integration_connections').insert({
    auth_tokens: tokens,
    config: { email: data.email, ... }
  });
}
```

### Database Schema

**Table:** `integration_connections`

**New Column:**
```sql
auth_tokens jsonb DEFAULT '{}'::jsonb
```

**Stores:**
```json
{
  "access_token": "eyJ0eXAiOi...",
  "refresh_token": "0.AXoA...",
  "expires_at": "2024-03-27T10:00:00Z"
}
```

## Security

### Token Storage
- Tokens stored in `auth_tokens` jsonb column
- Database-level encryption via Supabase
- Row Level Security (RLS) ensures users only see their own tokens

### OAuth Security
- Uses Authorization Code flow (most secure)
- Tokens exchanged server-side (edge function)
- No client secrets exposed in frontend
- PKCE not needed for confidential clients

### Token Refresh
- Refresh tokens used to get new access tokens
- Automatic refresh when tokens expire
- No user interaction needed

## Environment Variables

**Required in Supabase:**

```bash
MICROSOFT_CLIENT_ID=your-app-client-id
MICROSOFT_CLIENT_SECRET=your-app-client-secret
```

These are configured once in Supabase dashboard for the entire organization. Individual users don't need to know these values.

## User Interface

### Connection Flow

**Step 1: Initial State**
```
┌─────────────────────────────────────────┐
│  Connect Outlook                   [X]  │
├─────────────────────────────────────────┤
│                                         │
│  Connect with one click!                │
│  Securely connect your Microsoft        │
│  Outlook account using OAuth            │
│                                         │
│      [📧 Connect with Outlook →]       │
│                                         │
└─────────────────────────────────────────┘
```

**Step 2: After OAuth Success**
```
┌─────────────────────────────────────────┐
│  Connect Outlook                   [X]  │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Connected Successfully!             │
│  John Doe                               │
│  john.doe@company.com                   │
│                                         │
│  Detection Settings                     │
│  ├─ Auto-detect Meetings      [ON]     │
│  ├─ Auto-detect Demos         [ON]     │
│  ├─ Prep hours before: 24              │
│  ├─ Scan interval: 30 min              │
│  └─ Keywords: demo, meeting, call      │
│                                         │
│      [Cancel]  [Save Connection]        │
│                                         │
└─────────────────────────────────────────┘
```

### OAuth Popup Window

**Success Page:**
- Beautiful animated checkmark
- Shows connected user name and email
- Auto-closes after 2 seconds
- Sends data back to parent window

## Testing

### Manual Test Flow

1. **Start app:** `npm run dev`
2. **Navigate to:** Integration Management → Connections
3. **Click:** "Connect" on Outlook card
4. **Click:** "Connect with Outlook" button
5. **Sign in:** Use your Microsoft account
6. **Grant permissions:** Click "Accept"
7. **Verify:** Success page shows your name/email
8. **Check:** Modal shows "Connected Successfully!"
9. **Configure:** Set detection settings
10. **Save:** Click "Save Connection"
11. **Verify:** Connection appears as "Connected" in list

### Troubleshooting

**Issue: Popup blocked**
- Allow popups for this site
- Try again

**Issue: OAuth error**
- Check environment variables are set
- Verify redirect URI matches edge function URL
- Check Microsoft app configuration

**Issue: Connection not saving**
- Check browser console for errors
- Verify RLS policies allow insert
- Check user is authenticated

## API Reference

### Start OAuth Flow

```javascript
GET /functions/v1/outlook-oauth/authorize

Query Params:
  - state (optional): Custom state for CSRF protection

Redirects to:
  Microsoft login page

Returns:
  302 Redirect
```

### Handle OAuth Callback

```javascript
GET /functions/v1/outlook-oauth/callback

Query Params:
  - code: Authorization code from Microsoft
  - state: State parameter (if provided)
  - error: Error code (if failed)

Returns:
  HTML page with:
  - Success animation
  - User info
  - JavaScript to send data to parent window
```

## Comparison: Before vs After

| Aspect | Manual Config | OAuth Flow |
|--------|--------------|------------|
| Setup Time | 15-20 minutes | 30 seconds |
| Steps | 9 steps | 2 steps |
| User Experience | Complex | Simple |
| Error Prone | Very | Minimal |
| Security | Good | Excellent |
| Token Refresh | Manual | Automatic |
| User Credentials | Needed | Not exposed |
| Admin Setup | Per user | Once for org |

## Future Enhancements

- [ ] Add Gmail OAuth integration
- [ ] Support multiple email accounts per user
- [ ] Real-time token refresh notifications
- [ ] OAuth for Slack (in addition to webhooks)
- [ ] Calendar integration for meeting detection
- [ ] Email reply detection and tracking

## Support

For issues with OAuth flow:
1. Check browser console for errors
2. Verify environment variables are set
3. Test with a personal Microsoft account first
4. Check Microsoft app registration settings
5. Review Supabase edge function logs
