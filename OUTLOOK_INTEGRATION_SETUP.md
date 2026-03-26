# Microsoft Outlook Integration Setup Guide

## Overview
This guide will help you connect Microsoft Outlook (Office 365) to effySalesPro for automatic meeting detection and AI roleplay preparation.

## Prerequisites
- A Microsoft account with access to Azure Portal
- Admin access to your Supabase project

## Step 1: Create Azure AD Application

1. **Go to Azure Portal**
   - Visit https://portal.azure.com/
   - Sign in with your Microsoft account

2. **Navigate to App Registrations**
   - Click on "Azure Active Directory" (or search for it)
   - Click on "App registrations" in the left sidebar
   - Click "+ New registration"

3. **Register Your Application**
   - **Name**: `effySalesPro Outlook Integration`
   - **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**:
     - Platform: **Web**
     - URL: `https://ipmnypfzqtyduoegynhs.supabase.co/functions/v1/outlook-oauth/callback`
   - Click **Register**

4. **Save Your Client ID**
   - After registration, you'll see the "Application (client) ID"
   - Copy this value - you'll need it later
   - Example: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

## Step 2: Create Client Secret

1. **Navigate to Certificates & Secrets**
   - In your app registration, click "Certificates & secrets" in the left sidebar
   - Click "+ New client secret"

2. **Create Secret**
   - **Description**: `effySalesPro Secret`
   - **Expires**: Choose your preferred expiration (recommended: 24 months)
   - Click **Add**

3. **Copy the Secret Value**
   - **IMPORTANT**: Copy the secret **Value** (not the Secret ID) immediately
   - This value will only be shown once!
   - Example: `abc123~DEF456.ghi789_JKL012-MNO345`

## Step 3: Configure API Permissions

1. **Navigate to API Permissions**
   - Click "API permissions" in the left sidebar
   - Click "+ Add a permission"

2. **Add Microsoft Graph Permissions**
   - Select **Microsoft Graph**
   - Select **Delegated permissions**
   - Add these permissions:
     - ✅ `openid`
     - ✅ `profile`
     - ✅ `email`
     - ✅ `offline_access`
     - ✅ `Mail.Read`
     - ✅ `User.Read`
   - Click **Add permissions**

3. **Grant Admin Consent** (Optional but Recommended)
   - Click "Grant admin consent for [Your Organization]"
   - This prevents users from seeing a consent screen
   - Click **Yes** to confirm

## Step 4: Configure Supabase Secrets

You need to add your Microsoft credentials as environment variables in Supabase.

### Using Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **Settings** > **Edge Functions**
4. Under "Secrets", add the following:

   - **Name**: `MICROSOFT_CLIENT_ID`
   - **Value**: [Your Application (client) ID from Step 1]

   - **Name**: `MICROSOFT_CLIENT_SECRET`
   - **Value**: [Your Client Secret Value from Step 2]

### Using Supabase CLI (Alternative):

```bash
# Set Microsoft Client ID
supabase secrets set MICROSOFT_CLIENT_ID=your-client-id-here

# Set Microsoft Client Secret
supabase secrets set MICROSOFT_CLIENT_SECRET=your-client-secret-here
```

## Step 5: Test the Integration

1. **Reload the Application**
   - Refresh your effySalesPro application
   - Navigate to **Integrations** > **Integration Management**

2. **Connect Outlook**
   - Click **+ New Trigger**
   - Select **Outlook**
   - Click **Connect with Outlook**

3. **Authorize Access**
   - A popup window will appear
   - Sign in with your Microsoft account
   - Grant the requested permissions
   - The window will close automatically after successful authorization

4. **Configure Settings**
   - Enable **Auto-detect Meetings** and **Auto-detect Demos** as needed
   - Set your preferred **Preparation Time** (hours before event)
   - Adjust **Email Scan Interval**
   - Add or remove detection keywords
   - Click **Save Connection**

## Troubleshooting

### "Connecting..." stays forever
- **Cause**: Missing environment variables
- **Solution**: Ensure `MICROSOFT_CLIENT_ID` and `MICROSOFT_CLIENT_SECRET` are set in Supabase

### Popup gets blocked
- **Cause**: Browser popup blocker
- **Solution**: Allow popups for your application domain

### "Invalid redirect URI" error
- **Cause**: Mismatch between Azure AD and actual redirect URI
- **Solution**: Verify the redirect URI in Azure matches exactly:
  ```
  https://ipmnypfzqtyduoegynhs.supabase.co/functions/v1/outlook-oauth/callback
  ```

### "AADSTS700016: Application not found" error
- **Cause**: Wrong Client ID
- **Solution**: Double-check your Client ID in Supabase matches the one from Azure

### Permissions errors
- **Cause**: Missing or incorrect API permissions
- **Solution**: Verify all required permissions are added in Azure AD

## Security Notes

- **Client Secret Security**: Never commit your client secret to version control
- **Token Storage**: Access tokens are encrypted and stored securely in Supabase
- **Scope Limitation**: Only request the minimum permissions needed
- **Token Refresh**: The integration automatically refreshes expired tokens using the refresh token

## What Happens After Connection?

Once connected, the system will:
1. Scan your Outlook inbox at the configured interval
2. Detect emails containing meeting/demo keywords
3. Extract meeting details (participants, time, subject)
4. Automatically create AI roleplay preparation sessions
5. Notify you before scheduled meetings/demos
6. Provide AI-powered preparation assistance

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all Azure AD settings are correct
3. Ensure Supabase secrets are properly set
4. Check that your Microsoft account has the necessary permissions

## Office 365 vs Personal Microsoft Account

This integration works with:
- ✅ **Office 365 / Microsoft 365** (Work/School accounts)
- ✅ **Personal Microsoft Accounts** (Outlook.com, Hotmail, Live.com)

Both account types use the same OAuth flow and Microsoft Graph API.
