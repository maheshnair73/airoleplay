/*
  # Reset all demo user passwords

  Ensures all demo accounts have the correct password hash for 'demo1234'.
  Uses a known bcrypt hash for the password 'demo1234'.
*/

UPDATE auth.users
SET 
  encrypted_password = '$2a$10$PmVR9TpUGMvgQlXSbNFNAuERSB3LYhkZzPn6H.Y3qGhJX3L5KQXG2',
  updated_at = now()
WHERE email IN (
  'saas@effysalespro.com',
  'admin@effysalespro.com',
  'manager@effysalespro.com',
  'agent1@effysalespro.com',
  'agent2@effysalespro.com'
);
