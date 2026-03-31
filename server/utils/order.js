const { v4: uuidv4 } = require("uuid");

/**
 * Generate a unique, human-readable Order ID
 * Format: SSS-YYYYMMDD-XXXXXXXX
 * Example: SSS-20240615-A3F7B2C1
 */
const generateOrderId = () => {
  const date = new Date();
  const datePart = date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0");

  const randomPart = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
  return `SSS-${datePart}-${randomPart}`;
};

/**
 * Generate a WhatsApp redirect URL with pre-filled message
 * @param {string} phone - WhatsApp number (with country code, no +)
 * @param {string} message - Pre-filled message text
 * @returns {string} WhatsApp URL
 */
const generateWhatsAppURL = (phone, message) => {
  const encoded = encodeURIComponent(message);
  // Normalize: remove +, spaces, dashes
  const cleanPhone = phone.replace(/[\s+\-()]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
};

/**
 * Build the standard WhatsApp order message
 */
const buildOrderMessage = ({ phone, userId, amount, orderId }) => {
  return `Hello Admin,\nUser: ${phone} (ID: ${userId})\nAmount: ₹${amount}\nOrder ID: #${orderId}`;
};

/**
 * Pick a random WhatsApp number from the settings array
 * @param {string[]} numbers
 * @returns {string}
 */
const pickRandomWhatsApp = (numbers) => {
  if (!numbers || numbers.length === 0) return null;
  return numbers[Math.floor(Math.random() * numbers.length)];
};

module.exports = {
  generateOrderId,
  generateWhatsAppURL,
  buildOrderMessage,
  pickRandomWhatsApp,
};
