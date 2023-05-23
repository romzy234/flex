const express = require('express');
const router = express.Router();
const {
  all,
  Count,
  seen,
  NewNotification
} = require('../controllers/notification.controller');
const { protect } = require('../guard/protect.guard');

router.use(protect);

router.get('/', all);
router.get('/viewed', seen);
router.get('/count', Count);
router.post('/', NewNotification);

module.exports = router;
