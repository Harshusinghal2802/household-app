const express = require('express');
const router = express.Router();
const { getYearlyAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/yearly', getYearlyAnalytics);

module.exports = router;
