const mongoose = require('mongoose');

const horoscopeCacheSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily', 'compatibility'],
    required: true,
  },
  sign: { type: String, required: true },
  sign2: { type: String, default: null },
  date: { type: String, default: null },
  language: { type: String, default: 'en' },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index: daily horoscopes expire after 24 hours
horoscopeCacheSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { type: 'daily' } }
);

// Compound index for quick lookups
horoscopeCacheSchema.index({ type: 1, sign: 1, date: 1, language: 1 });
horoscopeCacheSchema.index({ type: 1, sign: 1, sign2: 1, language: 1 });

module.exports = mongoose.model('HoroscopeCache', horoscopeCacheSchema);
