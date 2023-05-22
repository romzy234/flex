const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const sendEmail = require('../mail/index.mail');
// const { generateOTP } = require('../utils/otpGen');
const jwt = require('jsonwebtoken');
const User = require('../schema/user.schema');
const Wallet = require('../schema/wallet.schema');

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Registeration using Form Input For `All Account Type`
 * @route `/auth/register`
 * @access Public
 * @type POST
 */
exports.register = asyncHandler(async (req, res, next) => {
  try {
    if (!req.body.email) {
      return next(new ErrorResponse('Email Address Is Required', 403));
    }
    if (!req.body.password) {
      return next(new ErrorResponse('Password Is Required', 403));
    }
    const email = req.body.email.toLowerCase()
      ? req.body.email.toLowerCase()
      : '';
    const username = req.body.username.toLowerCase()
      ? req.body.username.toLowerCase()
      : '';

    const otp = '1234';
    // const otp = generateOTP(6);
    const checkAccount = await User.findOne({
      email: email
    });

    const checkUser = await User.findOne({
      username: username
    });

    if (checkAccount) {
      return next(
        new ErrorResponse(
          'Email Address already exist And Verified, \n Please Login or Reset password if Forgotten',
          400
        )
      );
    }

    if (checkUser) {
      return next(
        new ErrorResponse(
          'Username already exist And Verified, \n Please Register or login',
          400
        )
      );
    }

    // Create Profile
    const authProfile = await User.create({
      email: email,
      password: req.body.password,
      name: req.body.name,
      username: username,
      device: req.body.device ? req.body.device : null,
      Token: otp,
      TokenExpire: Date.now() + 10 * 60 * 1000
    });

    // Create an Wallet For Profile
    const wallet = await Wallet.create({
      _user: authProfile._id
    });

    authProfile._wallet = wallet._id;
    await authProfile.save();

    // Send OTP
    sendEmail({
      to: email,
      subject: 'One More Step, Verify Your Email',
      message: `${otp} this is your otp`
    });

    res.status(201).json({
      success: true,
      message: 'OTP Sent Successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Resend verifcation OTP
 * @route `/auth/resend/signup/otp`
 * @access Public
 * @type POST
 */
exports.resendSignUp = asyncHandler(async (req, res, next) => {
  try {
    if (!req.body.email) {
      return next(new ErrorResponse('Email Address Is Required', 403));
    }
    const email = req.body.email.toLowerCase()
      ? req.body.email.toLowerCase()
      : '';

    const otp = '1234';
    // const otp = generateOTP(6);
    const checkAccount = await User.findOne({
      email: email
    });

    if (!checkAccount) {
      return next(
        new ErrorResponse('No Account Exist with Email, Signup Please', 404)
      );
    }

    if (checkAccount._verify) {
      return next(new ErrorResponse('Account is verified', 404));
    }
    // Create an Authication Profile
    await User.updateOne(
      {
        email: email
      },
      {
        Token: otp,
        TokenExpire: Date.now() + 10 * 60 * 1000
      }
    );
    // Send OTP
    sendEmail({
      to: email,
      subject: 'One More Step, Verify Your Email',
      message: `${otp} this is your otp`
    });

    res.status(201).json({
      success: true,
      message: 'OTP Sent Successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Verify OTP
 * @route `/auth/login`
 * @access Public
 * @type POST
 */
exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp, username } = req.body;

  // Validate email & password
  //TODO use Joi
  if (!email || !otp || !username) {
    return next(new ErrorResponse('Please provide an email and otp', 400));
  }

  // Check for user
  const auth = await User.findOne({ email, username }).select('+Token');

  if (!auth) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  if (auth._verify) {
    return next(new ErrorResponse('Account is verified, Try logging in', 409));
  }
  // Check if otp matches
  if (auth.Token !== otp) {
    return next(new ErrorResponse('OTP Is Wrong', 400));
  }
  if (auth.TokenExpire < Date.now()) {
    return next(
      new ErrorResponse('Token Has Expired, Resend a New Token', 400)
    );
  }
  await User.updateOne(
    {
      email: email
    },
    {
      _verify: true,
      Token: null,
      TokenExpire: null
    }
  );
  sendTokenResponse(auth, 200, res);
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Login using Form Input
 * @route `/auth/login`
 * @access Public
 * @type POST
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password, device } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const auth = await User.findOne({ email })
    .select('+password')
    .populate('_wallet');

  if (!auth) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = auth.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  // Verify Email
  if (auth && !auth._verify) {
    return res.status(401).json({
      status: 'error',
      success: 'false',
      message: 'Verify Email, Email Is Not Verified',
      username: auth.username,
      email: auth.email
    });
  }
  if (device) {
    auth.device = device;
    auth.save();
  }
  sendTokenResponse(auth, 200, res);
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Logout
 * @route `/auth/logout`
 * @access Public
 * @type GET
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// Get token from model, create cookie and send response
const sendTokenResponse = async (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
    user: user
  });
};

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Check If Username is Avaliable
 * @route `/auth/username`
 * @access Public
 * @type POST
 */
exports.checkUsername = asyncHandler(async (req, res, next) => {
  const { username } = req.body;

  if (!username) {
    return next(new ErrorResponse('Please provide a valild Username', 400));
  }
  // Check for user
  const auth = await User.findOne({ username });

  if (auth) {
    return next(new ErrorResponse('A User With That Username Exist', 401));
  }

  res.status(200).json({
    status: 'success',
    success: true,
    message: 'All Good'
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Forgot Password
 * @route `/auth/forgot-password`
 * @access Public
 * @type POST
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorResponse('Email is Require, To Process', 400));
  }
  const auth = await User.findOne({ email: req.body.email.toLowerCase() });

  if (!auth) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = '1234';
  auth.resetPasswordToken = resetToken;
  auth.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  try {
    await auth.save({ validateBeforeSave: false });
    sendEmail({
      to: req.body.email,
      subject: 'Reset Your Password',
      message: `${resetToken} this is your otp`
    });
    res.status(200).json({ success: true, data: 'Email sent successfully' });
  } catch (err) {
    console.log(err);
    auth.resetPasswordToken = undefined;
    auth.resetPasswordExpire = undefined;
    await auth.save({ validateBeforeSave: false });
    return next(new ErrorResponse('Something Went Wrong', 500));
  }
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Verify OTP For Password
 * @route `/auth/verify/password`
 * @access Public
 * @type POST
 */
exports.verifyPassReset = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  // Validate email & password
  if (!email || !otp) {
    return next(new ErrorResponse('Please provide an email and otp', 400));
  }

  // Check for user
  const auth = await User.findOne({ email }).select('+resetPasswordToken');

  if (!auth) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }
  // Check if otp matches
  if (auth.resetPasswordToken !== otp) {
    return next(new ErrorResponse('OTP Is Wrong', 400));
  }
  if (auth.resetPasswordExpire < Date.now()) {
    return next(
      new ErrorResponse('Token Has Expired, Resend a New Token', 400)
    );
  } else {
    await User.updateOne(
      {
        email: email
      },
      {
        resetPasswordToken: null,
        resetPasswordExpire: null
      }
    );
    sendTokenResponse(auth, 200, res);
  }
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Reset Password
 * @route `/auth/reset-password`
 * @access Public
 * @type POST
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  if (!req.user) {
    return next(new ErrorResponse(`Authoriztion token Is Required`, 401));
  }
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
  await user.save({ validateBeforeSave: true });
  res.status(200).json({
    success: true,
    message: 'password Updated'
  });
});
