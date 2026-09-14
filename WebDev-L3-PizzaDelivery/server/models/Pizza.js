const mongoose = require('mongoose');

// Represents a pre-configured "signature" pizza shown on the dashboard.
// Custom-built pizzas are stored directly on the Order, not here.
const pizzaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['classic', 'specialty', 'vegetarian', 'spicy'],
      default: 'classic',
    },
    defaultBase: { type: mongoose.Schema.Types.ObjectId, ref: 'Base' },
    defaultSauce: { type: mongoose.Schema.Types.ObjectId, ref: 'Sauce' },
    defaultCheese: { type: mongoose.Schema.Types.ObjectId, ref: 'Cheese' },
    defaultVegetables: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vegetable' }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Pizza', pizzaSchema);
