const mongoose = require('mongoose');

const savedViewSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  name: { type: String, required: true },
  filters: {
    source: [{ type: String }],
    sentiment: [{ type: String }],
    tags: [{ type: String }],
    dateRange: {
      start: { type: Date },
      end: { type: Date }
    },
    search: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SavedView', savedViewSchema);
