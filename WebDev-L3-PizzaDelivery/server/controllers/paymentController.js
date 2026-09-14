const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/razorpayService');
const { emitOrderStatusUpdate } = require('../services/socketService');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// POST /api/payments/create — creates a Razorpay order for an existing pizza order
exports.createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  if (order.status !== 'pending') {
    return res.status(400).json({ message: 'This order is not awaiting payment' });
  }

  const razorpayOrder = await createRazorpayOrder({
    amountInRupees: order.total,
    receipt: order._id.toString(),
  });

  const payment = await Payment.create({
    order: order._id,
    user: req.user._id,
    razorpayOrderId: razorpayOrder.id,
    amount: order.total,
    status: 'created',
  });

  order.payment = payment._id;
  await order.save();

  res.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order._id,
  });
});

// POST /api/payments/verify — verifies signature after Razorpay checkout succeeds
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const isValid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!isValid) {
    await Payment.findOneAndUpdate({ razorpayOrderId }, { status: 'failed' });
    return res.status(400).json({ message: 'Payment verification failed' });
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    { razorpayPaymentId, razorpaySignature, status: 'paid' },
    { new: true }
  );
  if (!payment) return res.status(404).json({ message: 'Payment record not found' });

  const order = await Order.findById(orderId || payment.order);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = 'confirmed';
  await order.save();

  try {
    emitOrderStatusUpdate(order);
  } catch (err) {
    // non-fatal
  }

  res.json({ message: 'Payment verified. Order confirmed!', order, payment });
});
