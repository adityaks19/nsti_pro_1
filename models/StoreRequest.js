const mongoose = require('mongoose');

const storeRequestSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StoreItem',
    required: true
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantityRequested: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1
  },
  purpose: {
    type: String,
    required: [true, 'Purpose is required'],
    trim: true
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'fulfilled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedQuantity: {
    type: Number,
    min: 0
  },
  fulfilledDate: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StoreRequest', storeRequestSchema);
