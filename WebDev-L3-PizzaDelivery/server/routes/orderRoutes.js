const express = require('express');
const { createOrder, myOrders, getOrder, allOrders, updateStatus } = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, createOrder);
router.get('/mine', requireAuth, myOrders);
router.get('/admin/all', requireAuth, requireAdmin, allOrders);
router.get('/:id', requireAuth, getOrder);
router.patch('/:id/status', requireAuth, requireAdmin, updateStatus);

module.exports = router;
