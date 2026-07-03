const express = require('express');
const router = express.Router();
const { getWaterEntries, createWaterEntry, updateWaterEntry, deleteWaterEntry, getWaterSummary, getWaterTrend } = require('../controllers/waterController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getWaterEntries).post(createWaterEntry);
router.get('/summary', getWaterSummary);
router.get('/trend', getWaterTrend);
router.route('/:id').put(updateWaterEntry).delete(deleteWaterEntry);

module.exports = router;
