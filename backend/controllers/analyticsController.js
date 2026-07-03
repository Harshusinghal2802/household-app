const MilkEntry = require('../models/MilkEntry');
const WaterEntry = require('../models/WaterEntry');
const GasEntry = require('../models/GasEntry');

exports.getYearlyAnalytics = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const userId = req.user._id;
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const [milk, water, gas] = await Promise.all([
      MilkEntry.aggregate([
        { $match: { user: userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: '$date' } }, qty: { $sum: '$totalQty' }, amount: { $sum: '$totalAmount' } } },
        { $sort: { '_id.month': 1 } }
      ]),
      WaterEntry.aggregate([
        { $match: { user: userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: '$date' } }, cans: { $sum: '$numberOfCans' }, amount: { $sum: '$totalAmount' } } },
        { $sort: { '_id.month': 1 } }
      ]),
      GasEntry.aggregate([
        { $match: { user: userId, deliveryDate: { $gte: start, $lte: end } } },
        { $group: { _id: { month: { $month: '$deliveryDate' } }, cylinders: { $sum: 1 }, amount: { $sum: '$cylinderCost' } } },
        { $sort: { '_id.month': 1 } }
      ])
    ]);

    // Build month labels
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const milkByMonth = months.map(m => milk.find(x => x._id.month === m) || { _id: { month: m }, qty: 0, amount: 0 });
    const waterByMonth = months.map(m => water.find(x => x._id.month === m) || { _id: { month: m }, cans: 0, amount: 0 });
    const gasByMonth = months.map(m => gas.find(x => x._id.month === m) || { _id: { month: m }, cylinders: 0, amount: 0 });

    const totals = {
      milk: { qty: milk.reduce((s, x) => s + x.qty, 0), amount: milk.reduce((s, x) => s + x.amount, 0) },
      water: { cans: water.reduce((s, x) => s + x.cans, 0), amount: water.reduce((s, x) => s + x.amount, 0) },
      gas: { cylinders: gas.reduce((s, x) => s + x.cylinders, 0), amount: gas.reduce((s, x) => s + x.amount, 0) }
    };
    totals.grandTotal = totals.milk.amount + totals.water.amount + totals.gas.amount;

    res.json({ success: true, data: { milkByMonth, waterByMonth, gasByMonth, totals, year } });
  } catch (err) { next(err); }
};
