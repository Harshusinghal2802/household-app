const WaterEntry = require('../models/WaterEntry');

exports.getWaterEntries = async (req, res, next) => {
  try {
    const { month, year, page = 1, limit = 31 } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const skip = (page - 1) * limit;
    const entries = await WaterEntry.find(filter)
      .populate('supplier', 'name')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WaterEntry.countDocuments(filter);
    res.json({ success: true, count: entries.length, total, data: entries });
  } catch (err) { next(err); }
};

exports.createWaterEntry = async (req, res, next) => {
  try {
    const entry = await WaterEntry.create({ ...req.body, user: req.user._id });
    const populated = await entry.populate('supplier', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.updateWaterEntry = async (req, res, next) => {
  try {
    let entry = await WaterEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    Object.assign(entry, req.body);
    await entry.save();
    const populated = await entry.populate('supplier', 'name');
    res.json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.deleteWaterEntry = async (req, res, next) => {
  try {
    const entry = await WaterEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    await entry.deleteOne();
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) { next(err); }
};

exports.getWaterSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const summary = await WaterEntry.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalCans: { $sum: '$numberOfCans' },
          totalAmount: { $sum: '$totalAmount' },
          avgRate: { $avg: '$ratePerCan' },
          deliveries: { $sum: 1 }
        }
      }
    ]);

    res.json({ success: true, data: summary[0] || { totalCans: 0, totalAmount: 0, avgRate: 0, deliveries: 0 } });
  } catch (err) { next(err); }
};

exports.getWaterTrend = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const trend = await WaterEntry.aggregate([
      { $match: { user: req.user._id, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          totalCans: { $sum: '$numberOfCans' },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: trend });
  } catch (err) { next(err); }
};
