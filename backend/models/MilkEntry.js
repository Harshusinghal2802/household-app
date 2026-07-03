const mongoose = require('mongoose');

const milkEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  morningQty: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  eveningQty: {
    type: Number,
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  fatPercent: {
    type: Number,
    default: 0,
    min: [0, 'Fat % cannot be negative'],
    max: [100, 'Fat % cannot exceed 100']
  },
  ratePerLiter: {
    type: Number,
    required: [true, 'Rate per liter is required'],
    min: [0, 'Rate cannot be negative']
  },
  notes: {
    type: String,
    trim: true
  },
  // Computed fields
  totalQty: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Compute totals before save
milkEntrySchema.pre('save', function (next) {
  this.totalQty = (this.morningQty || 0) + (this.eveningQty || 0);
  this.totalAmount = this.totalQty * this.ratePerLiter;
  next();
});

milkEntrySchema.index({ user: 1, date: -1 });
milkEntrySchema.index({ user: 1, supplier: 1 });

module.exports = mongoose.model('MilkEntry', milkEntrySchema);
