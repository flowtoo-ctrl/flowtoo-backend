// utils/payfast.js
const crypto = require("crypto");

exports.generatePayFastUrl = (order, user) => {
  const paymentData = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY,
    return_url: process.env.PAYFAST_RETURN_URL,
    cancel_url: process.env.PAYFAST_CANCEL_URL,
    notify_url: process.env.PAYFAST_NOTIFY_URL,
    m_payment_id: order._id.toString(),
    amount: Number(order.totalPrice).toFixed(2),
    item_name: `Order ${order._id}`,
    email_address: user.email,
  };

  const pfDataString = Object.entries(paymentData)
    .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`)
    .join("&");

  const signature = crypto.createHash("md5").update(pfDataString).digest("hex");

  return `https://sandbox.payfast.co.za/eng/process?${pfDataString}&signature=${signature}`;
};