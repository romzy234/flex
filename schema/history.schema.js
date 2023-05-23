const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
  {
    _wallet: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'wallet',
      default: null
    },
    _user: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
      ref: 'user',
      default: null
    },
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Date,
      required: true
    },
    bank: {
      type: Object,
      required: true
    },
    reference: {
      type: String,
      required: true
    },
    detail: {
      type: String,
      required: true
    },
    from: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    initor: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('history', historySchema);
