const express = require('express');
const { Base, Sauce, Cheese, Vegetable } = require('../models/Ingredient');
const { buildIngredientController } = require('../controllers/ingredientController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

function buildRouter(Model, itemType) {
  const router = express.Router();
  const c = buildIngredientController(Model, itemType);

  router.get('/', c.listPublic);
  router.get('/admin', requireAuth, requireAdmin, c.listAdmin);
  router.post('/', requireAuth, requireAdmin, c.create);
  router.patch('/:id', requireAuth, requireAdmin, c.update);
  router.patch('/:id/stock', requireAuth, requireAdmin, c.adjustStock);
  router.delete('/:id', requireAuth, requireAdmin, c.remove);

  return router;
}

module.exports = {
  baseRoutes: buildRouter(Base, 'Base'),
  sauceRoutes: buildRouter(Sauce, 'Sauce'),
  cheeseRoutes: buildRouter(Cheese, 'Cheese'),
  vegetableRoutes: buildRouter(Vegetable, 'Vegetable'),
};
