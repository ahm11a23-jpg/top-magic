const mongoose = require('mongoose');

// هذا هو "شكل" المنتج في قاعدة البيانات
const productSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  image:    { type: String, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('Product', productSchema);