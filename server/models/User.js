const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  gameNickname: {
    type: String,
    required: true,
    trim: true
  },
  server: {
    type: String,
    required: true
  },
  bankAccount: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  balance: {
    type: Number,
    default: 1000
  },
  inventory: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    itemName: String,
    itemImage: String,
    itemPrice: Number,
    obtainedAt: {
      type: Date,
      default: Date.now
    },
    isWithdrawn: {
      type: Boolean,
      default: false
    },
    obtainedFrom: {
      type: String,
      enum: ['case', 'wheel']
    }
  }],
  totalSpent: {
    type: Number,
    default: 0
  },
  totalWon: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

userSchema.index({ username: 1 });
userSchema.index({ gameNickname: 1 });
userSchema.index({ 'inventory.obtainedAt': -1 });

module.exports = mongoose.model('User', userSchema);