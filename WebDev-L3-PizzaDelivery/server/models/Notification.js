const mongoose = require('mongoose');

// Admin-facing notifications, primarily used for low/out-of-stock alerts.
const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOW_STOCK', 'OUT_OF_STOCK', 'NEW_ORDER', 'SYSTEM'],
      required: true,
    },
    message: { type: String, required: true },
    itemType: { type: String, enum: ['Base', 'Sauce', 'Cheese', 'Vegetable', null], default: null },
    item: { type: mongoose.Schema.Types.ObjectId, refPath: 'itemType' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
