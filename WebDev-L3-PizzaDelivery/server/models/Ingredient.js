const mongoose = require('mongoose');

/**
 * Shared schema shape for the four customizable pizza-component types
 * (Base, Sauce, Cheese, Vegetable). Each is stored in its own collection
 * so admins can manage stock/pricing per category independently.
 */
function buildIngredientSchema() {
  return new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, trim: true, default: '' },
      image: { type: String, default: '' },
      price: { type: Number, required: true, min: 0, default: 0 }, // price delta added to pizza
      stockQuantity: { type: Number, required: true, min: 0, default: 50 },
      lowStockThreshold: { type: Number, required: true, min: 0, default: 10 },
      isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
  );
}

const baseSchema = buildIngredientSchema();
const sauceSchema = buildIngredientSchema();
const cheeseSchema = buildIngredientSchema();
const vegetableSchema = buildIngredientSchema();

// Virtual stock status shared across all four models.
[baseSchema, sauceSchema, cheeseSchema, vegetableSchema].forEach((schema) => {
  schema.virtual('stockStatus').get(function stockStatus() {
    if (this.stockQuantity <= 0) return 'OUT_OF_STOCK';
    if (this.stockQuantity <= this.lowStockThreshold) return 'LOW_STOCK';
    return 'IN_STOCK';
  });
  schema.set('toJSON', { virtuals: true });
});

module.exports = {
  Base: mongoose.model('Base', baseSchema),
  Sauce: mongoose.model('Sauce', sauceSchema),
  Cheese: mongoose.model('Cheese', cheeseSchema),
  Vegetable: mongoose.model('Vegetable', vegetableSchema),
};
