const ratingService = require('../services/ratingService');
const { success, error } = require('../utils/response');

async function submitOrUpdateRating(req, res, next) {
  try {
    const storeId = Number(req.params.storeId);
    const { rating } = req.body;

    const result = await ratingService.upsertRating(req.user.id, storeId, rating);
    const message = result.updated ? 'Rating updated successfully' : 'Rating submitted successfully';
    return success(res, { rating: result }, message, result.updated ? 200 : 201);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    return next(err);
  }
}

async function getMyRating(req, res, next) {
  try {
    const storeId = Number(req.params.storeId);
    const rating = await ratingService.getUserRatingForStore(req.user.id, storeId);
    return success(res, { rating }, rating ? 'Rating found' : 'No rating yet');
  } catch (err) {
    return next(err);
  }
}

module.exports = { submitOrUpdateRating, getMyRating };
