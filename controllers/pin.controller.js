const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../schema/user.schema');
const bcrypt = require('bcryptjs');

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Confirm User Pin
 * @route `/pin`
 * @access Private
 * @type POST
 */
exports.confirm = asyncHandler(async (req, res, next) => {
  const { pin } = req.body;
  const data = await User.findOne({ _id: req.user._id });
  const isTrue = await data.matchTransactionPin(pin);
  if(!isTrue){
     return next(new ErrorResponse('Invalid Pin', 401));
  }
  res.status(200).json({
    success: true,
    data: data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update The User
 * @route `/pin/`
 * @access Private
 * @type PUT
 */
exports.updateNew = asyncHandler(async (req, res, next) => {
  const { pin } = req.body;
  if (!pin.length == 4) {
    return next(new ErrorResponse('INVALID PIN', 404));
  }
  const data = await User.findOne({ _id: req.user._id });

  if (!data) {
    return next(new ErrorResponse('User Not Found', 404));
  }

  if (data.pin) {
    return next(new ErrorResponse('Pin Is Set Already', 400));
  }
  const salt = await bcrypt.genSalt(10);
  const hashPin = await bcrypt.hash(pin, salt);

  data.pin = hashPin;

  await data.save({
    validateBeforeSave: true
  });
  res.status(200).json({
    success: true,
    data: data
  });
});
