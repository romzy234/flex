const express = require('express');
const router = express.Router();
const {
  profile,
  updateProfile,
  updatePassword,
  updateProfileImage,
  updatePhone,
  upgrade
} = require('../controllers/profile.controller');
const { protect } = require('../guard/protect.guard');

router.use(protect);
router.get('/', profile).put('/', updateProfile);
router.put('/password', updatePassword);
router.put('/image', updateProfileImage);
router.put('/phone', updatePhone);
router.post('/upgrade', upgrade);

module.exports = router;
