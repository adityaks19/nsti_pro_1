import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Alert,
  Snackbar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Store as StoreIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import axios from 'axios';

const StoreManagement = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [items, setItems] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    quantity: 0,
    minQuantity: 5,
    unit: '',
    price: 0,
    supplier: '',
  });

  const categories = [
    'Cleaning Supplies',
    'Stationary',
    'Office Supplies',
    'Maintenance',
    'Safety Equipment',
    'Electronics',
    'Furniture',
    'Other'
  ];

  const units = [
    'Pieces',
    'Boxes',
    'Packets',
    'Bottles',
    'Rolls',
    'Sets',
    'Kilograms',
    'Liters',
    'Meters'
  ];

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const [itemsRes, requestsRes, statsRes] = await Promise.all([
        axios.get('/api/store/items'),
        axios.get('/api/store/requests'),
        axios.get('/api/store/stats')
      ]);
      
      setItems(itemsRes.data.data || []);
      setRequests(requestsRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (error) {
      console.error('Error fetching store data:', error);
      showSnackbar('Error fetching store data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: '',
      description: '',
      quantity: 0,
      minQuantity: 5,
      unit: '',
      price: 0,
      supplier: '',
    });
    setOpenDialog(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      quantity: item.quantity,
      minQuantity: item.minQuantity || 5,
      unit: item.unit || '',
      price: item.price || 0,
      supplier: item.supplier || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`/api/store/items/${itemId}`);
        fetchStoreData();
        showSnackbar('Item deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting item:', error);
        showSnackbar('Error deleting item', 'error');
      }
    }
  };

  const handleSubmitItem = async () => {
    try {
      if (editingItem) {
        await axios.put(`/api/store/items/${editingItem._id}`, formData);
        showSnackbar('Item updated successfully', 'success');
      } else {
        await axios.post('/api/store/items', formData);
        showSnackbar('Item added successfully', 'success');
      }
      setOpenDialog(false);
      fetchStoreData();
    } catch (error) {
      console.error('Error saving item:', error);
      showSnackbar('Error saving item', 'error');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.put(`/api/store/requests/${requestId}/approve`);
      fetchStoreData();
      showSnackbar('Request approved successfully', 'success');
    } catch (error) {
      console.error('Error approving request:', error);
      showSnackbar('Error approving request', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`/api/store/requests/${requestId}/reject`);
      fetchStoreData();
      showSnackbar('Request rejected', 'info');
    } catch (error) {
      console.error('Error rejecting request:', error);
      showSnackbar('Error rejecting request', 'error');
    }
  };

  const handleFulfillRequest = async (requestId) => {
    try {
      await axios.put(`/api/store/requests/${requestId}/fulfill`);
      fetchStoreData();
      showSnackbar('Request fulfilled successfully', 'success');
    } catch (error) {
      console.error('Error fulfilling request:', error);
      showSnackbar('Error fulfilling request', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'fulfilled': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const getStockLevel = (item) => {
    const percentage = (item.quantity / (item.minQuantity * 3)) * 100;
    if (item.quantity <= item.minQuantity) return 'critical';
    if (percentage <= 50) return 'low';
    return 'good';
  };

  const getStockColor = (level) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'low': return '#f59e0b';
      case 'good': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
          Store 
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchStoreData}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ bgcolor: '#d97706' }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#d97706', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <InventoryIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.totalItems || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#ef4444', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <TrendingDownIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.lowStockItems || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Low Stock Items
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#f59e0b', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <AssignmentIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.pendingRequests || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#3b82f6', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <ShoppingCartIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.totalValue || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Value (₹)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Inventory" 
            icon={<InventoryIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={requests.filter(r => r.status === 'pending').length} color="error">
                Requests
              </Badge>
            } 
            icon={<AssignmentIcon />} 
            iconPosition="start"
          />
        </Tabs>

        {/* Inventory Tab */}
        <TabPanel value={currentTab} index={0}>
          {/* Search and Filter */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search items by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Showing {filteredItems.length} items
              </Typography>
            </Grid>
          </Grid>

          {/* Items Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Item Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Stock Level</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => {
                  const stockLevel = getStockLevel(item);
                  const stockPercentage = Math.min((item.quantity / (item.minQuantity * 3)) * 100, 100);
                  
                  return (
                    <TableRow key={item._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {item.description}
                          </Typography>
                          {item.supplier && (
                            <Typography variant="caption" color="textSecondary">
                              Supplier: {item.supplier}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{ bgcolor: '#e0f2fe', color: '#0277bd' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            {item.quantity} {item.unit}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={stockPercentage}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(0,0,0,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getStockColor(stockLevel),
                                borderRadius: 3,
                              },
                            }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            Min: {item.minQuantity} {item.unit}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          ₹{item.price || 0}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            stockLevel === 'critical' ? 'Critical' :
                            stockLevel === 'low' ? 'Low Stock' : 'In Stock'
                          }
                          color={
                            stockLevel === 'critical' ? 'error' :
                            stockLevel === 'low' ? 'warning' : 'success'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Details">
                            <IconButton size="small" sx={{ color: '#3b82f6' }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Item">
                            <IconButton
                              size="small"
                              onClick={() => handleEditItem(item)}
                              sx={{ color: '#059669' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Item">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteItem(item._id)}
                              sx={{ color: '#dc2626' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Requests Tab */}
        <TabPanel value={currentTab} index={1}>
          <List>
            {requests.map((request) => (
              <React.Fragment key={request._id}>
                <ListItem
                  sx={{
                    bgcolor: request.status === 'pending' ? '#fffbeb' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getStatusColor(request.status) }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {request.item?.name || 'Unknown Item'}
                        </Typography>
                        <Chip
                          label={request.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(request.status),
                            color: 'white',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Requested by: {request.user?.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Quantity: {request.quantity} {request.item?.unit}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Date: {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                        {request.reason && (
                          <Typography variant="body2" color="textSecondary">
                            Reason: {request.reason}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  {request.status === 'pending' && (
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleApproveRequest(request._id)}
                        startIcon={<CheckCircleIcon />}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleRejectRequest(request._id)}
                        startIcon={<CancelIcon />}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                  {request.status === 'approved' && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleFulfillRequest(request._id)}
                      sx={{ bgcolor: '#3b82f6' }}
                    >
                      Mark Fulfilled
                    </Button>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={currentTab === 0 ? filteredItems.length : requests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add/Edit Item Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Quantity"
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  label="Unit"
                >
                  {units.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Price per Unit (₹)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitItem} variant="contained">
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoreManagement;
