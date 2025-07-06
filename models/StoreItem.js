const mongoose = require('mongoose');

const storeItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['cleaning', 'stationary']
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'box', 'packet', 'bottle', 'kg', 'liter', 'dozen']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  supplier: {
    type: String,
    required: [true, 'Supplier is required'],
    trim: true
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock level is required'],
    min: 0
  },
  itemImage: {
    type: String,
    default: ''
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for stock status
storeItemSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) return 'out-of-stock';
  if (this.quantity <= this.minimumStock) return 'low-stock';
  return 'in-stock';
});

module.exports = mongoose.model('StoreItem', storeItemSchema);
