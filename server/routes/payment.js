const express = require('express');
const { confirmPayment, getPaymentHistory, getDepositInfo } = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/confirm', requireAuth, confirmPayment);
router.get('/history', requireAuth, getPaymentHistory);
router.get('/info', requireAuth, getDepositInfo);

module.exports = router;