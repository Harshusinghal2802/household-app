const MilkEntry = require('../models/MilkEntry');

// @desc  Get milk entries
exports.getMilkEntries = async (req, res, next) => {
  try {
    const { month, year, page = 1, limit = 31 } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const skip = (page - 1) * limit;
    const entries = await MilkEntry.find(filter)
      .populate('supplier', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MilkEntry.countDocuments(filter);

    res.json({ success: true, count: entries.length, total, data: entries });
  } catch (err) {
    next(err);
  }
};

// @desc  Create milk entry
exports.createMilkEntry = async (req, res, next) => {
  try {
    const entry = await MilkEntry.create({ ...req.body, user: req.user._id });
    const populated = await entry.populate('supplier', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc  Update milk entry
exports.updateMilkEntry = async (req, res, next) => {
  try {
    let entry = await MilkEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    Object.assign(entry, req.body);
    await entry.save();
    const populated = await entry.populate('supplier', 'name');
    res.json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete milk entry
exports.deleteMilkEntry = async (req, res, next) => {
  try {
    const entry = await MilkEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    await entry.deleteOne();
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc  Get monthly summary
exports.getMilkSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const summary = await MilkEntry.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalQty: { $sum: '$totalQty' },
          totalAmount: { $sum: '$totalAmount' },
          totalMorning: { $sum: '$morningQty' },
          totalEvening: { $sum: '$eveningQty' },
          avgFat: { $avg: '$fatPercent' },
          avgRate: { $avg: '$ratePerLiter' },
          days: { $sum: 1 }
        }
      }
    ]);

    const result = summary[0] || {
      totalQty: 0, totalAmount: 0, totalMorning: 0,
      totalEvening: 0, avgFat: 0, avgRate: 0, days: 0
    };

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// @desc  Monthly trend (last 6 months)
exports.getMilkTrend = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trend = await MilkEntry.aggregate([
      { $match: { user: req.user._id, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalQty: { $sum: '$totalQty' },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
};
