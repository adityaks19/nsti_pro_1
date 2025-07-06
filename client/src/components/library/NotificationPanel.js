import React, { useState } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Book as BookIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
  MarkEmailRead as MarkReadIcon
} from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';

const NotificationPanel = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, markAsRead, markAllAsRead, removeNotification, getUnreadCount } = useNotifications();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleRemove = (notificationId) => {
    removeNotification(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'book_request':
        return <BookIcon color="primary" />;
      case 'overdue_reminder':
        return <WarningIcon color="warning" />;
      case 'book_returned':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'book_request':
        return '#1a237e';
      case 'overdue_reminder':
        return '#ff9800';
      case 'book_returned':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={getUnreadCount()} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            borderRadius: 2,
            mt: 1,
            zIndex: 1400
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Notifications
            </Typography>
            {getUnreadCount() > 0 && (
              <Button
                size="small"
                startIcon={<MarkReadIcon />}
                onClick={markAllAsRead}
                sx={{ color: '#1a237e' }}
              >
                Mark all read
              </Button>
            )}
          </Box>
          {getUnreadCount() > 0 && (
            <Typography variant="body2" color="text.secondary">
              {getUnreadCount()} unread notifications
            </Typography>
          )}
        </Box>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
            {notifications.slice(0, 10).map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'rgba(26, 35, 126, 0.04)',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <ListItemIcon>
                    <Avatar
                      sx={{
                        bgcolor: getNotificationColor(notification.type),
                        width: 40,
                        height: 40
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: notification.read ? 'normal' : 'bold',
                            flex: 1
                          }}
                        >
                          {notification.title || notification.message}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemove(notification.id)}
                          sx={{ ml: 1 }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    secondary={
                      <Box>
                        {notification.title && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {notification.message}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(notification.timestamp)}
                          </Typography>
                          {!notification.read && (
                            <Button
                              size="small"
                              onClick={() => handleMarkAsRead(notification.id)}
                              sx={{ color: '#1a237e', minWidth: 'auto', p: 0.5 }}
                            >
                              Mark read
                            </Button>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll see notifications here when there are new book requests or updates
            </Typography>
          </Box>
        )}

        {/* Footer */}
        {notifications.length > 10 && (
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
            <Button variant="text" sx={{ color: '#1a237e' }}>
              View all notifications
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationPanel;
