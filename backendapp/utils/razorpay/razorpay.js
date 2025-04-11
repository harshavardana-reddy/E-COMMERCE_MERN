// utils/razorpayUtils.js
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const generateOrder = async (amount, currency = 'INR') => {
  const options = {
    amount: amount * 100, // Convert to paise (₹1 = 100 paise)
    currency,
    receipt: `receipt_${Date.now()}`,
    payment_capture: 1 // Auto-capture payment
  };
  return await razorpay.orders.create(options);
};

const verifySignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
    
  return expectedSignature === razorpay_signature;
};

module.exports = {
  razorpay,
  generateOrder,
  verifySignature
};