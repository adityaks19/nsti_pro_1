import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Book as BookIcon,
  RequestPage as RequestIcon,
  People as PeopleIcon,
  AccountCircle as AccountIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  List as ListIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

const LibraryLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { getUnreadCount } = useNotifications();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/librarian/dashboard' },
    { text: 'All Books', icon: <ListIcon />, path: '/librarian/books' },
    { text: 'Add Book', icon: <AddIcon />, path: '/librarian/add-book' },
    { text: 'Book Requests', icon: <RequestIcon />, path: '/librarian/requests' },
    { text: 'Students Data', icon: <PeopleIcon />, path: '/librarian/students' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Mobile drawer content
  const drawer = (
    <Box sx={{ width: 250, height: '100%', bgcolor: '#1a237e' }}>
      <Box sx={{ p: 3, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <BookIcon sx={{ fontSize: 40, color: '#fff', mb: 1 }} />
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
          Library Management
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          NSTI College
        </Typography>
      </Box>
      
      <List sx={{ pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 2,
              bgcolor: isActiveRoute(item.path) ? 'rgba(255,255,255,0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.05)',
              },
              borderLeft: isActiveRoute(item.path) ? '4px solid #fff' : '4px solid transparent'
            }}
          >
            <ListItemIcon sx={{ color: '#fff', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                color: '#fff',
                '& .MuiTypography-root': {
                  fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal'
                }
              }} 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: '#fff',
          color: '#1a237e',
          borderRadius: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Left Section - Logo and Title */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <BookIcon sx={{ fontSize: 32, color: '#1a237e', mr: 2 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
                Library Management
              </Typography>
              <Typography variant="caption" color="text.secondary">
                NSTI College System
              </Typography>
            </Box>
          </Box>

          {/* Center Section - Navigation Menu (Desktop) */}
          <Box sx={{ 
            display: { xs: 'none', md: 'flex' }, 
            gap: 1,
            bgcolor: 'rgba(26, 35, 126, 0.05)',
            borderRadius: 3,
            p: 0.5
          }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                startIcon={item.icon}
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActiveRoute(item.path) ? '#fff' : '#1a237e',
                  bgcolor: isActiveRoute(item.path) ? '#1a237e' : 'transparent',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  fontWeight: isActiveRoute(item.path) ? 'bold' : 'normal',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: isActiveRoute(item.path) ? '#0d47a1' : 'rgba(26, 35, 126, 0.1)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>

          {/* Right Section - Notifications and Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationPanel />

            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
            >
              <Avatar sx={{ width: 36, height: 36, bgcolor: '#1a237e' }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: { borderRadius: 2, mt: 1 }
              }}
            >
              <MenuItem onClick={handleProfileMenuClose}>
                <ListItemIcon>
                  <AccountIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            borderRadius: 0,
            border: 'none'
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default LibraryLayout;
