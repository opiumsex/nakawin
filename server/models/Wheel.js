const mongoose = require('mongoose');

const wheelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true
    },
    chance: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalSpins: {
    type: Number,
    default: 0
  }
});

wheelSchema.index({ isActive: 1 });

module.exports = mongoose.model('Wheel', wheelSchema);