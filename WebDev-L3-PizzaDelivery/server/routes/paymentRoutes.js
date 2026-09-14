const express = require('express');
const { createPaymentOrder, verifyPayment } = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/create', requireAuth, createPaymentOrder);
router.post('/verify', requireAuth, verifyPayment);

module.exports = router;
