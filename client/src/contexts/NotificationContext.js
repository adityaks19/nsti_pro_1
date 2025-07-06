import React, { createContext, useContext, useState, useEffect } from 'react';
import { Snackbar, Alert, Badge } from '@mui/material';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 6000
  });

  // Add notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show snackbar for important notifications
    if (notification.showSnackbar !== false) {
      showSnackbar(notification.message, notification.severity || 'info');
    }
  };

  // Show snackbar
  const showSnackbar = (message, severity = 'info', autoHideDuration = 6000) => {
    setSnackbar({
      open: true,
      message,
      severity,
      autoHideDuration
    });
  };

  // Close snackbar
  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remove notification
  const removeNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Get unread count
  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Simulate real-time notifications for demo
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random notifications
      const randomNotifications = [
        {
          type: 'book_request',
          title: 'New Book Request',
          message: 'New book request received from student',
          severity: 'info',
          showSnackbar: false
        },
        {
          type: 'overdue_reminder',
          title: 'Overdue Books',
          message: 'Some books are overdue today',
          severity: 'warning',
          showSnackbar: false
        },
        {
          type: 'book_returned',
          title: 'Book Returned',
          message: 'A book has been returned',
          severity: 'success',
          showSnackbar: false
        }
      ];

      // Add random notification occasionally
      if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const randomNotification = randomNotifications[
          Math.floor(Math.random() * randomNotifications.length)
        ];
        addNotification(randomNotification);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const value = {
    notifications,
    addNotification,
    showSnackbar,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      
      {/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.autoHideDuration}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%', borderRadius: 0 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
