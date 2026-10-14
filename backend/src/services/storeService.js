const { query } = require('../config/db');
const { normalizeEmail, trimString } = require('../utils/normalize');

function mapStore(row, includeOwner = false) {
  if (!row) return null;
  const store = {
    id: row.id,
    name: row.name,
    email: row.email,
    address: row.address,
    ownerId: row.owner_id ?? null,
    averageRating: Number(Number(row.average_rating ?? 0).toFixed(2)),
    ratingCount: Number(row.rating_count ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (includeOwner) {
    store.ownerName = row.owner_name || null;
    store.ownerEmail = row.owner_email || null;
  }

  if (row.user_rating !== undefined && row.user_rating !== null) {
    store.userRating = Number(row.user_rating);
  } else if (row.user_rating === null) {
    store.userRating = null;
  }

  return store;
}

async function findByEmail(email) {
  const rows = await query('SELECT * FROM stores WHERE email = ? LIMIT 1', [normalizeEmail(email)]);
  return rows[0] || null;
}

async function findById(id) {
  const rows = await query(
    `SELECT s.*,
            COALESCE(AVG(r.rating), 0) AS average_rating,
            COUNT(r.id) AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.id = ?
     GROUP BY s.id`,
    [id]
  );
  return rows[0] || null;
}

async function createStore({ name, email, address, ownerId = null }) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error('A store with this email already exists');
    err.status = 409;
    throw err;
  }

  let owner = null;
  if (ownerId) {
    const owners = await query(
      'SELECT id, role FROM users WHERE id = ? LIMIT 1',
      [Number(ownerId)]
    );
    if (!owners.length) {
      const err = new Error('Owner user not found');
      err.status = 400;
      throw err;
    }
    if (owners[0].role !== 'store_owner') {
      const err = new Error('Assigned owner must have the store_owner role');
      err.status = 400;
      throw err;
    }
    owner = owners[0].id;
  }

  const result = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES (?, ?, ?, ?)`,
    [trimString(name), normalizedEmail, trimString(address), owner]
  );

  const store = await findById(result.insertId);
  return mapStore(store);
}

function buildStoreFilters(filters = {}) {
  const where = [];
  const params = [];

  if (filters.name) {
    where.push('s.name LIKE ?');
    params.push(`%${filters.name}%`);
  }
  if (filters.email) {
    where.push('s.email LIKE ?');
    params.push(`%${normalizeEmail(filters.email)}%`);
  }
  if (filters.address) {
    where.push('s.address LIKE ?');
    params.push(`%${filters.address}%`);
  }

  return { where, params };
}

async function listStores(filters = {}, options = {}) {
  const { where, params } = buildStoreFilters(filters);
  const userId = options.userId || null;

  const allowedSort = {
    name: 's.name',
    email: 's.email',
    address: 's.address',
    average_rating: 'average_rating',
    created_at: 's.created_at',
  };
  const sortCol = allowedSort[filters.sortBy] || 's.name';
  const sortOrder = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';

  const userRatingJoin = userId
    ? 'LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = ?'
    : '';
  const userRatingSelect = userId ? ', ur.rating AS user_rating' : '';
  if (userId) params.unshift(userId);

  const sql = `
    SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
           COALESCE(AVG(r.rating), 0) AS average_rating,
           COUNT(r.id) AS rating_count
           ${userRatingSelect}
    FROM stores s
    LEFT JOIN ratings r ON r.store_id = s.id
    ${userRatingJoin}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY s.id${userId ? ', ur.rating' : ''}
    ORDER BY ${sortCol} ${sortOrder}
  `;

  const rows = await query(sql, params);
  return rows.map((row) => mapStore(row));
}

async function listStoresAdmin(filters = {}) {
  const { where, params } = buildStoreFilters(filters);
  const allowedSort = {
    name: 's.name',
    email: 's.email',
    address: 's.address',
    average_rating: 'average_rating',
    created_at: 's.created_at',
  };
  const sortCol = allowedSort[filters.sortBy] || 's.created_at';
  const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

  const sql = `
    SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at, s.updated_at,
           u.name AS owner_name, u.email AS owner_email,
           COALESCE(AVG(r.rating), 0) AS average_rating,
           COUNT(r.id) AS rating_count
    FROM stores s
    LEFT JOIN users u ON u.id = s.owner_id
    LEFT JOIN ratings r ON r.store_id = s.id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    GROUP BY s.id, u.name, u.email
    ORDER BY ${sortCol} ${sortOrder}
  `;

  const rows = await query(sql, params);
  return rows.map((row) => mapStore(row, true));
}

async function countStores() {
  const rows = await query('SELECT COUNT(*) AS total FROM stores');
  return rows[0].total;
}

async function getStoreByOwnerId(ownerId) {
  const rows = await query(
    `SELECT s.*,
            COALESCE(AVG(r.rating), 0) AS average_rating,
            COUNT(r.id) AS rating_count
     FROM stores s
     LEFT JOIN ratings r ON r.store_id = s.id
     WHERE s.owner_id = ?
     GROUP BY s.id
     LIMIT 1`,
    [ownerId]
  );
  return rows[0] ? mapStore(rows[0]) : null;
}

async function getStoreRatingsForOwner(ownerId) {
  const store = await getStoreByOwnerId(ownerId);
  if (!store) {
    const err = new Error('No store is linked to this owner account');
    err.status = 404;
    throw err;
  }

  const ratings = await query(
    `SELECT r.id, r.rating, r.created_at, r.updated_at,
            u.id AS user_id, u.name AS user_name, u.email AS user_email, u.address AS user_address
     FROM ratings r
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.store_id = ?
     ORDER BY r.updated_at DESC`,
    [store.id]
  );

  return {
    store,
    ratings: ratings.map((r) => ({
      id: r.id,
      rating: r.rating,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      user: {
        id: r.user_id,
        name: r.user_name,
        email: r.user_email,
        address: r.user_address,
      },
    })),
  };
}

module.exports = {
  mapStore,
  findByEmail,
  findById,
  createStore,
  listStores,
  listStoresAdmin,
  countStores,
  getStoreByOwnerId,
  getStoreRatingsForOwner,
};
