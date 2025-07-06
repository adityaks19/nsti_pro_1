const express = require('express');
const { body, validationResult } = require('express-validator');
const StoreItem = require('../models/StoreItem');
const StoreRequest = require('../models/StoreRequest');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/store/items
// @desc    Get all store items
// @access  Private
router.get('/items', protect, async (req, res) => {
  try {
    const { category, search, inStock } = req.query;
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } }
      ];
    }

    if (inStock === 'true') {
      query.quantity = { $gt: 0 };
    }

    const items = await StoreItem.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/store/stats
// @desc    Get store statistics
// @access  Private (Store Manager/Admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    if (!['admin', 'store_manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const totalItems = await StoreItem.countDocuments({ isActive: true });
    const lowStockItems = await StoreItem.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minQuantity'] }
    });
    const pendingRequests = await StoreRequest.countDocuments({ status: 'pending' });
    
    // Calculate total inventory value
    const items = await StoreItem.find({ isActive: true });
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        pendingRequests,
        totalValue: Math.round(totalValue)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/store/requests/:id/fulfill
// @desc    Mark store request as fulfilled
// @access  Private (Store Manager/Admin only)
router.put('/requests/:id/fulfill', protect, async (req, res) => {
  try {
    if (!['admin', 'store'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const request = await StoreRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Request must be approved before fulfillment' });
    }

    // Update request status
    request.status = 'fulfilled';
    request.fulfilledDate = new Date();
    request.fulfilledBy = req.user.id;
    await request.save();

    // Update item quantity
    const item = await StoreItem.findById(request.item);
    if (item && item.quantity >= request.approvedQuantity) {
      item.quantity -= request.approvedQuantity;
      await item.save();
    }

    res.json({
      success: true,
      message: 'Request fulfilled successfully',
      data: request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/items', protect, [
  body('name').notEmpty().withMessage('Item name is required'),
  body('category').isIn(['cleaning', 'stationary']).withMessage('Category must be cleaning or stationary'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('unit').notEmpty().withMessage('Unit is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('supplier').notEmpty().withMessage('Supplier is required'),
  body('minimumStock').isInt({ min: 0 }).withMessage('Minimum stock must be a non-negative integer')
], async (req, res) => {
  try {
    // Check if user is store manager or admin
    if (!['admin', 'store'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Store manager role required.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const item = await StoreItem.create({
      ...req.body,
      addedBy: req.user.id
    });

    await item.populate('addedBy', 'name');

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item added successfully'
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while adding item' 
    });
  }
});

// @route   PUT /api/store/items/:id
// @desc    Update store item
// @access  Private (Store manager only)
router.put('/items/:id', protect, async (req, res) => {
  try {
    // Check if user is store manager or admin
    if (!['admin', 'store'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Store manager role required.' 
      });
    }

    const item = await StoreItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    const updatedItem = await StoreItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('addedBy', 'name');

    res.json({
      success: true,
      data: updatedItem,
      message: 'Item updated successfully'
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating item' 
    });
  }
});

// @route   DELETE /api/store/items/:id
// @desc    Delete store item
// @access  Private (Store manager only)
router.delete('/items/:id', protect, async (req, res) => {
  try {
    // Check if user is store manager or admin
    if (!['admin', 'store'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Store manager role required.' 
      });
    }

    const item = await StoreItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    // Check if item has pending requests
    const pendingRequests = await StoreRequest.countDocuments({
      item: req.params.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (pendingRequests > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete item with ${pendingRequests} pending requests` 
      });
    }

    await StoreItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting item' 
    });
  }
});

// @route   POST /api/store/request
// @desc    Request store item
// @access  Private (TO, Admin, Teacher only)
router.post('/request', protect, authorize('to', 'admin', 'teacher'), [
  body('itemId').notEmpty().withMessage('Item ID is required'),
  body('quantityRequested').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('purpose').notEmpty().withMessage('Purpose is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId, quantityRequested, purpose } = req.body;

    // Check if item exists
    const item = await StoreItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.quantity < quantityRequested) {
      return res.status(400).json({ 
        message: `Only ${item.quantity} ${item.unit}(s) available` 
      });
    }

    const storeRequest = await StoreRequest.create({
      item: itemId,
      requestedBy: req.user.id,
      quantityRequested,
      purpose
    });

    await storeRequest.populate([
      { path: 'item', select: 'name category unit price' },
      { path: 'requestedBy', select: 'name email employeeId role' }
    ]);

    res.status(201).json({
      success: true,
      data: storeRequest
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/store/requests
// @desc    Get store requests
// @access  Private
router.get('/requests', protect, async (req, res) => {
  try {
    let query = {};

    // Role-based filtering
    if (req.user.role === 'store') {
      // Store manager can see all requests
    } else {
      // Others can only see their own requests
      query.requestedBy = req.user.id;
    }

    const requests = await StoreRequest.find(query)
      .populate('item', 'name category unit price')
      .populate('requestedBy', 'name email employeeId role')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/store/requests/:id/approve
// @desc    Approve store request
// @access  Private (Store manager only)
router.put('/requests/:id/approve', protect, authorize('store'), [
  body('approvedQuantity').isInt({ min: 1 }).withMessage('Approved quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const request = await StoreRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    const { approvedQuantity, remarks } = req.body;

    const item = await StoreItem.findById(request.item);
    if (item.quantity < approvedQuantity) {
      return res.status(400).json({ 
        message: `Only ${item.quantity} ${item.unit}(s) available` 
      });
    }

    // RESERVE INVENTORY ON APPROVAL - Deduct from available quantity
    item.quantity -= approvedQuantity;
    await item.save();

    // Update request
    request.status = 'approved';
    request.approvedBy = req.user.id;
    request.approvedQuantity = approvedQuantity;
    request.remarks = remarks || '';
    request.approvedDate = new Date();
    await request.save();

    await request.populate([
      { path: 'item', select: 'name category unit price' },
      { path: 'requestedBy', select: 'name email employeeId role' },
      { path: 'approvedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Request approved and inventory reserved',
      data: request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/store/requests/:id/fulfill
// @desc    Fulfill store request
// @access  Private (Store manager only)
router.put('/requests/:id/fulfill', protect, authorize('store'), async (req, res) => {
  try {
    const request = await StoreRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({ message: 'Request must be approved first' });
    }

    // Just mark as fulfilled - inventory was already deducted on approval
    request.status = 'fulfilled';
    request.fulfilledDate = new Date();
    request.fulfilledBy = req.user.id;
    await request.save();

    await request.populate([
      { path: 'item', select: 'name category unit price' },
      { path: 'requestedBy', select: 'name email employeeId role' },
      { path: 'approvedBy', select: 'name' },
      { path: 'fulfilledBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Request fulfilled successfully',
      data: request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/store/requests/:id/reject
// @desc    Reject store request
// @access  Private (Store manager only)
router.put('/requests/:id/reject', protect, authorize('store'), async (req, res) => {
  try {
    const request = await StoreRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (!['pending', 'approved'].includes(request.status)) {
      return res.status(400).json({ message: 'Request cannot be rejected' });
    }

    // If request was approved, restore inventory
    if (request.status === 'approved') {
      const item = await StoreItem.findById(request.item);
      if (item) {
        item.quantity += request.approvedQuantity;
        await item.save();
      }
    }

    request.status = 'rejected';
    request.approvedBy = req.user.id;
    request.remarks = req.body.remarks || '';
    request.rejectedDate = new Date();
    await request.save();

    await request.populate([
      { path: 'item', select: 'name category unit price' },
      { path: 'requestedBy', select: 'name email employeeId role' },
      { path: 'approvedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Request rejected and inventory restored',
      data: request
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/store/inventory/summary
// @desc    Get inventory summary
// @access  Private (Store manager only)
router.get('/inventory/summary', protect, authorize('store'), async (req, res) => {
  try {
    const totalItems = await StoreItem.countDocuments({ isActive: true });
    const cleaningItems = await StoreItem.countDocuments({ category: 'cleaning', isActive: true });
    const stationaryItems = await StoreItem.countDocuments({ category: 'stationary', isActive: true });
    const lowStockItems = await StoreItem.countDocuments({ 
      $expr: { $lte: ['$quantity', '$minimumStock'] },
      isActive: true 
    });
    const outOfStockItems = await StoreItem.countDocuments({ quantity: 0, isActive: true });

    const pendingRequests = await StoreRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await StoreRequest.countDocuments({ status: 'approved' });

    res.json({
      success: true,
      data: {
        inventory: {
          totalItems,
          cleaningItems,
          stationaryItems,
          lowStockItems,
          outOfStockItems
        },
        requests: {
          pendingRequests,
          approvedRequests
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
