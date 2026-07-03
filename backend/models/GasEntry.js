const mongoose = require('mongoose');

const gasEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  cylinderCost: {
    type: Number,
    required: [true, 'Cylinder cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  cylinderType: {
    type: String,
    enum: ['small', 'medium', 'large', 'commercial'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true
  },
  // Track usage
  daysUsed: {
    type: Number,
    default: null
  },
  nextRefillDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

gasEntrySchema.index({ user: 1, deliveryDate: -1 });

module.exports = mongoose.model('GasEntry', gasEntrySchema);
