const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
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
      min: 0,
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
  totalOpened: {
    type: Number,
    default: 0
  }
});

caseSchema.index({ isActive: 1 });
caseSchema.index({ price: 1 });

module.exports = mongoose.model('Case', caseSchema);