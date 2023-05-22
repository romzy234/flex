const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../schema/user.schema');

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Get User Profile Complete
 * @route `/profile`
 * @access Private
 * @type GET
 */
exports.profile = asyncHandler(async (req, res, next) => {
  const data = await User.findOne({ _id: req.user._id })
    .select({
      _auth: 0,
      _id: 0
    })
    .populate('_wallet');
  res.status(200).json({
    success: true,
    data: data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update The User
 * @route `/profile/update`
 * @access Private
 * @type PUT
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const incoming = req.body;
  delete incoming._wallet;
  delete incoming._id;
  delete incoming._type;
  delete incoming._verify;
  delete incoming._completed;
  delete incoming.createdAt;
  delete incoming.username;
  const data = await User.updateOne({ _id: req.user._id }, incoming, {
    runValidators: true,
    new: false
  }).select({
    _id: 0
  });
  res.status(200).json({
    success: true,
    data: data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update User Password
 * @route `/profile/update/password`
 * @access Private
 * @type PUT
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  const user = await User.findOne({
    _id: req.user._id
  });

  if (!user) {
    return next(new ErrorResponse(`User does not exist`, 400));
  }
  if (password == '' || !password) {
    return next(new ErrorResponse(`Password Is Not Valid`, 400));
  }
  // Set new password
  user.password = password;
  await user.save();
  res.status(200).json({
    success: true,
    message: 'password Updated'
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update User profile Image
 * @route `/profile/update/password`
 * @access Private
 * @type PUT
 */
exports.updateProfileImage = asyncHandler(async (req, res, next) => {
  const { image, thumbnail } = req.body;
  if (!image) {
    return next(new ErrorResponse('Image Url Is Required, Try Again', 400));
  }

  let incoming = {
    image,
    thumbnail
  };

  if (!thumbnail) {
    delete incoming.thumbnail;
  }
  const data = await User.updateOne({ _id: req.user._id }, incoming).select({
    _id: 0
  });

  res.status(201).json({
    success: true,
    data: data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update User profile Image
 * @route `/profile/update/password`
 * @access Private
 * @type PUT
 */
exports.updatePhone = asyncHandler(async (req, res, next) => {
  const { phone, country } = req.body;
  if (!phone || !country) {
    return next(
      new ErrorResponse('Phone and Country Code Is Required, Try Again', 400)
    );
  }

  let incoming = {
    phone,
    country_code: country
  };

  const data = await User.updateOne({ _id: req.user._id }, incoming).select({
    _id: 0
  });

  res.status(201).json({
    success: true,
    data: data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update User profile Image
 * @route `/profile/upgrade`
 * @access Private
 * @type POST
 */
exports.upgrade = asyncHandler(async (req, res, next) => {
  res.status(201).json({
    success: true,
    data: 'Coming Soon'
  });
});
