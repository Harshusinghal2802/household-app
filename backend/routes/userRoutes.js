const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

router.use(protect);

// Admin: list all users
router.get('/', authorize('admin'), async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
});

module.exports = router;
