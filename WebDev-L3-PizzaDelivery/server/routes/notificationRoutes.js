const express = require('express');
const Notification = require('../models/Notification');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const notifications = await Notification.find().sort('-createdAt').limit(50);
      res.json({ notifications });
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  '/:id/read',
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
      );
      if (!notification) return res.status(404).json({ message: 'Notification not found' });
      res.json({ notification });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
