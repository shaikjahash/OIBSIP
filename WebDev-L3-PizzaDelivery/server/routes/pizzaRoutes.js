const express = require('express');
const {
  listPizzas,
  listPizzasAdmin,
  getPizza,
  createPizza,
  updatePizza,
  deletePizza,
} = require('../controllers/pizzaController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', listPizzas);
router.get('/admin', requireAuth, requireAdmin, listPizzasAdmin);
router.get('/:id', getPizza);
router.post('/', requireAuth, requireAdmin, createPizza);
router.patch('/:id', requireAuth, requireAdmin, updatePizza);
router.delete('/:id', requireAuth, requireAdmin, deletePizza);

module.exports = router;
