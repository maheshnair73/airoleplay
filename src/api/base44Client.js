import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication optional for preview
export const base44 = createClient({
  appId: "685a423a286492bdf63ba047",
  requiresAuth: false // Allow preview without authentication
});
