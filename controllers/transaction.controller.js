const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const History = require('../schema/history.schema');

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description All History From A User
 * @route `/transaction/`
 * @access Private
 * @type GET
 */
exports.all = asyncHandler(async (req, res, next) => {
  const data = await History.find({ _user: req.user._id });
  res.status(200).json({
    success: true,
    status: 'success',
    data
  });
});

/**
 * @author Cyril ogoh <cyrilogoh@gmail.com>
 * @description Single History From A User
 * @route `/transaction/:id`
 * @access Private
 * @type GET
 */
exports.single = asyncHandler(async (req, res, next) => {
  const data = await History.findOne({
    _user: req.user._id,
    _id: req.params.id
  });
  
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
