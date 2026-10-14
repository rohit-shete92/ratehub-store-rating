const express = require('express');
const storeController = require('../controllers/storeController');
const ratingController = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');
const { storeListQuery, ratingRules, idParam } = require('../validators/rules');
const { param } = require('express-validator');
const { validate } = require('../validators/rules');

const router = express.Router();

const storeIdParam = [
  param('storeId').isInt({ min: 1 }).withMessage('Invalid store id').toInt(),
  validate,
];

router.use(authenticate);

router.get('/', authorize('user', 'admin'), storeListQuery, storeController.listStores);
router.get('/:id', authorize('user', 'admin'), idParam, storeController.getStore);

router.post(
  '/:storeId/ratings',
  authorize('user'),
  storeIdParam,
  ratingRules,
  ratingController.submitOrUpdateRating
);

router.get(
  '/:storeId/ratings/me',
  authorize('user'),
  storeIdParam,
  ratingController.getMyRating
);

module.exports = router;
