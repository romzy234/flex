const express = require('express');
const router = express.Router();
const { all, single } = require('../controllers/transaction.controller');
const { protect } = require('../guard/protect.guard');

router.use(protect);

router.get('/', all);
router.get('/:id', single);

module.exports = router;
