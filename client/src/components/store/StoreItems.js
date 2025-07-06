import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Store as StoreIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  CleaningServices as CleaningIcon,
  Edit as EditIcon,
  ShoppingCart as CartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

const StoreItems = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tabValue, setTabValue] = useState(0);
  const [requestDialog, setRequestDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestData, setRequestData] = useState({
    quantityRequested: 1,
    purpose: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, categoryFilter, tabValue]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/store/items', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      showAlert('Error fetching store items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category based on tab
    if (tabValue === 1) {
      filtered = filtered.filter(item => item.category === 'cleaning');
    } else if (tabValue === 2) {
      filtered = filtered.filter(item => item.category === 'stationary');
    }

    // Filter by stock status
    if (categoryFilter === 'in-stock') {
      filtered = filtered.filter(item => item.quantity > 0);
    } else if (categoryFilter === 'low-stock') {
      filtered = filtered.filter(item => item.quantity <= item.minimumStock && item.quantity > 0);
    } else if (categoryFilter === 'out-of-stock') {
      filtered = filtered.filter(item => item.quantity === 0);
    }

    setFilteredItems(filtered);
  };

  const handleRequestItem = (item) => {
    setSelectedItem(item);
    setRequestData({
      quantityRequested: 1,
      purpose: ''
    });
    setRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestData.purpose.trim()) {
      showAlert('Please provide a purpose for the request', 'error');
      return;
    }

    if (requestData.quantityRequested > selectedItem.quantity) {
      showAlert(`Only ${selectedItem.quantity} ${selectedItem.unit}(s) available`, 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post('/api/store/request', {
        itemId: selectedItem._id,
        quantityRequested: parseInt(requestData.quantityRequested),
        purpose: requestData.purpose
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        showAlert('Request submitted successfully!', 'success');
        setRequestDialog(false);
        fetchItems(); // Refresh items
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      showAlert(error.response?.data?.message || 'Error submitting request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
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

  const getCategoryIcon = (category) => {
    return category === 'cleaning' ? <CleaningIcon /> : <EditIcon />;
  };

  const getCategoryColor = (category) => {
    return category === 'cleaning' ? '#4caf50' : '#2196f3';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Alert */}
      {alert.show && (
        <Alert 
          severity={alert.severity} 
          sx={{ mb: 2 }}
          onClose={() => setAlert({ show: false, message: '', severity: 'info' })}
        >
          {alert.message}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
          <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Store Items
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Browse and request items from the store inventory
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search items, description, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Stock Status</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  label="Stock Status"
                >
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="low-stock">Low Stock</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchItems}
                sx={{ height: '56px' }}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 60,
              fontSize: '1rem',
              fontWeight: 600,
            }
          }}
        >
          <Tab 
            icon={<InventoryIcon />} 
            label={`All Items (${items.length})`}
            iconPosition="start"
          />
          <Tab 
            icon={<CleaningIcon />} 
            label={`Cleaning (${items.filter(item => item.category === 'cleaning').length})`}
            iconPosition="start"
          />
          <Tab 
            icon={<EditIcon />} 
            label={`Stationary (${items.filter(item => item.category === 'stationary').length})`}
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <StoreIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No items found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No items available in the store'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Item Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: getCategoryColor(item.category),
                        mr: 2,
                        width: 40,
                        height: 40
                      }}
                    >
                      {getCategoryIcon(item.category)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                        {item.name}
                      </Typography>
                      <Chip 
                        label={item.category}
                        size="small"
                        sx={{ 
                          bgcolor: getCategoryColor(item.category),
                          color: 'white',
                          fontSize: '0.75rem',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Item Details */}
                  <Box sx={{ flex: 1, mb: 2 }}>
                    {item.description && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {item.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Supplier:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.supplier}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Price:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ₹{item.price}/{item.unit}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Available:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.quantity} {item.unit}(s)
                      </Typography>
                    </Box>

                    {/* Stock Status */}
                    <Chip
                      label={getStockStatusText(item)}
                      color={getStockStatusColor(item)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  {/* Action Button */}
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CartIcon />}
                    onClick={() => handleRequestItem(item)}
                    disabled={item.quantity === 0}
                    sx={{
                      bgcolor: getCategoryColor(item.category),
                      '&:hover': {
                        bgcolor: getCategoryColor(item.category),
                        filter: 'brightness(0.9)'
                      }
                    }}
                  >
                    {item.quantity === 0 ? 'Out of Stock' : 'Request Item'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Request Dialog */}
      <Dialog 
        open={requestDialog} 
        onClose={() => setRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Request Item: {selectedItem?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Item Info */}
            <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Category:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {selectedItem?.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Available:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedItem?.quantity} {selectedItem?.unit}(s)
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Price:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      ₹{selectedItem?.price}/{selectedItem?.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Supplier:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedItem?.supplier}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Request Form */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quantity Requested"
                  type="number"
                  value={requestData.quantityRequested}
                  onChange={(e) => setRequestData({
                    ...requestData,
                    quantityRequested: Math.max(1, parseInt(e.target.value) || 1)
                  })}
                  inputProps={{ 
                    min: 1, 
                    max: selectedItem?.quantity || 1 
                  }}
                  helperText={`Maximum available: ${selectedItem?.quantity} ${selectedItem?.unit}(s)`}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose/Reason"
                  multiline
                  rows={3}
                  value={requestData.purpose}
                  onChange={(e) => setRequestData({
                    ...requestData,
                    purpose: e.target.value
                  })}
                  placeholder="Please specify the purpose for requesting this item..."
                  required
                />
              </Grid>
            </Grid>

            {/* Total Cost */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="h6" sx={{ color: 'primary.contrastText' }}>
                Total Cost: ₹{((selectedItem?.price || 0) * (requestData.quantityRequested || 1)).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setRequestDialog(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitRequest}
            variant="contained"
            disabled={submitting || !requestData.purpose.trim()}
            startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreItems;
