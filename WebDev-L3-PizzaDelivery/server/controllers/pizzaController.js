const Pizza = require('../models/Pizza');

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

exports.listPizzas = asyncHandler(async (req, res) => {
  const pizzas = await Pizza.find({ isAvailable: true })
    .populate('defaultBase defaultSauce defaultCheese defaultVegetables')
    .sort('name');
  res.json({ pizzas });
});

exports.listPizzasAdmin = asyncHandler(async (req, res) => {
  const pizzas = await Pizza.find().sort('name');
  res.json({ pizzas });
});

exports.getPizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.findById(req.params.id).populate(
    'defaultBase defaultSauce defaultCheese defaultVegetables'
  );
  if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
  res.json({ pizza });
});

exports.createPizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.create(req.body);
  res.status(201).json({ pizza });
});

exports.updatePizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
  res.json({ pizza });
});

exports.deletePizza = asyncHandler(async (req, res) => {
  const pizza = await Pizza.findByIdAndUpdate(req.params.id, { isAvailable: false }, { new: true });
  if (!pizza) return res.status(404).json({ message: 'Pizza not found' });
  res.json({ message: 'Pizza removed from menu', pizza });
});
