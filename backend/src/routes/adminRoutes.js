const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createUserRules,
  createStoreRules,
  idParam,
  userListQuery,
  storeListQuery,
} = require('../validators/rules');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.getDashboard);

router.post('/users', createUserRules, adminController.createUser);
router.get('/users', userListQuery, adminController.listUsers);
router.get('/users/:id', idParam, adminController.getUser);

router.post('/stores', createStoreRules, adminController.createStore);
router.get('/stores', storeListQuery, adminController.listStores);

module.exports = router;
