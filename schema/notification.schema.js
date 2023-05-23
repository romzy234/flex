const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
  {
    _user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'user',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: false
    },
    target: {
      type: String,
      required: false
    },
    view: {
      type: Boolean,
      required: true,
      default: false
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('notification', notificationSchema);
