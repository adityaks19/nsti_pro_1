const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/settings
// @desc    Get system settings
// @access  Private (Admin only)
router.get('/settings', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // In a real application, these would be stored in a database
    const settings = {
      general: {
        systemName: 'NSTI College Management System',
        systemEmail: 'admin@nsti.edu',
        maxBookIssueLimit: 5,
        bookReturnDays: 14,
        finePerDay: 5,
        enableNotifications: true,
        enableEmailAlerts: true,
        maintenanceMode: false,
      },
      security: {
        passwordMinLength: 8,
        requireSpecialChars: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        enableTwoFactor: false,
        autoLogoutTime: 60,
      },
      notifications: {
        overdueBookReminders: true,
        lowStockAlerts: true,
        newRequestNotifications: true,
        systemMaintenanceAlerts: true,
        emailFrequency: 'daily',
        smsNotifications: false,
      }
    };

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put('/settings', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // In a real application, you would save these to a database
    const updatedSettings = req.body;
    
    // Here you would validate and save the settings
    console.log('Settings updated:', updatedSettings);

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/backup
// @desc    Create system backup
// @access  Private (Admin only)
router.post('/backup', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // In a real application, this would create an actual backup
    const backupId = `backup_${Date.now()}`;
    
    // Simulate backup creation
    setTimeout(() => {
      console.log(`Backup ${backupId} created successfully`);
    }, 1000);

    res.json({
      success: true,
      message: 'Backup initiated successfully',
      data: {
        backupId,
        timestamp: new Date(),
        status: 'in_progress'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/update
// @desc    Check for system updates
// @access  Private (Admin only)
router.post('/update', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Simulate update check
    const updateInfo = {
      currentVersion: '2.1.0',
      latestVersion: '2.1.1',
      updateAvailable: Math.random() > 0.5,
      releaseNotes: [
        'Bug fixes and performance improvements',
        'Enhanced security features',
        'New dashboard analytics'
      ]
    };

    res.json({
      success: true,
      message: 'Update check completed',
      data: updateInfo
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
