const express = require('express');
const router = express.Router();
const {
  Banks_Glade,
  verifyAccount_Glade,
  disburseToUserGlade,
  disburseToSaveUserGlade,
  userBank,
  postUserBank,
  PayStack
} = require('../controllers/bank.controller');
const { protect } = require('../guard/protect.guard');

router.use(protect);
router.get('/', Banks_Glade);
router.post('/verify', verifyAccount_Glade);
router.post('/transfer', disburseToUserGlade);
router.post('/withdraw', disburseToSaveUserGlade);
router.get('/save', userBank);
router.post('/save', postUserBank);
router.post('/webhook/paystack/', PayStack);

module.exports = router;
