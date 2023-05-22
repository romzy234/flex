const jwt = require('jsonwebtoken');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../schema/user.schema');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
    // Set token from cookie
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Check the type Of Auth
    if (decoded) {
      req.user = await User.findOne({ _id: decoded.user_id });
      if (req.user) {
        next();
      } else {
        return next(
          new ErrorResponse('Not authorized to access this route', 400)
        );
      }
    } else {
      return next(
        new ErrorResponse(
          "Not authorized to access this route, Can't Resolve Request 'HINT: Login Again'",
          400
        )
      );
    }
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});
