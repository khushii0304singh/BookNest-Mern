const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  author: { type: String, required: true, trim: true, maxlength: 100 },
  genre: { type: String, required: true, trim: true, maxlength: 40 },
  coverUrl: { type: String, trim: true, default: '' },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Book', bookSchema);
