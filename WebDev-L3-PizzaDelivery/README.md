# Forno — Pizza Delivery & Inventory Platform

A full-stack pizza ordering and inventory management platform built for OIBSIP Level 3.

## Project Overview

Forno lets customers build custom pizzas step-by-step (base → sauce → cheese → vegetables),
pay via Razorpay (test mode), and track their order in real time. Admins get a separate
dashboard to manage inventory, pizzas, orders, and stock alerts.

## Features

- Email-verified registration, JWT login, forgot/reset password flow
- Multi-step pizza customizer with live, server-validated pricing
- Cart → checkout → Razorpay test-mode payment → order confirmation
- Real-time order-status tracking via Socket.IO
- Role-based admin dashboard: stats, order management, inventory (stock + pricing),
  pizza catalog management, and automated low-stock notifications
- Backend-enforced authorization on every admin route (not just frontend hiding)

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Socket.IO client, Axios
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB (Mongoose)
- **Payments:** Razorpay (test mode)
- **Email:** Nodemailer (Ethereal test inbox in development, or real SMTP via env vars)

## Project Structure

```
pizza-delivery-platform/
├── client/    React frontend (Vite)
└── server/    Express backend (REST API + Socket.IO)
```

## Installation

### 1. Backend

```bash
cd server
npm install
cp .env.example .env   # fill in the values below
npm run seed            # populates catalog + creates an admin account
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

## Environment Variables (server/.env)

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/pizza_platform
JWT_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

EMAIL_HOST=            # leave blank to auto-use an Ethereal test inbox
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="Forno Pizza <no-reply@fornopizza.com>"

RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret_here

LOW_STOCK_THRESHOLD=10
```

## Database Setup

Requires a running MongoDB instance (local via MongoDB Compass/mongod, or Atlas).
Run `npm run seed` from `server/` once connected to populate:
- 5 bases, 5 sauces, 4 cheeses, 7 vegetables
- 6 signature pizzas
- One admin account: `admin@fornopizza.com` / `Admin@12345` (change this password immediately)

## Razorpay Test Mode

Use your Razorpay **test** API keys only. On the checkout screen, use any Razorpay
test card (e.g. `4111 1111 1111 1111`, any future expiry, any CVV) or click "Success"
directly in the test checkout modal to simulate a completed payment.

## Admin Setup

Log in with the seeded admin account, or promote any user by setting `role: 'admin'`
directly in the `users` collection. Admin routes are protected server-side regardless
of frontend routing.

## User Flow

Register → verify email → log in → browse menu or build a custom pizza → add to cart →
enter delivery address → pay via Razorpay → track order status in real time.

## Future Improvements

- Order history export / receipts (PDF)
- Coupon and loyalty-points system
- Delivery partner assignment and live GPS tracking
- Multi-address book per user
