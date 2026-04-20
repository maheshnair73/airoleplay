
/*
  # Reset demo user passwords

  Reset all demo user passwords to 'demo1234' using a fresh bcrypt hash
  with cost factor 10 (GoTrue default) to ensure compatibility.
*/

UPDATE auth.users
SET 
  encrypted_password = crypt('demo1234', gen_salt('bf', 10)),
  updated_at = now()
WHERE email IN (
  'admin@effysalespro.com',
  'manager@effysalespro.com',
  'agent1@effysalespro.com',
  'agent2@effysalespro.com',
  'saas@effysalespro.com'
);
