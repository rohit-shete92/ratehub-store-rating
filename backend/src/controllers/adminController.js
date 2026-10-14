const userService = require('../services/userService');
const storeService = require('../services/storeService');
const ratingService = require('../services/ratingService');
const { success, error } = require('../utils/response');

async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      userService.countUsers(),
      storeService.countStores(),
      ratingService.countRatings(),
    ]);

    return success(res, { totalUsers, totalStores, totalRatings }, 'Dashboard statistics');
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, address, role } = req.body;
    const user = await userService.createUser({ name, email, password, address, role });
    return success(res, { user: userService.sanitizeUser(user) }, 'User created successfully', 201);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    return next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers({
      name: req.query.name,
      email: req.query.email,
      address: req.query.address,
      role: req.query.role || undefined,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    });
    return success(res, { users }, 'Users retrieved');
  } catch (err) {
    return next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const details = await userService.getUserDetails(req.params.id);
    if (!details) {
      return error(res, 'User not found', 404);
    }
    return success(res, { user: details }, 'User details');
  } catch (err) {
    return next(err);
  }
}

async function createStore(req, res, next) {
  try {
    const { name, email, address, ownerId } = req.body;
    const store = await storeService.createStore({
      name,
      email,
      address,
      ownerId: ownerId === '' || ownerId === undefined ? null : ownerId,
    });
    return success(res, { store }, 'Store created successfully', 201);
  } catch (err) {
    if (err.status) return error(res, err.message, err.status);
    return next(err);
  }
}

async function listStores(req, res, next) {
  try {
    const stores = await storeService.listStoresAdmin({
      name: req.query.name,
      email: req.query.email,
      address: req.query.address,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    });
    return success(res, { stores }, 'Stores retrieved');
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDashboard,
  createUser,
  listUsers,
  getUser,
  createStore,
  listStores,
};
