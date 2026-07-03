const MilkEntry = require('../models/MilkEntry');
const WaterEntry = require('../models/WaterEntry');
const GasEntry = require('../models/GasEntry');

exports.getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);
    const userId = req.user._id;

    // This month summaries
    const [milkAgg, waterAgg, gasAgg] = await Promise.all([
      MilkEntry.aggregate([
        { $match: { user: userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalQty: { $sum: '$totalQty' }, totalAmount: { $sum: '$totalAmount' } } }
      ]),
      WaterEntry.aggregate([
        { $match: { user: userId, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalCans: { $sum: '$numberOfCans' }, totalAmount: { $sum: '$totalAmount' } } }
      ]),
      GasEntry.aggregate([
        { $match: { user: userId, deliveryDate: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalCylinders: { $sum: 1 }, totalCost: { $sum: '$cylinderCost' } } }
      ])
    ]);

    const milkData = milkAgg[0] || { totalQty: 0, totalAmount: 0 };
    const waterData = waterAgg[0] || { totalCans: 0, totalAmount: 0 };
    const gasData = gasAgg[0] || { totalCylinders: 0, totalCost: 0 };
    const totalExpenses = (milkData.totalAmount || 0) + (waterData.totalAmount || 0) + (gasData.totalCost || 0);

    // 6-month trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [milkTrend, waterTrend, gasTrend] = await Promise.all([
      MilkEntry.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, totalQty: { $sum: '$totalQty' }, totalAmount: { $sum: '$totalAmount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      WaterEntry.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, totalCans: { $sum: '$numberOfCans' }, totalAmount: { $sum: '$totalAmount' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      GasEntry.aggregate([
        { $match: { user: userId, deliveryDate: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$deliveryDate' }, month: { $month: '$deliveryDate' } }, totalCylinders: { $sum: 1 }, totalCost: { $sum: '$cylinderCost' } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    // Recent entries
    const recentMilk = await MilkEntry.find({ user: userId }).sort({ date: -1 }).limit(5).populate('supplier', 'name');
    const lastGas = await GasEntry.findOne({ user: userId }).sort({ deliveryDate: -1 });

    res.json({
      success: true,
      data: {
        cards: {
          milk: { qty: milkData.totalQty, amount: milkData.totalAmount },
          water: { cans: waterData.totalCans, amount: waterData.totalAmount },
          gas: { cylinders: gasData.totalCylinders, amount: gasData.totalCost },
          totalExpenses
        },
        trends: { milk: milkTrend, water: waterTrend, gas: gasTrend },
        recentMilk,
        lastGasRefill: lastGas
      }
    });
  } catch (err) {
    next(err);
  }
};
