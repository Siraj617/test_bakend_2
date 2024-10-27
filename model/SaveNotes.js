const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  title: { type: String, required: true },
  keyPoint: { type: String },
  description: { type: String, required: true },
  createdAt: { type: Date, required: true }, // Store date as string
}, { timestamps: true });

const Savenotes = mongoose.model('Note', noteSchema);

module.exports = Savenotes;
