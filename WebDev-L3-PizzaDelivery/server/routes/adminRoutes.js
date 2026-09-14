const express = require('express');
const { getStats } = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAuth, requireAdmin, getStats);

module.exports = router;
