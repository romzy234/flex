const express = require('express');
const router = express.Router();
const { updateNew } = require('../controllers/pin.controller');
const { protect } = require('../guard/protect.guard');

router.use(protect);

router.post('/', updateNew);
router.put('/', updateNew);

module.exports = router;
