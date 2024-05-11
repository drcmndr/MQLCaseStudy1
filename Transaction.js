// Transaction.js

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  beatId: String,
  beatName: String,
  licenseType: String,
  price: Number,
  userId: String,
  userName: String,
  userEmail: String,
  datePurchased: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
