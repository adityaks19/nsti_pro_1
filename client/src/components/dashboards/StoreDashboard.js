import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Badge,
  Divider,
  Alert,
  Tooltip,
  IconButton,
  Container,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Store as StoreIcon,
  Assignment as AssignmentIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
  LocalShipping as LocalShippingIcon,
  Schedule as ScheduleIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CleaningServices as CleaningIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const StoreDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentRequests: [],
    lowStockItemsList: [],
    mostRequestedItems: [],
    monthlyStats: [],
    categoryStats: [],
    notifications: []
  });

  // Colors for charts
  const COLORS = ['#1a237e', '#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da'];

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/store/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Seed store with real data (for development)
  const seedStoreData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/store/seed-data', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Seed data error:', error);
      toast.error('Failed to seed store data');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const approvedQuantity = prompt('Enter approved quantity:');
      
      if (!approvedQuantity || isNaN(approvedQuantity)) {
        toast.error('Please enter a valid quantity');
        return;
      }

      const response = await axios.put(`/api/store/requests/${requestId}/approve`, {
        approvedQuantity: parseInt(approvedQuantity)
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Request approved successfully');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Approve request error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const remarks = prompt('Enter rejection reason (optional):');

      const response = await axios.put(`/api/store/requests/${requestId}/reject`, {
        remarks: remarks || 'No reason provided'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Request rejected');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Reject request error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'fulfilled': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStockStatusColor = (item) => {
    if (item.quantity === 0) return 'error';
    if (item.quantity <= item.minimumStock) return 'warning';
    return 'success';
  };

  const getStockStatusText = (item) => {
    if (item.quantity === 0) return 'Out of Stock';
    if (item.quantity <= item.minimumStock) return 'Low Stock';
    return 'In Stock';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const { stats, recentRequests, lowStockItemsList, mostRequestedItems, monthlyStats, categoryStats, notifications } = dashboardData;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header with Actions */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Store Management Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Inventory management and request processing
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            sx={{ borderColor: '#1a237e', color: '#1a237e' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/store/add-item')}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Notifications Section - Top Priority */}
      {notifications && notifications.length > 0 && (
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ color: '#1a237e', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Important Notifications
              </Typography>
              <Badge badgeContent={notifications.length} color="error" sx={{ ml: 1 }} />
            </Box>
            <Grid container spacing={2}>
              {notifications.map((notification, index) => (
                <Grid item xs={12} md={4} key={notification.id || index}>
                  <Alert 
                    severity={
                      notification.type === 'error' ? 'error' : 
                      notification.type === 'warning' ? 'warning' : 'info'
                    }
                    sx={{ borderRadius: 2 }}
                    action={
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (notification.id === 'low-stock' || notification.id === 'out-of-stock') {
                            navigate('/store/inventory');
                          } else if (notification.id === 'pending-requests') {
                            navigate('/store/requests');
                          }
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {notification.title}
                    </Typography>
                    <Typography variant="body2">
                      {notification.message}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold' }}>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/store/add-item')}
                sx={{ 
                  bgcolor: '#1a237e', 
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': { bgcolor: '#0d47a1' }
                }}
              >
                Add New Item
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ViewIcon />}
                onClick={() => navigate('/store/inventory')}
                sx={{ 
                  borderColor: '#1a237e',
                  color: '#1a237e',
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': { borderColor: '#0d47a1', bgcolor: 'rgba(26, 35, 126, 0.04)' }
                }}
              >
                View Inventory
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={() => navigate('/store/requests')}
                sx={{ 
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': { borderColor: '#f57c00', bgcolor: 'rgba(255, 152, 0, 0.04)' }
                }}
              >
                Manage Requests ({stats.pendingRequests || 0})
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocalShippingIcon />}
                onClick={seedStoreData}
                sx={{ 
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  borderRadius: 2,
                  py: 1.5,
                  '&:hover': { borderColor: '#388e3c', bgcolor: 'rgba(76, 175, 80, 0.04)' }
                }}
              >
                Seed Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    {stats.totalItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 56, height: 56 }}>
                  <InventoryIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.totalItems ? (stats.availableItems / stats.totalItems) * 100 : 0} 
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {stats.availableItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Items
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.totalItems ? (stats.availableItems / stats.totalItems) * 100 : 0} 
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {stats.pendingRequests || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </Box>
                <Badge badgeContent={stats.pendingRequests || 0} color="error">
                  <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                    <ScheduleIcon />
                  </Avatar>
                </Badge>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.totalRequests ? (stats.pendingRequests / stats.totalRequests) * 100 : 0} 
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
                color="warning"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                    {stats.lowStockItems || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56 }}>
                  <WarningIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={stats.totalItems ? (stats.lowStockItems / stats.totalItems) * 100 : 0} 
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
                color="error"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Recent Requests */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                  Recent Requests
                </Typography>
                <Badge badgeContent={recentRequests?.filter(req => req.status === 'pending').length || 0} color="error">
                  <NotificationsIcon color="primary" />
                </Badge>
              </Box>
              <List sx={{ py: 0 }}>
                {recentRequests && recentRequests.slice(0, 5).map((request, index) => (
                  <React.Fragment key={request._id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ bgcolor: '#1a237e', width: 40, height: 40 }}>
                          <ShoppingCartIcon />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {request.item?.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              {request.status === 'pending' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton 
                                      size="small" 
                                      color="success"
                                      onClick={() => handleApproveRequest(request._id)}
                                    >
                                      <CheckIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleRejectRequest(request._id)}
                                    >
                                      <ClearIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {request.requestedBy?.name} ({request.requestedBy?.role}) • Qty: {request.quantityRequested}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip 
                                label={request.status?.toUpperCase()} 
                                size="small" 
                                color={getStatusColor(request.status)}
                              />
                              <Chip 
                                label={request.item?.category?.toUpperCase()} 
                                size="small" 
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < Math.min(recentRequests.length, 5) - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              {(!recentRequests || recentRequests.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent requests
                  </Typography>
                </Box>
              )}
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/store/requests')}
                sx={{ mt: 2, color: '#1a237e' }}
              >
                View All Requests
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Items */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                  Low Stock Alert
                </Typography>
                <Badge badgeContent={lowStockItemsList?.length || 0} color="error">
                  <WarningIcon color="error" />
                </Badge>
              </Box>
              {lowStockItemsList && lowStockItemsList.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {lowStockItemsList.slice(0, 5).map((item, index) => (
                    <React.Fragment key={item._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ 
                            bgcolor: getStockStatusColor(item) === 'error' ? '#f44336' : '#ff9800', 
                            width: 40, 
                            height: 40 
                          }}>
                            {item.category === 'cleaning' ? <CleaningIcon /> : <EditIcon />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {item.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Category: {item.category?.toUpperCase()}
                              </Typography>
                              <Typography variant="body2" color="error">
                                Stock: {item.quantity} {item.unit} / Min: {item.minimumStock}
                              </Typography>
                              <Chip 
                                label={getStockStatusText(item)} 
                                size="small" 
                                color={getStockStatusColor(item)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < Math.min(lowStockItemsList.length, 5) - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    All items are well stocked!
                  </Typography>
                </Box>
              )}
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/store/inventory')}
                sx={{ mt: 2, color: '#1a237e' }}
              >
                View Full Inventory
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Most Requested Items Chart - Full Width */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold' }}>
                Most Requested Items (Last 30 Days)
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mostRequestedItems || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="totalRequests" fill="#1a237e" name="Total Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution - Full Width */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, color: '#1a237e', fontWeight: 'bold' }}>
                Inventory Distribution by Category
              </Typography>
              <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(categoryStats || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StoreDashboard;
