const mongoose = require('mongoose');
const Order = require('../models/Order');
const { buildPricedItems } = require('../services/pricingService');
const { checkAndNotifyStock } = require('./ingredientController');
const { emitOrderStatusUpdate, emitNewOrder } = require('../services/socketService');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

const STATUS_ETA_MINUTES = { pending: 45, confirmed: 40, preparing: 30, baking: 20, out_for_delivery: 10 };

// POST /api/orders — price, validate stock, decrement stock, create order (status: pending)
exports.createOrder = asyncHandler(async (req, res) => {
  const { items: rawItems, deliveryAddress } = req.body;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return res.status(400).json({ message: 'Your order has no items' });
  }
  if (!deliveryAddress || !deliveryAddress.line1 || !deliveryAddress.city) {
    return res.status(400).json({ message: 'A delivery address is required' });
  }

  const { items, subtotal, deliveryFee, total, stockDeductions, quantities } = await buildPricedItems(rawItems);

  // Decrement stock for every ingredient used, scaled by each item's quantity.
  let deductionIndex = 0;
  for (let itemIdx = 0; itemIdx < items.length; itemIdx++) {
    const qty = quantities[itemIdx];
    const perItemDeductionCount = 3 + items[itemIdx].vegetables.length; // base+sauce+cheese+vegs
    for (let k = 0; k < perItemDeductionCount; k++) {
      const { Model, id, itemType } = stockDeductions[deductionIndex++];
      const doc = await Model.findById(id);
      doc.stockQuantity = Math.max(0, doc.stockQuantity - qty);
      await doc.save();
      await checkAndNotifyStock(doc, itemType);
    }
    delete items[itemIdx]._quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress,
    status: 'pending',
    estimatedDeliveryAt: new Date(Date.now() + STATUS_ETA_MINUTES.pending * 60 * 1000),
  });

  try {
    emitNewOrder(order);
  } catch (err) {
    // socket not critical to order success
  }

  res.status(201).json({ order });
});

// GET /api/orders/mine
exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json({ orders });
});

// GET /api/orders/:id — owner or admin only
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('payment');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized to view this order' });
  }
  res.json({ order });
});

// GET /api/orders/admin/all
exports.allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  res.json({ orders });
});

// PATCH /api/orders/:id/status — admin only
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  if (STATUS_ETA_MINUTES[status]) {
    order.estimatedDeliveryAt = new Date(Date.now() + STATUS_ETA_MINUTES[status] * 60 * 1000);
  }
  await order.save();

  try {
    emitOrderStatusUpdate(order);
  } catch (err) {
    // non-fatal if sockets aren't connected
  }

  res.json({ order });
});
