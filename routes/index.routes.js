var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.status(200).json({
    status: 'success',
    success: true,
    message:
      'Hey Welcome To Flex💰, Dont Know What You Looking👀 for here, But Hey I Am Running 💪🏼'
  });
});

module.exports = router;
