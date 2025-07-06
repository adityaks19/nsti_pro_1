import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Avatar,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon,
  CleaningServices as CleaningIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const StoreAddItem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const units = [
    { value: 'piece', label: 'Piece' },
    { value: 'box', label: 'Box' },
    { value: 'packet', label: 'Packet' },
    { value: 'bottle', label: 'Bottle' },
    { value: 'kg', label: 'Kilogram' },
    { value: 'liter', label: 'Liter' },
    { value: 'dozen', label: 'Dozen' }
  ];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const itemData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        minimumStock: parseInt(formData.minimumStock)
      };

      const response = await axios.post('/api/store/items', itemData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Item added successfully!');
        navigate('/store/inventory');
      }
    } catch (error) {
      console.error('Add item error:', error);
      toast.error(error.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/store/inventory');
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Avatar sx={{ bgcolor: '#1a237e', width: 80, height: 80, mx: 'auto', mb: 2 }}>
          <AddIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Add New Item
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add a new item to the store inventory
        </Typography>
      </Box>

      {/* Form Card */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Item Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Item Name *"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  placeholder="Enter item name"
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    label="Category *"
                  >
                    <MenuItem value="cleaning">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CleaningIcon sx={{ mr: 1 }} />
                        Cleaning Supplies
                      </Box>
                    </MenuItem>
                    <MenuItem value="stationary">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EditIcon sx={{ mr: 1 }} />
                        Stationary Items
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Brief description of the item (optional)"
                />
              </Grid>

              {/* Quantity */}
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Initial Quantity *"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleFormChange('quantity', e.target.value)}
                  error={!!formErrors.quantity}
                  helperText={formErrors.quantity}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              {/* Unit */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Unit *</InputLabel>
                  <Select
                    value={formData.unit}
                    onChange={(e) => handleFormChange('unit', e.target.value)}
                    label="Unit *"
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Price */}
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

              {/* Supplier */}
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

              {/* Minimum Stock */}
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

              {/* Preview Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#1a237e', fontWeight: 'bold' }}>
                  Item Preview
                </Typography>
                <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Name:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formData.name || 'Not specified'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Category:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formData.category === 'cleaning' ? 'Cleaning Supplies' : 'Stationary Items'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Quantity:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formData.quantity || '0'} {formData.unit}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Unit Price:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        ₹{formData.price || '0'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Total Value:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        ₹{(parseFloat(formData.price || 0) * parseInt(formData.quantity || 0)).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Supplier:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {formData.supplier || 'Not specified'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ 
                      borderColor: '#666', 
                      color: '#666',
                      minWidth: 120
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? null : <SaveIcon />}
                    disabled={loading}
                    sx={{ 
                      bgcolor: '#1a237e', 
                      '&:hover': { bgcolor: '#0d47a1' },
                      minWidth: 120
                    }}
                  >
                    {loading ? 'Adding...' : 'Add Item'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card sx={{ mt: 4, borderRadius: 2, boxShadow: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#1a237e', fontWeight: 'bold' }}>
            <InventoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Tips for Adding Items
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Naming:</strong> Use clear, descriptive names that include brand or model when applicable.
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Minimum Stock:</strong> Set appropriate minimum levels to avoid stockouts.
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Pricing:</strong> Include all costs (purchase price + handling) for accurate tracking.
                </Typography>
              </Alert>
            </Grid>
            <Grid item xs={12} md={6}>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Supplier:</strong> Always include complete supplier information for reordering.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default StoreAddItem;
