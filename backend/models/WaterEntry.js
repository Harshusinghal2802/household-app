const mongoose = require('mongoose');

const waterEntrySchema = new mongoose.Schema({
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
  numberOfCans: {
    type: Number,
    required: [true, 'Number of cans is required'],
    min: [1, 'At least 1 can required']
  },
  ratePerCan: {
    type: Number,
    required: [true, 'Rate per can is required'],
    min: [0, 'Rate cannot be negative']
  },
  notes: {
    type: String,
    trim: true
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

waterEntrySchema.pre('save', function (next) {
  this.totalAmount = this.numberOfCans * this.ratePerCan;
  next();
});

waterEntrySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('WaterEntry', waterEntrySchema);
