import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  Container,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  MenuBook as LibraryIcon,
  Store as StoreIcon,
  People as UsersIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  School as SchoolIcon,
  Assignment as RequestIcon,
  Inventory as InventoryIcon,
  SupervisorAccount as AdminIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Assessment as ReportsIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Book as MenuBookIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);

  const getMenuItems = () => {
    const baseItems = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    ];

    const roleSpecificItems = {
      admin: [
        { text: 'Users', icon: <UsersIcon />, path: '/dashboard/admin/users' },
        { text: 'Library', icon: <LibraryIcon />, path: '/dashboard/admin/library' },
        { text: 'Store', icon: <StoreIcon />, path: '/dashboard/admin/store' },
        { text: 'Analytics & Reports', icon: <AnalyticsIcon />, path: '/dashboard/admin/analytics' },
        { text: 'System Settings', icon: <SettingsIcon />, path: '/dashboard/admin/settings' },
      ],
      librarian: [
        { text: 'All Books', icon: <LibraryIcon />, path: '/dashboard/library/books' },
        { text: 'Manage Books', icon: <MenuBookIcon />, path: '/dashboard/library/manage-books' },
        { text: 'Add Book', icon: <AddIcon />, path: '/dashboard/library/add-book' },
        { text: 'Book Requests', icon: <RequestIcon />, path: '/dashboard/library/requests' },
        { text: 'Students Data', icon: <UsersIcon />, path: '/dashboard/library/students' },
      ],
      store: [
        { text: 'Inventory', icon: <InventoryIcon />, path: '/dashboard/store/inventory' },
        { text: 'Requests', icon: <RequestIcon />, path: '/dashboard/store/requests' },
      ],
      to: [
        { text: 'Students', icon: <UsersIcon />, path: '/dashboard/to/students' },
        { text: 'Leave', icon: <RequestIcon />, path: '/dashboard/to/leave-management' },
        { text: 'Library', icon: <LibraryIcon />, path: '/dashboard/to/library' },
        { text: 'Store Items', icon: <StoreIcon />, path: '/dashboard/to/store' },
      ],
      teacher: [
        { text: 'Leave Applications', icon: <RequestIcon />, path: '/dashboard/teacher/leave-applications' },
        { text: 'Library Books', icon: <LibraryIcon />, path: '/dashboard/library/books' },
        { text: 'My Book Requests', icon: <RequestIcon />, path: '/dashboard/library/requests' },
        { text: 'Store Inventory', icon: <InventoryIcon />, path: '/dashboard/store/inventory' },
        { text: 'My Store Requests', icon: <RequestIcon />, path: '/dashboard/store/requests' },
      ],
      student: [
        { text: 'Leave Application', icon: <RequestIcon />, path: '/dashboard/student/leave-application' },
        { text: 'Library Books', icon: <LibraryIcon />, path: '/dashboard/library/books' },
        { text: 'My Book Requests', icon: <RequestIcon />, path: '/dashboard/library/requests' },
      ],
    };

    return [
      ...baseItems,
      ...(roleSpecificItems[user?.role] || []),
    ];
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: '#dc2626',
      librarian: '#059669',
      store: '#d97706',
      to: '#7c3aed',
      teacher: '#2563eb',
      student: '#0891b2',
    };
    return colors[role] || '#6b7280';
  };

  const getRoleDisplayName = (role) => {
    const names = {
      admin: 'Administrator',
      librarian: 'Librarian',
      store: 'Store Manager',
      to: 'Training Officer',
      teacher: 'Teacher',
      student: 'Student',
    };
    return names[role] || role;
  };

  const menuItems = getMenuItems();
  const currentIndex = menuItems.findIndex(item => location.pathname === item.path);

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        boxShadow: '0 4px 20px rgba(30, 58, 138, 0.3)',
        zIndex: 1200
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ minHeight: '70px !important', py: 1 }}>
          {/* Logo and System Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'rgba(255,255,255,0.2)',
                mr: 2,
              }}
            >
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                NSTI College
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                System
              </Typography>
            </Box>
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
            <Tabs
              value={currentIndex >= 0 ? currentIndex : 0}
              onChange={(e, newValue) => handleNavigation(menuItems[newValue]?.path)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                flexGrow: 1,
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 500,
                  minHeight: 48,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                  maxWidth: 'none',
                  padding: '6px 16px',
                  '&.Mui-selected': {
                    color: 'white',
                    fontWeight: 600,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
                '& .MuiTabs-flexContainer': {
                  gap: 1,
                },
                '& .MuiTabs-scrollButtons': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                },
              }}
            >
                  gap: 1,
                },
              }}
            >
              {menuItems.map((item, index) => (
                <Tab
                  key={index}
                  icon={item.icon}
                  label={item.text}
                  iconPosition="start"
                  sx={{
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.1rem',
                      mr: 0.5,
                    },
                    '& .MuiTab-iconWrapper': {
                      marginBottom: 0,
                    },
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'clip',
                    minWidth: 'fit-content',
                    maxWidth: 'none',
                    width: 'auto',
                    flexShrink: 0,
                  }}
                />
              ))}
                    textOverflow: 'ellipsis',
                    maxWidth: '200px',
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* Right Side - User Info and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notifications */}
            <IconButton
              sx={{ 
                color: 'rgba(255,255,255,0.8)',
                '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <NotificationsIcon />
            </IconButton>

            {/* User Role Chip */}
            <Chip
              label={getRoleDisplayName(user?.role)}
              size="small"
              sx={{
                bgcolor: getRoleColor(user?.role),
                color: 'white',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />

            {/* User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                  {user?.email}
                </Typography>
              </Box>
              <IconButton
                onClick={handleMenuOpen}
                sx={{ 
                  p: 0.5,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: getRoleColor(user?.role),
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>

            {/* User Menu Dropdown */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                },
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {user?.email}
                </Typography>
              </Box>
              <MenuItem 
                onClick={() => {
                  handleNavigation('/dashboard/profile');
                  handleMenuClose();
                }}
                sx={{ py: 1.5 }}
              >
                <ProfileIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                Profile Settings
              </MenuItem>
              <Divider />
              <MenuItem 
                onClick={handleLogout}
                sx={{ py: 1.5, color: '#dc2626' }}
              >
                <LogoutIcon sx={{ mr: 2, fontSize: '1.2rem' }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Sidebar;
