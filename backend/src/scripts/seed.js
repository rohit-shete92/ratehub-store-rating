/**
 * Optional development seed — inserts sample users, stores, and ratings.
 * Does not drop or recreate the database.
 * Usage: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { query, testConnection } = require('../config/db');
const { normalizeEmail } = require('../utils/normalize');

const SALT_ROUNDS = 10;

async function ensureUser({ name, email, password, address, role }) {
  const normalized = normalizeEmail(email);
  const existing = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalized]);
  if (existing.length) return existing[0].id;

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    'INSERT INTO users (name, email, password_hash, address, role) VALUES (?, ?, ?, ?, ?)',
    [name, normalized, hash, address, role]
  );
  return result.insertId;
}

async function ensureStore({ name, email, address, ownerId }) {
  const normalized = normalizeEmail(email);
  const existing = await query('SELECT id FROM stores WHERE email = ? LIMIT 1', [normalized]);
  if (existing.length) return existing[0].id;

  const result = await query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, normalized, address, ownerId]
  );
  return result.insertId;
}

async function ensureRating(userId, storeId, rating) {
  const existing = await query(
    'SELECT id FROM ratings WHERE user_id = ? AND store_id = ? LIMIT 1',
    [userId, storeId]
  );
  if (existing.length) {
    await query('UPDATE ratings SET rating = ? WHERE id = ?', [rating, existing[0].id]);
    return;
  }
  await query('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [
    userId,
    storeId,
    rating,
  ]);
}

async function main() {
  await testConnection();
  console.log('Seeding development data...');

  const adminId = await ensureUser({
    name: 'System Administrator Account',
    email: 'admin@example.com',
    password: 'Admin@1234',
    address: '100 Admin Plaza, Central Business District, Metro City',
    role: 'admin',
  });

  const owner1Id = await ensureUser({
    name: 'Green Valley Store Owner One',
    email: 'owner1@example.com',
    password: 'Owner@1234',
    address: '22 Market Lane, Green Valley Township, West Region',
    role: 'store_owner',
  });

  const owner2Id = await ensureUser({
    name: 'Sunrise Mart Store Owner Two',
    email: 'owner2@example.com',
    password: 'Owner@1234',
    address: '88 Harbor Road, Sunrise Bay Neighborhood, East Side',
    role: 'store_owner',
  });

  const user1Id = await ensureUser({
    name: 'Normal Registered User Alpha',
    email: 'user1@example.com',
    password: 'User@1234',
    address: '15 Oak Street Apartment 4B, Riverside Community Area',
    role: 'user',
  });

  const user2Id = await ensureUser({
    name: 'Normal Registered User Beta',
    email: 'user2@example.com',
    password: 'User@1234',
    address: '77 Pine Avenue Suite 12, Hillcrest Residential District',
    role: 'user',
  });

  const store1Id = await ensureStore({
    name: 'Green Valley Fresh Market Store',
    email: 'greenvalley@example.com',
    address: '45 Commerce Boulevard, Green Valley Shopping Center',
    ownerId: owner1Id,
  });

  const store2Id = await ensureStore({
    name: 'Sunrise Everyday Mart Express',
    email: 'sunrise@example.com',
    address: '12 Coastal Avenue, Sunrise Bay Retail Complex Zone',
    ownerId: owner2Id,
  });

  const store3Id = await ensureStore({
    name: 'City Center Electronics Outlet',
    email: 'cityelectronics@example.com',
    address: '9 Downtown Square, City Center Commercial Plaza',
    ownerId: null,
  });

  await ensureRating(user1Id, store1Id, 5);
  await ensureRating(user2Id, store1Id, 4);
  await ensureRating(user1Id, store2Id, 3);
  await ensureRating(user2Id, store2Id, 5);
  await ensureRating(user1Id, store3Id, 4);

  console.log('Seed complete. Sample accounts:');
  console.log('  Admin:  admin@example.com / Admin@1234');
  console.log('  Owner:  owner1@example.com / Owner@1234');
  console.log('  Owner:  owner2@example.com / Owner@1234');
  console.log('  User:   user1@example.com / User@1234');
  console.log('  User:   user2@example.com / User@1234');
  console.log(`  IDs — admin:${adminId}, stores:${store1Id},${store2Id},${store3Id}`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
