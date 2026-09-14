const { Base, Sauce, Cheese, Vegetable } = require('../models/Ingredient');
const Pizza = require('../models/Pizza');

const DELIVERY_FEE = 49;

/**
 * Takes raw item specs from the client (ids + quantity only) and returns
 * fully-priced, stock-checked order items built from authoritative DB data.
 * The client's price fields are never trusted — this is where the real
 * "dynamic pricing must not be hard-coded" requirement is enforced.
 */
async function buildPricedItems(rawItems) {
  const items = [];
  const stockDeductions = []; // { Model, id, itemType }

  for (const raw of rawItems) {
    const quantity = Math.max(1, Number(raw.quantity) || 1);

    let pizzaName = raw.name;
    let pizzaBasePrice = 0;
    if (raw.pizzaId) {
      const pizza = await Pizza.findById(raw.pizzaId);
      if (!pizza || !pizza.isAvailable) throw httpError(400, 'One of the selected pizzas is no longer available');
      pizzaName = pizza.name;
      pizzaBasePrice = pizza.basePrice;
    }

    const base = await fetchAndCheck(Base, raw.baseId, 'base');
    const sauce = await fetchAndCheck(Sauce, raw.sauceId, 'sauce');
    const cheese = await fetchAndCheck(Cheese, raw.cheeseId, 'cheese');

    const vegetables = [];
    for (const vegId of raw.vegetableIds || []) {
      const veg = await fetchAndCheck(Vegetable, vegId, 'vegetable');
      vegetables.push(veg);
      stockDeductions.push({ Model: Vegetable, id: veg._id, itemType: 'Vegetable' });
    }

    stockDeductions.push({ Model: Base, id: base._id, itemType: 'Base' });
    stockDeductions.push({ Model: Sauce, id: sauce._id, itemType: 'Sauce' });
    stockDeductions.push({ Model: Cheese, id: cheese._id, itemType: 'Cheese' });

    const unitPrice =
      pizzaBasePrice +
      base.price +
      sauce.price +
      cheese.price +
      vegetables.reduce((sum, v) => sum + v.price, 0);

    items.push({
      pizza: raw.pizzaId || undefined,
      name: pizzaName || 'Custom Pizza',
      base: { ref: base._id, name: base.name, price: base.price },
      sauce: { ref: sauce._id, name: sauce.name, price: sauce.price },
      cheese: { ref: cheese._id, name: cheese.name, price: cheese.price },
      vegetables: vegetables.map((v) => ({ ref: v._id, name: v.name, price: v.price })),
      quantity,
      unitPrice,
      lineTotal: unitPrice * quantity,
      _quantity: quantity, // used below for stock decrement multiplier
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return { items, subtotal, deliveryFee, total, stockDeductions, quantities: items.map((i) => i._quantity) };
}

async function fetchAndCheck(Model, id, label) {
  if (!id) throw httpError(400, `Please select a ${label}`);
  const doc = await Model.findById(id);
  if (!doc || !doc.isActive) throw httpError(400, `Selected ${label} is unavailable`);
  if (doc.stockQuantity <= 0) throw httpError(409, `${doc.name} is out of stock`);
  return doc;
}

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = { buildPricedItems, DELIVERY_FEE };
