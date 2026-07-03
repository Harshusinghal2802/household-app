const GasEntry = require('../models/GasEntry');
const Notification = require('../models/Notification');

exports.getGasEntries = async (req, res, next) => {
  try {
    const { month, year, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.deliveryDate = { $gte: start, $lte: end };
    }

    const skip = (page - 1) * limit;
    const entries = await GasEntry.find(filter)
      .populate('supplier', 'name')
      .sort({ deliveryDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GasEntry.countDocuments(filter);
    res.json({ success: true, count: entries.length, total, data: entries });
  } catch (err) { next(err); }
};

exports.createGasEntry = async (req, res, next) => {
  try {
    // Compute days used from previous entry
    const lastEntry = await GasEntry.findOne({ user: req.user._id }).sort({ deliveryDate: -1 });
    let daysUsed = null;

    if (lastEntry) {
      const prev = new Date(lastEntry.deliveryDate);
      const curr = new Date(req.body.deliveryDate);
      daysUsed = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

      // Update previous entry's daysUsed
      lastEntry.daysUsed = daysUsed;
      await lastEntry.save();
    }

    const avgDays = await computeAvgDays(req.user._id);
    const nextRefillDate = avgDays
      ? new Date(new Date(req.body.deliveryDate).getTime() + avgDays * 24 * 60 * 60 * 1000)
      : null;

    const entry = await GasEntry.create({
      ...req.body,
      user: req.user._id,
      daysUsed,
      nextRefillDate
    });

    // Notify if refill expected soon
    if (nextRefillDate) {
      const daysLeft = Math.round((nextRefillDate - new Date()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3) {
        await Notification.create({
          user: req.user._id,
          title: '⚠️ Gas Cylinder Almost Empty',
          message: `Based on your usage, your gas cylinder may run out in ${daysLeft} days.`,
          type: 'gas_reminder',
          link: '/gas'
        });
      }
    }

    const populated = await entry.populate('supplier', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.updateGasEntry = async (req, res, next) => {
  try {
    let entry = await GasEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    Object.assign(entry, req.body);
    await entry.save();
    const populated = await entry.populate('supplier', 'name');
    res.json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.deleteGasEntry = async (req, res, next) => {
  try {
    const entry = await GasEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });
    await entry.deleteOne();
    res.json({ success: true, message: 'Entry deleted' });
  } catch (err) { next(err); }
};

exports.getGasSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const summary = await GasEntry.aggregate([
      { $match: { user: req.user._id, deliveryDate: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalCylinders: { $sum: 1 },
          totalCost: { $sum: '$cylinderCost' },
          avgCost: { $avg: '$cylinderCost' }
        }
      }
    ]);

    const avgDays = await computeAvgDays(req.user._id);
    const lastEntry = await GasEntry.findOne({ user: req.user._id }).sort({ deliveryDate: -1 });

    res.json({
      success: true,
      data: {
        ...(summary[0] || { totalCylinders: 0, totalCost: 0, avgCost: 0 }),
        avgDuration: avgDays,
        nextRefillDate: lastEntry?.nextRefillDate || null
      }
    });
  } catch (err) { next(err); }
};

async function computeAvgDays(userId) {
  const entries = await GasEntry.find({ user: userId, daysUsed: { $ne: null } }).sort({ deliveryDate: -1 }).limit(5);
  if (!entries.length) return null;
  const total = entries.reduce((sum, e) => sum + e.daysUsed, 0);
  return Math.round(total / entries.length);
}
