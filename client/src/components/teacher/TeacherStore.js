import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tab,
  Tabs,
  Badge,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Store as StoreIcon,
  RequestPage as RequestIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as ShippingIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const TeacherStore = () => {
  const [items, setItems] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [requestDialog, setRequestDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [requestData, setRequestData] = useState({
    quantity: 1,
    purpose: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchItems();
    fetchMyRequests();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/store/items', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const items = response.data.data || [];
        setItems(items);
        const uniqueCategories = [...new Set(items.map(item => item.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Error fetching store items');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/store/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMyRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleRequestItem = async () => {
    if (!selectedItem || !requestData.quantity || !requestData.purpose.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setRequestLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/store/request', {
        itemId: selectedItem._id,
        quantityRequested: parseInt(requestData.quantity),
        purpose: requestData.purpose
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Store item request submitted successfully!');
        setRequestDialog(false);
        setSelectedItem(null);
        setRequestData({ quantity: 1, purpose: '' });
        fetchMyRequests();
        fetchItems(); // Refresh to show updated quantities
      } else {
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error requesting item:', error);
      toast.error(error.response?.data?.message || 'Error submitting request');
    } finally {
      setRequestLoading(false);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ScheduleIcon />;
      case 'approved': return <CheckCircleIcon />;
      case 'fulfilled': return <ShippingIcon />;
      case 'rejected': return <WarningIcon />;
      default: return <ScheduleIcon />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.isActive;
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openRequestDialog = (item) => {
    setSelectedItem(item);
    setRequestDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Teacher Store Portal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Request store items for teaching and classroom activities
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            height: '100px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {myRequests.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Requests
                  </Typography>
                </Box>
                <RequestIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
            color: 'white',
            height: '100px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {myRequests.filter(r => r.status === 'fulfilled').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Items Received
                  </Typography>
                </Box>
                <ShippingIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
            color: 'white',
            height: '100px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {myRequests.filter(r => r.status === 'pending').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Requests
                  </Typography>
                </Box>
                <ScheduleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
            color: 'white',
            height: '100px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {filteredItems.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Available Items
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InventoryIcon />
                Available Items
                <Badge badgeContent={filteredItems.length} color="primary" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RequestIcon />
                My Requests
                <Badge badgeContent={myRequests.length} color="secondary" />
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Available Items Tab */}
      {tabValue === 0 && (
        <Box>
          {/* Search and Filter */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
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
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <InventoryIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No items found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
                          <StoreIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '1rem',
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {item.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.category}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={item.category} 
                          size="small" 
                          sx={{ mb: 1, mr: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={`${item.quantity} ${item.unit} available`} 
                          size="small" 
                          color={item.quantity > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Description:</strong> {item.description}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Unit:</strong> {item.unit}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>Price:</strong> ₹{item.price} per {item.unit}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<RequestIcon />}
                          onClick={() => openRequestDialog(item)}
                          disabled={item.quantity === 0}
                          sx={{ 
                            flexGrow: 1,
                            bgcolor: '#1a237e',
                            '&:hover': { bgcolor: '#0d47a1' }
                          }}
                        >
                          Request
                        </Button>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => openRequestDialog(item)}
                            sx={{ color: '#1a237e' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* My Requests Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
              My Store Requests
            </Typography>
            
            {myRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <RequestIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No requests yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by requesting some items from the Available Items tab
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Purpose</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Request Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myRequests.map((request) => (
                      <TableRow key={request._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: '#1a237e' }}>
                              <StoreIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {request.item?.name || 'Unknown Item'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.item?.category}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.quantityRequested} {request.item?.unit}
                            {request.approvedQuantity && request.approvedQuantity !== request.quantityRequested && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Approved: {request.approvedQuantity} {request.item?.unit}
                              </Typography>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.purpose}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(request.status)}
                            label={request.status?.toUpperCase() || 'UNKNOWN'}
                            color={getStatusColor(request.status)}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(request.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.remarks || 'N/A'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Request Item Dialog */}
      <Dialog 
        open={requestDialog} 
        onClose={() => setRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1a237e', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <RequestIcon />
          Request Store Item
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedItem && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                You are about to request this item for teaching purposes. 
                Please specify the quantity needed and purpose.
              </Alert>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 56, height: 56 }}>
                  <StoreIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {selectedItem.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedItem.category}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Available:</strong> {selectedItem.quantity} {selectedItem.unit}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Price:</strong> ₹{selectedItem.price} per {selectedItem.unit}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Description:</strong> {selectedItem.description}
                  </Typography>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                type="number"
                label="Quantity Needed"
                value={requestData.quantity}
                onChange={(e) => setRequestData({ ...requestData, quantity: e.target.value })}
                inputProps={{ min: 1, max: selectedItem.quantity }}
                sx={{ mb: 2 }}
                helperText={`Available: ${selectedItem.quantity} ${selectedItem.unit}`}
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Purpose (Required)"
                value={requestData.purpose}
                onChange={(e) => setRequestData({ ...requestData, purpose: e.target.value })}
                placeholder="Please specify the purpose for requesting this item (e.g., classroom demonstration, lab experiment, etc.)"
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setRequestDialog(false)}
            disabled={requestLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRequestItem}
            variant="contained"
            disabled={requestLoading}
            startIcon={requestLoading ? <CircularProgress size={20} /> : <RequestIcon />}
            sx={{ 
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d47a1' }
            }}
          >
            {requestLoading ? 'Requesting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherStore;
