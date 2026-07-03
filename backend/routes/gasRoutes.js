const express = require('express');
const router = express.Router();
const { getGasEntries, createGasEntry, updateGasEntry, deleteGasEntry, getGasSummary } = require('../controllers/gasController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getGasEntries).post(createGasEntry);
router.get('/summary', getGasSummary);
router.route('/:id').put(updateGasEntry).delete(deleteGasEntry);

module.exports = router;
