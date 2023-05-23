const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Notification = require('../schema/notification.schema');

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description All Notification From A User
 * @route `/notification/`
 * @access Private
 * @type GET
 */
exports.all = asyncHandler(async (req, res, next) => {
  const data = await Notification.find({ _user: req.user._id });
  res.status(200).json({
    success: true,
    status: 'success',
    data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Update All Notification As Seen
 * @route `/notification/:id`
 * @access Private
 * @type GET
 */
exports.seen = asyncHandler(async (req, res, next) => {
  const data = await Notification.updateMany(
    {
      _user: req.user._id
    },
    {
      view: true
    }
  );

  if (!data) {
    return res.status(404).json({
      success: false,
      status: 'Resource Not Found',
      error: '404 Content Do Not Exist Or Has Been Deleted'
    });
  }

  res.status(200).json({
    success: true,
    status: 'success',
    data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Count Number Of UnSeen document
 * @route `/notification/count`
 * @access Private
 * @type GET
 */
exports.Count = asyncHandler(async (req, res, next) => {
  const data = await Notification.count({
    _user: req.user._id,
    view: false
  });

  res.status(200).json({
    success: true,
    status: 'success',
    data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Create a New Notification
 * @route `/notification/`
 * @access Private
 * @type POST
 */
exports.NewNotification = asyncHandler(async (req, res, next) => {
  const data = await Notification.create({
    _user: req.user._id,
    title: req.body.title ? req.body.title : 'No Title',
    message: req.body.message ? req.body.message : 'No message included'
  });

  res.status(200).json({
    success: true,
    status: 'success',
    data
  });
});
