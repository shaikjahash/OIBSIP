require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { Base, Sauce, Cheese, Vegetable } = require('../models/Ingredient');
const Pizza = require('../models/Pizza');

async function seed() {
  await connectDB();

  console.log('Clearing existing catalog data...');
  await Promise.all([
    Base.deleteMany({}),
    Sauce.deleteMany({}),
    Cheese.deleteMany({}),
    Vegetable.deleteMany({}),
    Pizza.deleteMany({}),
  ]);

  const bases = await Base.insertMany([
    { name: 'Thin Crust', description: 'Crisp, light, and delicately charred', price: 0, image: '/images/base-thin.jpg', stockQuantity: 80 },
    { name: 'Classic Hand-Tossed', description: 'Soft centre with an airy, chewy edge', price: 0, image: '/images/base-classic.jpg', stockQuantity: 80 },
    { name: 'Whole Wheat', description: 'Nutty and wholesome, baked fresh daily', price: 30, image: '/images/base-wheat.jpg', stockQuantity: 60 },
    { name: 'Cheese Burst', description: 'Molten mozzarella baked into the crust', price: 80, image: '/images/base-cheeseburst.jpg', stockQuantity: 50 },
    { name: 'Gluten-Free', description: 'Rice-flour base, light and crisp', price: 60, image: '/images/base-glutenfree.jpg', stockQuantity: 30 },
  ]);

  const sauces = await Sauce.insertMany([
    { name: 'San Marzano Tomato', description: 'Slow-simmered vine-ripened tomatoes', price: 0, image: '/images/sauce-tomato.jpg', stockQuantity: 100 },
    { name: 'Roasted Garlic Alfredo', description: 'Creamy, rich, and deeply savoury', price: 25, image: '/images/sauce-alfredo.jpg', stockQuantity: 70 },
    { name: 'Spicy Arrabbiata', description: 'Tomato base with red chilli and garlic', price: 20, image: '/images/sauce-arrabbiata.jpg', stockQuantity: 70 },
    { name: 'Basil Pesto', description: 'Fresh basil, pine nuts, and olive oil', price: 30, image: '/images/sauce-pesto.jpg', stockQuantity: 50 },
    { name: 'Barbecue', description: 'Smoky and sweet, chargrilled flavour', price: 25, image: '/images/sauce-bbq.jpg', stockQuantity: 60 },
  ]);

  const cheeses = await Cheese.insertMany([
    { name: 'Mozzarella', description: 'Classic milky, gooey stretch', price: 0, image: '/images/cheese-mozzarella.jpg', stockQuantity: 100 },
    { name: 'Cheddar Blend', description: 'Sharp and golden when baked', price: 25, image: '/images/cheese-cheddar.jpg', stockQuantity: 80 },
    { name: 'Parmesan Shavings', description: 'Nutty, salty, aged finish', price: 35, image: '/images/cheese-parmesan.jpg', stockQuantity: 40 },
    { name: 'Four Cheese Blend', description: 'Mozzarella, cheddar, parmesan & provolone', price: 50, image: '/images/cheese-fourcheese.jpg', stockQuantity: 8 },
  ]);

  const vegetables = await Vegetable.insertMany([
    { name: 'Onion', description: 'Sweet and crunchy', price: 10, image: '/images/veg-onion.jpg', stockQuantity: 100 },
    { name: 'Capsicum', description: 'Crisp bell pepper', price: 10, image: '/images/veg-capsicum.jpg', stockQuantity: 100 },
    { name: 'Tomato', description: 'Juicy fresh slices', price: 10, image: '/images/veg-tomato.jpg', stockQuantity: 100 },
    { name: 'Mushroom', description: 'Earthy sautéed button mushroom', price: 20, image: '/images/veg-mushroom.jpg', stockQuantity: 60 },
    { name: 'Sweet Corn', description: 'Golden and naturally sweet', price: 15, image: '/images/veg-corn.jpg', stockQuantity: 90 },
    { name: 'Jalapeño', description: 'Bright pickled heat', price: 15, image: '/images/veg-jalapeno.jpg', stockQuantity: 50 },
    { name: 'Black Olives', description: 'Briny Mediterranean olives', price: 20, image: '/images/veg-olives.jpg', stockQuantity: 5 },
  ]);

  const byName = (arr) => Object.fromEntries(arr.map((d) => [d.name, d]));
  const B = byName(bases);
  const S = byName(sauces);
  const C = byName(cheeses);
  const V = byName(vegetables);

  await Pizza.insertMany([
    {
      name: 'Margherita Classica',
      description: 'San Marzano tomato, fresh mozzarella, and basil on a hand-tossed base',
      basePrice: 249,
      category: 'classic',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
      defaultBase: B['Classic Hand-Tossed']._id,
      defaultSauce: S['San Marzano Tomato']._id,
      defaultCheese: C['Mozzarella']._id,
      defaultVegetables: [V['Tomato']._id],
    },
    {
      name: 'Farmhouse Veggie',
      description: 'Onion, capsicum, tomato, and mushroom over a classic base',
      basePrice: 299,
      category: 'vegetarian',
      image: 'https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=600&q=80',
      defaultBase: B['Classic Hand-Tossed']._id,
      defaultSauce: S['San Marzano Tomato']._id,
      defaultCheese: C['Mozzarella']._id,
      defaultVegetables: [V['Onion']._id, V['Capsicum']._id, V['Tomato']._id, V['Mushroom']._id],
    },
    {
      name: 'Spicy Jalapeño Fiesta',
      description: 'Arrabbiata sauce, cheddar blend, jalapeño, and sweet corn',
      basePrice: 329,
      category: 'spicy',
      image: 'https://images.unsplash.com/photo-1600028068383-ea11a7a101f3?w=600&q=80',
      defaultBase: B['Thin Crust']._id,
      defaultSauce: S['Spicy Arrabbiata']._id,
      defaultCheese: C['Cheddar Blend']._id,
      defaultVegetables: [V['Jalapeño']._id, V['Sweet Corn']._id],
    },
    {
      name: 'Four Cheese Deluxe',
      description: 'A rich blend of four cheeses over roasted garlic alfredo',
      basePrice: 379,
      category: 'specialty',
      image: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=600&q=80',
      defaultBase: B['Cheese Burst']._id,
      defaultSauce: S['Roasted Garlic Alfredo']._id,
      defaultCheese: C['Four Cheese Blend']._id,
      defaultVegetables: [],
    },
    {
      name: 'Pesto Garden',
      description: 'Basil pesto, parmesan, mushroom, and black olives',
      basePrice: 349,
      category: 'specialty',
      image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&q=80',
      defaultBase: B['Whole Wheat']._id,
      defaultSauce: S['Basil Pesto']._id,
      defaultCheese: C['Parmesan Shavings']._id,
      defaultVegetables: [V['Mushroom']._id, V['Black Olives']._id],
    },
    {
      name: 'Smoky BBQ Corn',
      description: 'Barbecue sauce, cheddar, sweet corn, and onion',
      basePrice: 319,
      category: 'classic',
      image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=600&q=80',
      defaultBase: B['Classic Hand-Tossed']._id,
      defaultSauce: S['Barbecue']._id,
      defaultCheese: C['Cheddar Blend']._id,
      defaultVegetables: [V['Sweet Corn']._id, V['Onion']._id],
    },
  ]);

  const adminEmail = 'admin@fornopizza.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: 'Forno Admin',
      email: adminEmail,
      password: 'Admin@12345',
      role: 'admin',
      isEmailVerified: true,
    });
    console.log(`Admin account created: ${adminEmail} / Admin@12345 (change this password!)`);
  } else {
    console.log('Admin account already exists, skipping.');
  }

  console.log('Seed complete: 5 bases, 5 sauces, 4 cheeses, 7 vegetables, 6 pizzas.');
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});