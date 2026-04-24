const mongoose = require('mongoose');

const mentionSchema = new mongoose.Schema({
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  source: { type: String, enum: ['twitter', 'instagram', 'reddit', 'news'], required: true },
  author: { type: String, required: true },
  body: { type: String, required: true },
  url: { type: String, required: true },
  externalId: { type: String }, // Used to de-duplicate
  postedAt: { type: Date, required: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], required: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

// Compound index for deduplication: brand + source + url OR brand + source + externalId
// To keep it simple, we'll index on URL since it should be unique broadly. If needed we can check.
mentionSchema.index({ brandId: 1, url: 1 }, { unique: true, partialFilterExpression: { url: { $exists: true, $ne: null } } });

// Also add index for externalId deduplication if supplied.
mentionSchema.index({ brandId: 1, source: 1, externalId: 1 }, { unique: true, partialFilterExpression: { externalId: { $exists: true, $ne: null } } });

mentionSchema.index({ postedAt: -1 });

module.exports = mongoose.model('Mention', mentionSchema);
