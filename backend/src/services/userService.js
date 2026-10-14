const bcrypt = require('bcrypt');
const { query } = require('../config/db');
const { normalizeEmail, trimString } = require('../utils/normalize');

const SALT_ROUNDS = 10;

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByEmail(email) {
  const normalized = normalizeEmail(email);
  const rows = await query('SELECT * FROM users WHERE email = ? LIMIT 1', [normalized]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query(
    'SELECT id, name, email, address, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, password, address, role = 'user' }) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, address, role)
     VALUES (?, ?, ?, ?, ?)`,
    [trimString(name), normalizedEmail, passwordHash, trimString(address), role]
  );

  return findById(result.insertId);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

async function updatePassword(userId, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
}

function buildUserFilters(filters = {}) {
  const where = [];
  const params = [];

  if (filters.name) {
    where.push('name LIKE ?');
    params.push(`%${filters.name}%`);
  }
  if (filters.email) {
    where.push('email LIKE ?');
    params.push(`%${normalizeEmail(filters.email)}%`);
  }
  if (filters.address) {
    where.push('address LIKE ?');
    params.push(`%${filters.address}%`);
  }
  if (filters.role) {
    where.push('role = ?');
    params.push(filters.role);
  }

  return { where, params };
}

async function listUsers(filters = {}) {
  const { where, params } = buildUserFilters(filters);
  const allowedSort = {
    name: 'name',
    email: 'email',
    address: 'address',
    role: 'role',
    created_at: 'created_at',
  };
  const sortCol = allowedSort[filters.sortBy] || 'created_at';
  const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

  const sql = `
    SELECT id, name, email, address, role, created_at, updated_at
    FROM users
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY ${sortCol} ${sortOrder}
  `;

  const rows = await query(sql, params);
  return rows.map(sanitizeUser);
}

async function countUsers() {
  const rows = await query('SELECT COUNT(*) AS total FROM users');
  return rows[0].total;
}

async function getUserDetails(id) {
  const user = await findById(id);
  if (!user) return null;

  const ratingStats = await query(
    `SELECT COUNT(*) AS ratingCount, COALESCE(AVG(rating), 0) AS avgGiven
     FROM ratings WHERE user_id = ?`,
    [id]
  );

  let ownedStore = null;
  if (user.role === 'store_owner') {
    const stores = await query(
      `SELECT s.id, s.name, s.email, s.address,
              COALESCE(AVG(r.rating), 0) AS average_rating,
              COUNT(r.id) AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = ?
       GROUP BY s.id`,
      [id]
    );
    if (stores.length) {
      ownedStore = {
        id: stores[0].id,
        name: stores[0].name,
        email: stores[0].email,
        address: stores[0].address,
        averageRating: Number(Number(stores[0].average_rating).toFixed(2)),
        ratingCount: stores[0].rating_count,
      };
    }
  }

  return {
    ...sanitizeUser(user),
    ratingCount: ratingStats[0].ratingCount,
    averageRatingGiven: Number(Number(ratingStats[0].avgGiven).toFixed(2)),
    ownedStore,
  };
}

module.exports = {
  sanitizeUser,
  findByEmail,
  findById,
  createUser,
  verifyPassword,
  updatePassword,
  listUsers,
  countUsers,
  getUserDetails,
};
