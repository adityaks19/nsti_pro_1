import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  LocalShipping as ShippingIcon,
  CleaningServices as CleaningIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const StoreRequestsTracker = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, tabValue, searchTerm]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/store/requests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      showAlert('Error fetching store requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.item?.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status based on tab
    switch (tabValue) {
      case 1:
        filtered = filtered.filter(request => request.status === 'pending');
        break;
      case 2:
        filtered = filtered.filter(request => request.status === 'approved');
        break;
      case 3:
        filtered = filtered.filter(request => request.status === 'fulfilled');
        break;
      case 4:
        filtered = filtered.filter(request => request.status === 'rejected');
        break;
      default:
        // All requests
        break;
    }

    setFilteredRequests(filtered);
  };

  const showAlert = (message, severity) => {
    setAlert({ show: true, message, severity });
    setTimeout(() => setAlert({ show: false, message: '', severity: 'info' }), 5000);
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
      case 'rejected': return <CancelIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getCategoryIcon = (category) => {
    return category === 'cleaning' ? <CleaningIcon /> : <EditIcon />;
  };

  const getCategoryColor = (category) => {
    return category === 'cleaning' ? '#4caf50' : '#2196f3';
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDetailsDialog(true);
  };

  const getRequestCounts = () => {
    return {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      fulfilled: requests.filter(r => r.status === 'fulfilled').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  };

  const counts = getRequestCounts();

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
          <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          My Store Requests
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track your store item requests and their status
        </Typography>
      </Box>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by item name, purpose, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchRequests}
                sx={{ height: '56px' }}
              >
                Refresh Requests
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 60,
              fontSize: '0.9rem',
              fontWeight: 600,
            }
          }}
        >
          <Tab 
            icon={<Badge badgeContent={counts.all} color="primary"><AssignmentIcon /></Badge>} 
            label="All Requests"
            iconPosition="start"
          />
          <Tab 
            icon={<Badge badgeContent={counts.pending} color="warning"><ScheduleIcon /></Badge>} 
            label="Pending"
            iconPosition="start"
          />
          <Tab 
            icon={<Badge badgeContent={counts.approved} color="info"><CheckCircleIcon /></Badge>} 
            label="Approved"
            iconPosition="start"
          />
          <Tab 
            icon={<Badge badgeContent={counts.fulfilled} color="success"><ShippingIcon /></Badge>} 
            label="Fulfilled"
            iconPosition="start"
          />
          <Tab 
            icon={<Badge badgeContent={counts.rejected} color="error"><CancelIcon /></Badge>} 
            label="Rejected"
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <AssignmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No requests found
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'You haven\'t made any store requests yet'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Item Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Purpose</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Request Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getCategoryColor(request.item?.category),
                            mr: 2,
                            width: 32,
                            height: 32
                          }}
                        >
                          {getCategoryIcon(request.item?.category)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {request.item?.name}
                          </Typography>
                          <Chip 
                            label={request.item?.category}
                            size="small"
                            sx={{ 
                              bgcolor: getCategoryColor(request.item?.category),
                              color: 'white',
                              fontSize: '0.7rem',
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {request.quantityRequested} {request.item?.unit}(s)
                      </Typography>
                      {request.approvedQuantity && request.approvedQuantity !== request.quantityRequested && (
                        <Typography variant="caption" color="textSecondary">
                          Approved: {request.approvedQuantity} {request.item?.unit}(s)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {request.purpose}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        color={getStatusColor(request.status)}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(request.requestDate), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(request.requestDate), 'hh:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => handleViewDetails(request)}
                          sx={{ color: 'primary.main' }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Request Details Dialog */}
      <Dialog 
        open={detailsDialog} 
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Request Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ pt: 2 }}>
              {/* Item Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Item Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getCategoryColor(selectedRequest.item?.category),
                            mr: 2,
                            width: 48,
                            height: 48
                          }}
                        >
                          {getCategoryIcon(selectedRequest.item?.category)}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {selectedRequest.item?.name}
                          </Typography>
                          <Chip 
                            label={selectedRequest.item?.category}
                            size="small"
                            sx={{ 
                              bgcolor: getCategoryColor(selectedRequest.item?.category),
                              color: 'white',
                              textTransform: 'capitalize'
                            }}
                          />
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Unit Price:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ₹{selectedRequest.item?.price}/{selectedRequest.item?.unit}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Request Details */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Request Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Quantity Requested:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {selectedRequest.quantityRequested} {selectedRequest.item?.unit}(s)
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Total Cost:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ₹{(selectedRequest.item?.price * selectedRequest.quantityRequested).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Purpose:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                        {selectedRequest.purpose}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Status Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    <CalendarIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Status Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Current Status:</Typography>
                      <Chip
                        icon={getStatusIcon(selectedRequest.status)}
                        label={selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                        color={getStatusColor(selectedRequest.status)}
                        sx={{ fontWeight: 500, mt: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Request Date:</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                        {format(new Date(selectedRequest.requestDate), 'MMM dd, yyyy hh:mm a')}
                      </Typography>
                    </Grid>
                    
                    {selectedRequest.approvedQuantity && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">Approved Quantity:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 1, color: 'info.main' }}>
                            {selectedRequest.approvedQuantity} {selectedRequest.item?.unit}(s)
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="textSecondary">Approved By:</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                            {selectedRequest.approvedBy?.name || 'Store Manager'}
                          </Typography>
                        </Grid>
                      </>
                    )}

                    {selectedRequest.fulfilledDate && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">Fulfilled Date:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 1, color: 'success.main' }}>
                          {format(new Date(selectedRequest.fulfilledDate), 'MMM dd, yyyy hh:mm a')}
                        </Typography>
                      </Grid>
                    )}

                    {selectedRequest.remarks && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">Remarks:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                          {selectedRequest.remarks}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreRequestsTracker;
