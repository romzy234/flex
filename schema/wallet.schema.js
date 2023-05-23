const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    _user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: [true, 'User Model is Required'],
      ref: 'user'
    },

    amount: {
      type: Number,
      default: 0
    },

    currency: {
      type: String,
      default: 'naira'
    },

    locked: {
      type: Boolean,
      default: false
    },

    inflow: {
      type: Number,
      default: 0
    },

    outflow: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('wallet', walletSchema);
