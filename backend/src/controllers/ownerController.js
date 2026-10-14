const storeService = require('../services/storeService');
const { success, error } = require('../utils/response');

async function getDashboard(req, res, next) {
  try {
    const data = await storeService.getStoreRatingsForOwner(req.user.id);
    return success(
      res,
      {
        store: data.store,
        averageRating: data.store.averageRating,
        ratingCount: data.store.ratingCount,
        ratings: data.ratings,
      },
      'Owner dashboard'
    );
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    return next(err);
  }
}

module.exports = { getDashboard };
