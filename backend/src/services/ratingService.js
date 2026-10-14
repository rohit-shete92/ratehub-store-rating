const { query } = require('../config/db');
const storeService = require('./storeService');

async function countRatings() {
  const rows = await query('SELECT COUNT(*) AS total FROM ratings');
  return rows[0].total;
}

async function upsertRating(userId, storeId, rating) {
  const store = await storeService.findById(storeId);
  if (!store) {
    const err = new Error('Store not found');
    err.status = 404;
    throw err;
  }

  const existing = await query(
    'SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ? LIMIT 1',
    [userId, storeId]
  );

  let result;
  if (existing.length) {
    await query('UPDATE ratings SET rating = ? WHERE id = ?', [rating, existing[0].id]);
    result = {
      id: existing[0].id,
      userId,
      storeId,
      rating,
      updated: true,
    };
  } else {
    const insert = await query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
      [userId, storeId, rating]
    );
    result = {
      id: insert.insertId,
      userId,
      storeId,
      rating,
      updated: false,
    };
  }

  const updatedStore = await storeService.findById(storeId);
  return {
    ...result,
    store: storeService.mapStore(updatedStore),
  };
}

async function getUserRatingForStore(userId, storeId) {
  const rows = await query(
    'SELECT id, rating, created_at, updated_at FROM ratings WHERE user_id = ? AND store_id = ? LIMIT 1',
    [userId, storeId]
  );
  if (!rows.length) return null;
  return {
    id: rows[0].id,
    rating: rows[0].rating,
    createdAt: rows[0].created_at,
    updatedAt: rows[0].updated_at,
  };
}

module.exports = {
  countRatings,
  upsertRating,
  getUserRatingForStore,
};
