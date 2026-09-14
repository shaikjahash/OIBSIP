const { emitStockAlert } = require('../services/socketService');
const Notification = require('../models/Notification');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * Creates a standard CRUD controller for a given ingredient model
 * (Base, Sauce, Cheese, Vegetable). Keeps the four nearly-identical
 * routers from duplicating logic.
 */
function buildIngredientController(Model, itemType) {
  const listPublic = asyncHandler(async (req, res) => {
    const items = await Model.find({ isActive: true }).sort('name');
    res.json({ items });
  });

  const listAdmin = asyncHandler(async (req, res) => {
    const items = await Model.find().sort('name');
    res.json({ items });
  });

  const create = asyncHandler(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json({ item });
  });

  const update = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: `${itemType} not found` });

    await checkAndNotifyStock(item, itemType);
    res.json({ item });
  });

  const remove = asyncHandler(async (req, res) => {
    const item = await Model.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!item) return res.status(404).json({ message: `${itemType} not found` });
    res.json({ message: `${itemType} deactivated`, item });
  });

  // Dedicated stock-adjustment endpoint used by the admin inventory screen.
  const adjustStock = asyncHandler(async (req, res) => {
    const { delta, setTo } = req.body;
    const item = await Model.findById(req.params.id);
    if (!item) return res.status(404).json({ message: `${itemType} not found` });

    if (typeof setTo === 'number') {
      item.stockQuantity = Math.max(0, setTo);
    } else if (typeof delta === 'number') {
      item.stockQuantity = Math.max(0, item.stockQuantity + delta);
    } else {
      return res.status(400).json({ message: 'Provide either delta or setTo' });
    }

    await item.save();
    await checkAndNotifyStock(item, itemType);
    res.json({ item });
  });

  return { listPublic, listAdmin, create, update, remove, adjustStock };
}

async function checkAndNotifyStock(item, itemType) {
  const status = item.stockQuantity <= 0 ? 'OUT_OF_STOCK' : item.stockQuantity <= item.lowStockThreshold ? 'LOW_STOCK' : null;
  if (!status) return;

  const notification = await Notification.create({
    type: status,
    itemType,
    item: item._id,
    message: `${item.name} (${itemType}) is ${status === 'OUT_OF_STOCK' ? 'out of stock' : 'running low'} (${item.stockQuantity} left).`,
  });

  try {
    emitStockAlert(notification);
  } catch (err) {
    // Socket may not be initialized in some contexts (e.g. seed script) — safe to ignore.
  }
}

module.exports = { buildIngredientController, checkAndNotifyStock };
