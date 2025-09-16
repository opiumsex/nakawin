const express = require('express');
const { getInventory, sellItem, withdrawItem, getInventoryStats } = require('../controllers/inventoryController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getInventory);
router.post('/sell', requireAuth, sellItem);
router.post('/withdraw', requireAuth, withdrawItem);
router.get('/stats', requireAuth, getInventoryStats);

module.exports = router;