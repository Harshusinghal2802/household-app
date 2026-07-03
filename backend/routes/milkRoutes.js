const express = require('express');
const router = express.Router();
const { getMilkEntries, createMilkEntry, updateMilkEntry, deleteMilkEntry, getMilkSummary, getMilkTrend } = require('../controllers/milkController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getMilkEntries).post(createMilkEntry);
router.get('/summary', getMilkSummary);
router.get('/trend', getMilkTrend);
router.route('/:id').put(updateMilkEntry).delete(deleteMilkEntry);

module.exports = router;
