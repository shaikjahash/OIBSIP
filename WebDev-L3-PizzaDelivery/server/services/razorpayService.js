const Razorpay = require('razorpay');
const crypto = require('crypto');

let instance = null;

function getRazorpayInstance() {
  if (instance) return instance;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay keys are not configured in the environment');
  }
  instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return instance;
}

async function createRazorpayOrder({ amountInRupees, receipt }) {
  const razorpay = getRazorpayInstance();
  return razorpay.orders.create({
    amount: Math.round(amountInRupees * 100), // paise
    currency: 'INR',
    receipt,
  });
}

// Verifies the HMAC signature Razorpay returns after a successful checkout,
// per their standard server-side verification recipe. Never trust the
// frontend's "payment succeeded" claim alone.
function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return expected === razorpaySignature;
}

module.exports = { createRazorpayOrder, verifyPaymentSignature };
