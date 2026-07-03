const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  billNumber: {
    type: String,
    unique: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  milkSupplier: {
    type: String
  },
  waterSupplier: {
    type: String
  },
  gasSupplier: {
    type: String
  },
  milkLiters: {
    type: Number,
    default: 0
  },
  milkCharges: {
    type: Number,
    default: 0
  },
  waterCans: {
    type: Number,
    default: 0
  },
  waterCharges: {
    type: Number,
    default: 0
  },
  gasCylinders: {
    type: Number,
    default: 0
  },
  gasCharges: {
    type: Number,
    default: 0
  },
  grandTotal: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'paid'],
    default: 'generated'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

billSchema.pre('save', function (next) {
  if (!this.billNumber) {
    this.billNumber = `DL-${this.year}${String(this.month).padStart(2, '0')}-${Date.now().toString().slice(-6)}`;
  }
  this.grandTotal = (this.milkCharges || 0) + (this.waterCharges || 0) + (this.gasCharges || 0);
  next();
});

billSchema.index({ user: 1, year: -1, month: -1 });

module.exports = mongoose.model('Bill', billSchema);
