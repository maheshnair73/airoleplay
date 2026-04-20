/*
  # Reset all demo user passwords with correct bcrypt hash

  Sets all demo account passwords to 'demo1234' using a properly generated
  bcrypt hash via the extensions.crypt function.
*/

UPDATE auth.users
SET 
  encrypted_password = extensions.crypt('demo1234', extensions.gen_salt('bf', 10)),
  updated_at = now()
WHERE email IN (
  'saas@effysalespro.com',
  'admin@effysalespro.com',
  'manager@effysalespro.com',
  'agent1@effysalespro.com',
  'agent2@effysalespro.com'
);
