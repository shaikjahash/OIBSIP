const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    pizza: { type: mongoose.Schema.Types.ObjectId, ref: 'Pizza' }, // null for fully custom builds
    name: { type: String, required: true }, // snapshot name at order time
    base: {
      ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Base' },
      name: String,
      price: Number,
    },
    sauce: {
      ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Sauce' },
      name: String,
      price: Number,
    },
    cheese: {
      ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Cheese' },
      name: String,
      price: Number,
    },
    vegetables: [
      {
        ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Vegetable' },
        name: String,
        price: Number,
      },
    ],
    quantity: { type: Number, required: true, min: 1, default: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'baking',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: (v) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    deliveryAddress: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      phone: String,
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        changedAt: { type: Date, default: Date.now },
      },
    ],
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    estimatedDeliveryAt: Date,
  },
  { timestamps: true }
);

orderSchema.pre('save', function trackStatusHistory(next) {
  if (this.isModified('status') || this.isNew) {
    this.statusHistory.push({ status: this.status, changedAt: new Date() });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
