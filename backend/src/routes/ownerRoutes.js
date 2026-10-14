const express = require('express');
const ownerController = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, authorize('store_owner'));
router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
