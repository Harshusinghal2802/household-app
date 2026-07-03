const express = require('express');
const router = express.Router();
const { getBills, generateBill, deleteBill, updateBillStatus } = require('../controllers/billController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getBills).post(generateBill);
router.route('/:id').delete(deleteBill).patch(updateBillStatus);

module.exports = router;
