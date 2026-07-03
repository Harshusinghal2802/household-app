const Supplier = require('../models/Supplier');

// @desc  Get all suppliers (optionally filter by type)
exports.getSuppliers = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.type) filter.type = req.query.type;

    const suppliers = await Supplier.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    next(err);
  }
};

// @desc  Create supplier
exports.createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

// @desc  Update supplier
exports.updateSupplier = async (req, res, next) => {
  try {
    let supplier = await Supplier.findOne({ _id: req.params.id, user: req.user._id });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: supplier });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete supplier
exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ _id: req.params.id, user: req.user._id });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    await supplier.deleteOne();
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    next(err);
  }
};
