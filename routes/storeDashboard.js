const express = require('express');
const StoreItem = require('../models/StoreItem');
const StoreRequest = require('../models/StoreRequest');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/store/dashboard
// @desc    Get store dashboard data
// @access  Private (Store Manager only)
router.get('/dashboard', protect, authorize('store'), async (req, res) => {
  try {
    // Get basic statistics
    const totalItems = await StoreItem.countDocuments({ isActive: true });
    const availableItems = await StoreItem.countDocuments({ 
      isActive: true, 
      quantity: { $gt: 0 } 
    });
    const lowStockItems = await StoreItem.countDocuments({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    });
    const outOfStockItems = await StoreItem.countDocuments({
      isActive: true,
      quantity: 0
    });

    // Request statistics
    const totalRequests = await StoreRequest.countDocuments();
    const pendingRequests = await StoreRequest.countDocuments({ status: 'pending' });
    const approvedRequests = await StoreRequest.countDocuments({ status: 'approved' });
    const fulfilledRequests = await StoreRequest.countDocuments({ status: 'fulfilled' });
    const rejectedRequests = await StoreRequest.countDocuments({ status: 'rejected' });

    // Category statistics
    const cleaningItems = await StoreItem.countDocuments({ 
      category: 'cleaning', 
      isActive: true 
    });
    const stationaryItems = await StoreItem.countDocuments({ 
      category: 'stationary', 
      isActive: true 
    });

    // Get recent requests (last 10)
    const recentRequests = await StoreRequest.find()
      .populate('item', 'name category unit')
      .populate('requestedBy', 'name role')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get low stock items
    const lowStockItemsList = await StoreItem.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    }).sort({ quantity: 1 }).limit(10);

    // Get most requested items (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const mostRequestedItems = await StoreRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$item',
          totalRequests: { $sum: 1 },
          totalQuantity: { $sum: '$quantityRequested' }
        }
      },
      {
        $lookup: {
          from: 'storeitems',
          localField: '_id',
          foreignField: '_id',
          as: 'itemDetails'
        }
      },
      {
        $unwind: '$itemDetails'
      },
      {
        $project: {
          name: '$itemDetails.name',
          category: '$itemDetails.category',
          totalRequests: 1,
          totalQuantity: 1
        }
      },
      {
        $sort: { totalRequests: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await StoreRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          fulfilledRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format monthly stats
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlyStats = monthlyStats.map(stat => ({
      month: monthNames[stat._id.month - 1],
      year: stat._id.year,
      totalRequests: stat.totalRequests,
      pendingRequests: stat.pendingRequests,
      approvedRequests: stat.approvedRequests,
      fulfilledRequests: stat.fulfilledRequests
    }));

    // Get notifications (low stock alerts, pending requests)
    const notifications = [];
    
    // Low stock notifications
    if (lowStockItems > 0) {
      notifications.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${lowStockItems} items are running low on stock`,
        time: 'Now',
        priority: 'high'
      });
    }

    // Out of stock notifications
    if (outOfStockItems > 0) {
      notifications.push({
        id: 'out-of-stock',
        type: 'error',
        title: 'Out of Stock Alert',
        message: `${outOfStockItems} items are out of stock`,
        time: 'Now',
        priority: 'critical'
      });
    }

    // Pending requests notification
    if (pendingRequests > 0) {
      notifications.push({
        id: 'pending-requests',
        type: 'info',
        title: 'Pending Requests',
        message: `${pendingRequests} requests are waiting for approval`,
        time: 'Now',
        priority: 'medium'
      });
    }

    // Category distribution for pie chart
    const categoryStats = [
      { 
        name: 'Cleaning Supplies', 
        value: cleaningItems, 
        color: '#1a237e' 
      },
      { 
        name: 'Stationary Items', 
        value: stationaryItems, 
        color: '#3f51b5' 
      }
    ];

    res.json({
      success: true,
      data: {
        stats: {
          totalItems,
          availableItems,
          lowStockItems,
          outOfStockItems,
          totalRequests,
          pendingRequests,
          approvedRequests,
          fulfilledRequests,
          rejectedRequests,
          cleaningItems,
          stationaryItems
        },
        recentRequests,
        lowStockItemsList,
        mostRequestedItems,
        monthlyStats: formattedMonthlyStats,
        categoryStats,
        notifications
      }
    });

  } catch (error) {
    console.error('Store dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching dashboard data' 
    });
  }
});

// @route   GET /api/store/inventory/real-data
// @desc    Get real inventory data with categories
// @access  Private (Store Manager only)
router.get('/inventory/real-data', protect, authorize('store'), async (req, res) => {
  try {
    // Get all items grouped by category
    const cleaningItems = await StoreItem.find({ 
      category: 'cleaning', 
      isActive: true 
    }).sort({ name: 1 });

    const stationaryItems = await StoreItem.find({ 
      category: 'stationary', 
      isActive: true 
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: {
        cleaning: cleaningItems,
        stationary: stationaryItems,
        summary: {
          totalCleaning: cleaningItems.length,
          totalStationary: stationaryItems.length,
          lowStockCleaning: cleaningItems.filter(item => item.quantity <= item.minimumStock).length,
          lowStockStationary: stationaryItems.filter(item => item.quantity <= item.minimumStock).length
        }
      }
    });

  } catch (error) {
    console.error('Inventory data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching inventory data' 
    });
  }
});

// @route   POST /api/store/seed-data
// @desc    Seed store with real data (development only)
// @access  Private (Store Manager only)
router.post('/seed-data', protect, authorize('store'), async (req, res) => {
  try {
    // Check if items already exist
    const existingItems = await StoreItem.countDocuments();
    if (existingItems > 0) {
      return res.json({
        success: true,
        message: 'Store already has data'
      });
    }

    // Real cleaning supplies data
    const cleaningItems = [
      {
        name: 'Floor Cleaner (Lizol)',
        category: 'cleaning',
        description: 'Disinfectant floor cleaner - 1 Liter bottle',
        quantity: 15,
        unit: 'bottle',
        price: 120,
        supplier: 'Reckitt Benckiser',
        minimumStock: 20,
        addedBy: req.user.id
      },
      {
        name: 'Hand Sanitizer',
        category: 'cleaning',
        description: '70% Alcohol based hand sanitizer - 500ml',
        quantity: 25,
        unit: 'bottle',
        price: 85,
        supplier: 'Dettol',
        minimumStock: 30,
        addedBy: req.user.id
      },
      {
        name: 'Toilet Paper Roll',
        category: 'cleaning',
        description: '2-ply toilet paper roll',
        quantity: 50,
        unit: 'piece',
        price: 45,
        supplier: 'Origami',
        minimumStock: 40,
        addedBy: req.user.id
      },
      {
        name: 'Glass Cleaner (Colin)',
        category: 'cleaning',
        description: 'Glass and surface cleaner - 500ml',
        quantity: 8,
        unit: 'bottle',
        price: 95,
        supplier: 'Reckitt Benckiser',
        minimumStock: 15,
        addedBy: req.user.id
      },
      {
        name: 'Phenyl',
        category: 'cleaning',
        description: 'White phenyl for floor cleaning - 1 Liter',
        quantity: 12,
        unit: 'bottle',
        price: 65,
        supplier: 'Harpic',
        minimumStock: 20,
        addedBy: req.user.id
      },
      {
        name: 'Broom',
        category: 'cleaning',
        description: 'Coconut fiber broom',
        quantity: 6,
        unit: 'piece',
        price: 150,
        supplier: 'Local Supplier',
        minimumStock: 10,
        addedBy: req.user.id
      },
      {
        name: 'Mop',
        category: 'cleaning',
        description: 'Cotton mop with handle',
        quantity: 4,
        unit: 'piece',
        price: 200,
        supplier: 'Gala',
        minimumStock: 8,
        addedBy: req.user.id
      },
      {
        name: 'Dustbin Bags',
        category: 'cleaning',
        description: 'Large black dustbin bags - Pack of 30',
        quantity: 20,
        unit: 'packet',
        price: 180,
        supplier: 'Shalimar',
        minimumStock: 15,
        addedBy: req.user.id
      }
    ];

    // Real stationary items data
    const stationaryItems = [
      {
        name: 'A4 Paper Ream',
        category: 'stationary',
        description: 'White A4 copier paper - 500 sheets',
        quantity: 35,
        unit: 'piece',
        price: 280,
        supplier: 'JK Paper',
        minimumStock: 25,
        addedBy: req.user.id
      },
      {
        name: 'Ball Point Pen (Blue)',
        category: 'stationary',
        description: 'Blue ball point pen',
        quantity: 120,
        unit: 'piece',
        price: 10,
        supplier: 'Cello',
        minimumStock: 100,
        addedBy: req.user.id
      },
      {
        name: 'Ball Point Pen (Black)',
        category: 'stationary',
        description: 'Black ball point pen',
        quantity: 80,
        unit: 'piece',
        price: 10,
        supplier: 'Cello',
        minimumStock: 100,
        addedBy: req.user.id
      },
      {
        name: 'Marker Pen Set',
        category: 'stationary',
        description: 'Permanent marker pen set - 4 colors',
        quantity: 15,
        unit: 'box',
        price: 120,
        supplier: 'Camlin',
        minimumStock: 20,
        addedBy: req.user.id
      },
      {
        name: 'Stapler',
        category: 'stationary',
        description: 'Heavy duty stapler',
        quantity: 8,
        unit: 'piece',
        price: 250,
        supplier: 'Kangaro',
        minimumStock: 5,
        addedBy: req.user.id
      },
      {
        name: 'Stapler Pins',
        category: 'stationary',
        description: 'Stapler pins - Box of 1000',
        quantity: 25,
        unit: 'box',
        price: 35,
        supplier: 'Kangaro',
        minimumStock: 20,
        addedBy: req.user.id
      },
      {
        name: 'File Folder',
        category: 'stationary',
        description: 'Plastic file folder with elastic',
        quantity: 40,
        unit: 'piece',
        price: 45,
        supplier: 'Deli',
        minimumStock: 30,
        addedBy: req.user.id
      },
      {
        name: 'Whiteboard Marker',
        category: 'stationary',
        description: 'Whiteboard marker - Set of 4 colors',
        quantity: 12,
        unit: 'box',
        price: 180,
        supplier: 'Camlin',
        minimumStock: 15,
        addedBy: req.user.id
      },
      {
        name: 'Notebook (200 pages)',
        category: 'stationary',
        description: 'Ruled notebook - 200 pages',
        quantity: 60,
        unit: 'piece',
        price: 85,
        supplier: 'Classmate',
        minimumStock: 50,
        addedBy: req.user.id
      },
      {
        name: 'Printer Cartridge (Black)',
        category: 'stationary',
        description: 'HP 678 Black ink cartridge',
        quantity: 5,
        unit: 'piece',
        price: 650,
        supplier: 'HP',
        minimumStock: 8,
        addedBy: req.user.id
      }
    ];

    // Insert all items
    await StoreItem.insertMany([...cleaningItems, ...stationaryItems]);

    res.json({
      success: true,
      message: `Successfully seeded ${cleaningItems.length + stationaryItems.length} items`,
      data: {
        cleaningItems: cleaningItems.length,
        stationaryItems: stationaryItems.length
      }
    });

  } catch (error) {
    console.error('Seed data error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while seeding data' 
    });
  }
});

module.exports = router;
