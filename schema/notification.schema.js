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
    }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model('notification', notificationSchema);
