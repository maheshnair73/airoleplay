# Accessing Integration Management

## Quick Start

The Integration Management page is located in the **Administration** section of the left sidebar menu.

## Access Requirements

To see the Integration Management option, you must be logged in with one of the following roles:
- `admin`
- `company_admin`
- `saas_admin`
- `super_admin`

## How to Access

1. **Log in** to the application
2. Look for the **"Administration"** section in the left sidebar
3. Click on **"Integration Management"** (with the ⚡ Zap icon)

## If You Don't See the Administration Section

The Administration section will only appear if your user account has an admin role. Here's how to check:

### Option 1: Check Your Role in the UI
- Click on your profile avatar at the bottom of the sidebar
- Your role is displayed under your name
- If it shows "sales_agent" or "user", you won't see admin options

### Option 2: Update Your Role in the Database

If you need to grant admin access to a user:

```sql
-- Find your user
SELECT id, email, role FROM user_profiles WHERE email = 'your-email@example.com';

-- Update to admin role
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Option 3: Create a New Admin User

Use the Register page to create a new user, then update their role:

```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'new-admin@example.com';
```

## Direct URL Access

You can also navigate directly to the Integration Management page:

**URL:** `/IntegrationManagement`

Full path: `http://your-domain/IntegrationManagement`

## Demo Mode Role Switching

If the application is in demo mode, you may see a role switcher in the user menu that allows you to temporarily switch to an admin role to test admin features.

## Navigation Structure

```
Left Sidebar
├── Manage Leads
├── Sales Execution
├── AI Sales Coach
├── Knowledge Hub
├── Gamification & Rewards
├── KPIs & Analytics
└── Administration (admin only)
    ├── User Management
    ├── Module Management
    ├── Dialer Settings
    ├── AI Agent Settings
    ├── Integration Management ⚡ (NEW!)
    └── Database Schema
```

## Troubleshooting

**Issue:** I can't see the Administration section
- **Solution:** Verify your user role is set to admin, company_admin, or saas_admin

**Issue:** Integration Management doesn't appear in the menu
- **Solution:** Clear your browser cache and refresh the page

**Issue:** Page loads but shows "Not Found"
- **Solution:** Ensure the route is properly registered in the routing configuration

## Related Documentation

- [Integration Setup Guide](./INTEGRATION_SETUP.md) - Full integration setup instructions
- [Database Schema](./supabase/migrations/) - Database structure for integrations
