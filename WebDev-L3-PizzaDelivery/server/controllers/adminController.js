const Order = require('../models/Order');
const { Base, Sauce, Cheese, Vegetable } = require('../models/Ingredient');
const Pizza = require('../models/Pizza');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

// GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const [totalOrders, pendingOrders, completedOrders, revenueAgg, availablePizzas] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['pending', 'confirmed', 'preparing', 'baking', 'out_for_delivery'] } }),
    Order.countDocuments({ status: 'delivered' }),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Pizza.countDocuments({ isAvailable: true }),
  ]);

  const ingredientModels = [
    { Model: Base, type: 'Base' },
    { Model: Sauce, type: 'Sauce' },
    { Model: Cheese, type: 'Cheese' },
    { Model: Vegetable, type: 'Vegetable' },
  ];

  let lowStockCount = 0;
  let outOfStockCount = 0;
  for (const { Model } of ingredientModels) {
    const [low, out] = await Promise.all([
      Model.countDocuments({ isActive: true, stockQuantity: { $gt: 0, $lte: 10 } }),
      Model.countDocuments({ isActive: true, stockQuantity: { $lte: 0 } }),
    ]);
    lowStockCount += low;
    outOfStockCount += out;
  }

  res.json({
    totalOrders,
    pendingOrders,
    completedOrders,
    revenue: revenueAgg[0]?.total || 0,
    availablePizzas,
    lowStockCount,
    outOfStockCount,
  });
});
