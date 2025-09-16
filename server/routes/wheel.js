const express = require('express');
const { getWheel, spinWheel, addWheel } = require('../controllers/wheelController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getWheel);
router.post('/spin', requireAuth, spinWheel);
router.post('/add', requireAuth, addWheel);

module.exports = router;