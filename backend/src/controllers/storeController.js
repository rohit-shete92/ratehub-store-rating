const storeService = require('../services/storeService');
const { success, error } = require('../utils/response');

async function listStores(req, res, next) {
  try {
    const stores = await storeService.listStores(
      {
        name: req.query.name,
        email: req.query.email,
        address: req.query.address,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      },
      { userId: req.user.id }
    );
    return success(res, { stores }, 'Stores retrieved');
  } catch (err) {
    return next(err);
  }
}

async function getStore(req, res, next) {
  try {
    const stores = await storeService.listStores(
      {},
      { userId: req.user.id }
    );
    const match = stores.find((s) => s.id === Number(req.params.id));
    if (!match) {
      return error(res, 'Store not found', 404);
    }
    return success(res, { store: match }, 'Store details');
  } catch (err) {
    return next(err);
  }
}

module.exports = { listStores, getStore };
