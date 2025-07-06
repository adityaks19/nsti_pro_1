import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  CleaningServices as CleaningIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const StoreInventory = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({
    cleaning: [],
    stationary: [],
    summary: {}
  });
  const [filteredData, setFilteredData] = useState({
    cleaning: [],
    stationary: []
  });
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  
  // CRUD Dialog States
  const [itemDialog, setItemDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cleaning',
    description: '',
    quantity: '',
    unit: 'piece',
    price: '',
    supplier: '',
    minimumStock: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch inventory data
  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/store/inventory/real-data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setInventoryData(response.data.data);
        setFilteredData({
          cleaning: response.data.data.cleaning,
          stationary: response.data.data.stationary
        });
      }
    } catch (error) {
      console.error('Inventory fetch error:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Filter data based on search and stock filter
  useEffect(() => {
    const filterItems = (items) => {
      return items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStockFilter = 
          stockFilter === 'all' ||
          (stockFilter === 'in-stock' && item.quantity > item.minimumStock) ||
          (stockFilter === 'low-stock' && item.quantity <= item.minimumStock && item.quantity > 0) ||
          (stockFilter === 'out-of-stock' && item.quantity === 0);

        return matchesSearch && matchesStockFilter;
      });
    };

    setFilteredData({
      cleaning: filterItems(inventoryData.cleaning || []),
      stationary: filterItems(inventoryData.stationary || [])
    });
  }, [searchTerm, stockFilter, inventoryData]);

  // CRUD Operations
  const handleAddItem = () => {
    setEditMode(false);
    setSelectedItem(null);
    setFormData({
      name: '',
      category: 'cleaning',
      description: '',
      quantity: '',
      unit: 'piece',
      price: '',
      supplier: '',
      minimumStock: ''
    });
    setFormErrors({});
    setItemDialog(true);
  };

  const handleEditItem = (item) => {
    setEditMode(true);
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      quantity: item.quantity.toString(),
      unit: item.unit,
      price: item.price.toString(),
      supplier: item.supplier,
      minimumStock: item.minimumStock.toString()
    });
    setFormErrors({});
    setItemDialog(true);
  };

  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setDeleteDialog(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Item name is required';
    if (!formData.quantity || isNaN(formData.quantity) || formData.quantity < 0) {
      errors.quantity = 'Valid quantity is required';
    }
    if (!formData.price || isNaN(formData.price) || formData.price < 0) {
      errors.price = 'Valid price is required';
    }
    if (!formData.supplier.trim()) errors.supplier = 'Supplier is required';
    if (!formData.minimumStock || isNaN(formData.minimumStock) || formData.minimumStock < 0) {
      errors.minimumStock = 'Valid minimum stock is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveItem = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const itemData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        minimumStock: parseInt(formData.minimumStock)
      };

      let response;
      if (editMode) {
        response = await axios.put(`/api/store/items/${selectedItem._id}`, itemData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await axios.post('/api/store/items', itemData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        toast.success(`Item ${editMode ? 'updated' : 'added'} successfully`);
        setItemDialog(false);
        fetchInventoryData();
      }
    } catch (error) {
      console.error('Save item error:', error);
      toast.error(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} item`);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/store/items/${selectedItem._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Item deleted successfully');
        setDeleteDialog(false);
        fetchInventoryData();
      }
    } catch (error) {
      console.error('Delete item error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { status: 'Out of Stock', color: 'error', icon: <ErrorIcon /> };
    if (item.quantity <= item.minimumStock) return { status: 'Low Stock', color: 'warning', icon: <WarningIcon /> };
    return { status: 'In Stock', color: 'success', icon: <CheckCircleIcon /> };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const InventoryTable = ({ items, category }) => (
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Stock Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Total Value</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => {
            const stockInfo = getStockStatus(item);
            return (
              <TableRow key={item._id} hover sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ 
                      bgcolor: category === 'cleaning' ? '#1a237e' : '#3f51b5', 
                      mr: 2, 
                      width: 40, 
                      height: 40 
                    }}>
                      {category === 'cleaning' ? <CleaningIcon /> : <EditIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Chip
                    icon={stockInfo.icon}
                    label={stockInfo.status}
                    color={stockInfo.color}
                    size="small"
                  />
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.quantity} {item.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Min: {item.minimumStock} {item.unit}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {formatCurrency(item.price)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {item.supplier}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Item">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditItem(item)}
                        sx={{ 
                          color: '#1a237e',
                          '&:hover': { 
                            backgroundColor: 'rgba(26, 35, 126, 0.08)',
                            color: '#0d47a1'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Item">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteItem(item)}
                        sx={{ 
                          color: '#f44336',
                          '&:hover': { 
                            backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            color: '#d32f2f'
                          }
                        }}
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
      
      {items.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No items found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}
    </TableContainer>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Store Inventory
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete inventory management with real-time stock tracking
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchInventoryData}
            sx={{ borderColor: '#1a237e', color: '#1a237e' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddItem}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    {inventoryData.summary.totalCleaning || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cleaning Items
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 56, height: 56 }}>
                  <CleaningIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3f51b5' }}>
                    {inventoryData.summary.totalStationary || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stationary Items
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#3f51b5', width: 56, height: 56 }}>
                  <EditIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {(inventoryData.summary.lowStockCleaning || 0) + (inventoryData.summary.lowStockStationary || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock Items
                  </Typography>
                </Box>
                <Badge 
                  badgeContent={(inventoryData.summary.lowStockCleaning || 0) + (inventoryData.summary.lowStockStationary || 0)} 
                  color="error"
                >
                  <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                    <WarningIcon />
                  </Avatar>
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {((inventoryData.cleaning || []).length + (inventoryData.stationary || []).length) - 
                     ((inventoryData.summary.lowStockCleaning || 0) + (inventoryData.summary.lowStockStationary || 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Well Stocked
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search items by name, description, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Stock Filter</InputLabel>
                <Select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  label="Stock Filter"
                >
                  <MenuItem value="all">All Items</MenuItem>
                  <MenuItem value="in-stock">In Stock</MenuItem>
                  <MenuItem value="low-stock">Low Stock</MenuItem>
                  <MenuItem value="out-of-stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  {(filteredData.cleaning?.length || 0) + (filteredData.stationary?.length || 0)} items found
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {((inventoryData.summary.lowStockCleaning || 0) + (inventoryData.summary.lowStockStationary || 0)) > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 4, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => setStockFilter('low-stock')}>
              View Low Stock Items
            </Button>
          }
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            Stock Alert: {(inventoryData.summary.lowStockCleaning || 0) + (inventoryData.summary.lowStockStationary || 0)} items are running low on stock
          </Typography>
        </Alert>
      )}

      {/* Inventory Tabs */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ px: 3 }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CleaningIcon />
                  <span>Cleaning Supplies ({filteredData.cleaning?.length || 0})</span>
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditIcon />
                  <span>Stationary Items ({filteredData.stationary?.length || 0})</span>
                </Box>
              } 
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <InventoryTable items={filteredData.cleaning || []} category="cleaning" />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <InventoryTable items={filteredData.stationary || []} category="stationary" />
        </TabPanel>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={itemDialog} onClose={() => setItemDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
              {editMode ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {editMode ? 'Edit Item' : 'Add New Item'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Item Name *"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  label="Category *"
                >
                  <MenuItem value="cleaning">Cleaning Supplies</MenuItem>
                  <MenuItem value="stationary">Stationary Items</MenuItem>
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
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Brief description of the item..."
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity *"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleFormChange('quantity', e.target.value)}
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Unit *</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => handleFormChange('unit', e.target.value)}
                  label="Unit *"
                >
                  <MenuItem value="piece">Piece</MenuItem>
                  <MenuItem value="box">Box</MenuItem>
                  <MenuItem value="packet">Packet</MenuItem>
                  <MenuItem value="bottle">Bottle</MenuItem>
                  <MenuItem value="kg">Kilogram</MenuItem>
                  <MenuItem value="liter">Liter</MenuItem>
                  <MenuItem value="dozen">Dozen</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Unit Price (₹) *"
                type="number"
                value={formData.price}
                onChange={(e) => handleFormChange('price', e.target.value)}
                error={!!formErrors.price}
                helperText={formErrors.price}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Supplier *"
                value={formData.supplier}
                onChange={(e) => handleFormChange('supplier', e.target.value)}
                error={!!formErrors.supplier}
                helperText={formErrors.supplier}
                placeholder="Supplier name or company"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Stock Level *"
                type="number"
                value={formData.minimumStock}
                onChange={(e) => handleFormChange('minimumStock', e.target.value)}
                error={!!formErrors.minimumStock}
                helperText={formErrors.minimumStock || 'Alert when stock falls below this level'}
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setItemDialog(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveItem}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
          >
            {editMode ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#f44336', mr: 2 }}>
              <DeleteIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The item will be permanently removed from inventory.
          </Alert>
          {selectedItem && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete the following item?
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {selectedItem.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {selectedItem.category?.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Stock: {selectedItem.quantity} {selectedItem.unit}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supplier: {selectedItem.supplier}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialog(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Item
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreInventory;
