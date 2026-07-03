const Bill = require('../models/Bill');
const MilkEntry = require('../models/MilkEntry');
const WaterEntry = require('../models/WaterEntry');
const GasEntry = require('../models/GasEntry');
const Supplier = require('../models/Supplier');
const Notification = require('../models/Notification');

exports.getBills = async (req, res, next) => {
  try {
    const bills = await Bill.find({ user: req.user._id }).sort({ year: -1, month: -1 });
    res.json({ success: true, count: bills.length, data: bills });
  } catch (err) { next(err); }
};

exports.generateBill = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const userId = req.user._id;
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    // Check if already generated
    let bill = await Bill.findOne({ user: userId, month, year });

    // Compute from entries
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
        { $group: { _id: null, count: { $sum: 1 }, totalCost: { $sum: '$cylinderCost' } } }
      ])
    ]);

    // Get primary suppliers
    const milkSupplier = await Supplier.findOne({ user: userId, type: 'milk', isActive: true });
    const waterSupplier = await Supplier.findOne({ user: userId, type: 'water', isActive: true });
    const gasSupplier = await Supplier.findOne({ user: userId, type: 'gas', isActive: true });

    const milkData = milkAgg[0] || {};
    const waterData = waterAgg[0] || {};
    const gasData = gasAgg[0] || {};

    const billData = {
      user: userId,
      month: parseInt(month),
      year: parseInt(year),
      milkSupplier: milkSupplier?.name || '',
      waterSupplier: waterSupplier?.name || '',
      gasSupplier: gasSupplier?.name || '',
      milkLiters: milkData.totalQty || 0,
      milkCharges: milkData.totalAmount || 0,
      waterCans: waterData.totalCans || 0,
      waterCharges: waterData.totalAmount || 0,
      gasCylinders: gasData.count || 0,
      gasCharges: gasData.totalCost || 0,
      status: 'generated'
    };

    if (bill) {
      Object.assign(bill, billData);
      await bill.save();
    } else {
      bill = await Bill.create(billData);
    }

    await Notification.create({
      user: userId,
      title: '📄 Monthly Bill Ready',
      message: `Your bill for ${new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })} has been generated.`,
      type: 'bill_ready',
      link: '/billing'
    });

    res.status(201).json({ success: true, data: bill });
  } catch (err) { next(err); }
};

exports.deleteBill = async (req, res, next) => {
  try {
    const bill = await Bill.findOne({ _id: req.params.id, user: req.user._id });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    await bill.deleteOne();
    res.json({ success: true, message: 'Bill deleted' });
  } catch (err) { next(err); }
};

exports.updateBillStatus = async (req, res, next) => {
  try {
    const bill = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: req.body.status },
      { new: true }
    );
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (err) { next(err); }
};
