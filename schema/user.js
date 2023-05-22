const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    _wallet: {
      type: mongoose.SchemaTypes.ObjectId,
      required: [false, 'Server Error Wallet Is Not Creating or Merging'],
      ref: 'wallet'
    },

    _bvn: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'bvn',
      default: null,
      select: false
    },

    email: {
      type: String,
      required: [true, 'Please enter your Email address'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid Email address'
      ]
    },

    password: {
      type: String,
      required: [true, 'Please A Valid Password is Required'],
      select: false
    },

    _verify: {
      type: Boolean,
      required: true,
      default: false
    },

    _completed: {
      type: Boolean,
      required: true,
      default: false
    },

    _type: {
      type: String,
      required: false,
      enum: ['private', 'bussiness', 'admin'],
      default: 'private'
    },

    name: {
      type: String,
      required: [true, 'Please enter your FUll Name'],
      trim: true
    },

    username: {
      type: String,
      required: [true, 'Please a Username is Required'],
      trim: true
    },

    phone_number: {
      type: String,
      required: [false, 'Please enter your Phone Number'],
      trim: false
    },

    phone_number_country_code: {
      type: String,
      required: [false, 'Please enter your Phone Country Code'],
      trim: false
    },

    image: {
      type: String,
      required: false,
      default: null
    },

    thumbnail: {
      type: String,
      required: false,
      default: null
    },

    Token: String,
    TokenExpire: Number,
    resetPasswordToken: String,
    resetPasswordExpire: Number
  },
  {
    timestamps: true
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Sign JWT
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      user_id: this._id,
      type: 'lawyer'
    },
    process.env.JWT_SECRET
  );
};

module.exports = mongoose.model('user', userSchema);
