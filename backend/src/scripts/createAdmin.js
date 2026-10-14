/**
 * Securely create the first system administrator.
 * Usage: npm run create-admin
 * Reads ADMIN_* vars from .env or prompts via env defaults.
 */
require('dotenv').config();
const userService = require('../services/userService');
const { testConnection } = require('../config/db');
const { passwordRegex, NAME_MIN, NAME_MAX, ADDRESS_MAX } = require('../validators/rules');

async function main() {
  const name = process.env.ADMIN_NAME || 'System Administrator Account';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const address = process.env.ADMIN_ADDRESS || '123 Admin Street, City Center, Admin District';

  if (name.length < NAME_MIN || name.length > NAME_MAX) {
    throw new Error(`ADMIN_NAME must be ${NAME_MIN}-${NAME_MAX} characters`);
  }
  if (address.length > ADDRESS_MAX) {
    throw new Error(`ADMIN_ADDRESS must be at most ${ADDRESS_MAX} characters`);
  }
  if (!passwordRegex.test(password)) {
    throw new Error(
      'ADMIN_PASSWORD must be 8-16 chars with uppercase, lowercase, digit, and special character'
    );
  }

  await testConnection();

  const existing = await userService.findByEmail(email);
  if (existing) {
    console.log(`Admin already exists for ${email} (id=${existing.id}, role=${existing.role})`);
    process.exit(0);
  }

  const user = await userService.createUser({
    name,
    email,
    password,
    address,
    role: 'admin',
  });

  console.log('Administrator created successfully:');
  console.log(`  id:    ${user.id}`);
  console.log(`  name:  ${user.name}`);
  console.log(`  email: ${user.email}`);
  console.log(`  role:  ${user.role}`);
  console.log('Log in with this email and the ADMIN_PASSWORD from your .env file.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to create admin:', err.message);
  process.exit(1);
});
