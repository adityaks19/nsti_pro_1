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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as FulfillIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const StoreRequests = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [approveDialog, setApproveDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [approvedQuantity, setApprovedQuantity] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch requests data
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/store/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRequests(response.data.data);
        setFilteredRequests(response.data.data);
      }
    } catch (error) {
      console.error('Requests fetch error:', error);
      toast.error('Failed to load requests data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Filter requests based on search and status
  useEffect(() => {
    const filtered = requests.filter(request => {
      const matchesSearch = 
        request.item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

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
      case 'fulfilled': return <FulfillIcon />;
      case 'rejected': return <ErrorIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const handleApprove = async () => {
    if (!approvedQuantity || isNaN(approvedQuantity) || approvedQuantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/store/requests/${selectedRequest._id}/approve`, {
        approvedQuantity: parseInt(approvedQuantity),
        remarks: remarks
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Request approved successfully');
        setApproveDialog(false);
        setApprovedQuantity('');
        setRemarks('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/store/requests/${selectedRequest._id}/reject`, {
        remarks: remarks || 'No reason provided'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Request rejected');
        setRejectDialog(false);
        setRemarks('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const handleFulfill = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/store/requests/${requestId}/fulfill`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Request fulfilled successfully');
        fetchRequests();
      }
    } catch (error) {
      console.error('Fulfill error:', error);
      toast.error(error.response?.data?.message || 'Failed to fulfill request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRequestStats = () => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      fulfilled: requests.filter(r => r.status === 'fulfilled').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const stats = getRequestStats();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Store Requests Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Process and manage all store item requests
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRequests}
          sx={{ borderColor: '#1a237e', color: '#1a237e' }}
        >
          Refresh
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 48, height: 48 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
                <Badge badgeContent={stats.pending} color="error">
                  <Avatar sx={{ bgcolor: '#ff9800', width: 48, height: 48 }}>
                    <ScheduleIcon />
                  </Avatar>
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#2196f3', width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {stats.fulfilled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fulfilled
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50', width: 48, height: 48 }}>
                  <FulfillIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f44336', width: 48, height: 48 }}>
                  <ErrorIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by item name, requester, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Requests</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="fulfilled">Fulfilled</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Request Details</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Requester</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 40, height: 40 }}>
                          <ShoppingCartIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {request.item?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {request.purpose}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {request.requestedBy?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.requestedBy?.role?.toUpperCase()}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          Requested: {request.quantityRequested} {request.item?.unit}
                        </Typography>
                        {request.approvedQuantity && (
                          <Typography variant="caption" color="success.main">
                            Approved: {request.approvedQuantity} {request.item?.unit}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(request.status)}
                        label={request.status?.toUpperCase()}
                        color={getStatusColor(request.status)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(request.createdAt)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              setSelectedRequest(request);
                              setViewDialog(true);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        {request.status === 'pending' && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setApprovedQuantity(request.quantityRequested.toString());
                                  setApproveDialog(true);
                                }}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setRejectDialog(true);
                                }}
                              >
                                <ClearIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        
                        {request.status === 'approved' && (
                          <Tooltip title="Fulfill">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleFulfill(request._id)}
                            >
                              <FulfillIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredRequests.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No requests found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* View Request Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <List>
              <ListItem>
                <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                <ListItemText 
                  primary="Item" 
                  secondary={selectedRequest.item?.name}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText 
                  primary="Requested By" 
                  secondary={`${selectedRequest.requestedBy?.name} (${selectedRequest.requestedBy?.role})`}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Purpose" 
                  secondary={selectedRequest.purpose}
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Quantity Requested" 
                  secondary={`${selectedRequest.quantityRequested} ${selectedRequest.item?.unit}`}
                />
              </ListItem>
              {selectedRequest.approvedQuantity && (
                <ListItem>
                  <ListItemText 
                    primary="Approved Quantity" 
                    secondary={`${selectedRequest.approvedQuantity} ${selectedRequest.item?.unit}`}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemText 
                  primary="Status" 
                  secondary={
                    <Chip 
                      label={selectedRequest.status?.toUpperCase()} 
                      color={getStatusColor(selectedRequest.status)}
                      size="small"
                    />
                  }
                />
              </ListItem>
              {selectedRequest.remarks && (
                <ListItem>
                  <ListItemText 
                    primary="Remarks" 
                    secondary={selectedRequest.remarks}
                  />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve Request Dialog */}
      <Dialog open={approveDialog} onClose={() => setApproveDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Approved Quantity"
              type="number"
              value={approvedQuantity}
              onChange={(e) => setApprovedQuantity(e.target.value)}
              sx={{ mb: 2 }}
              helperText={selectedRequest ? `Requested: ${selectedRequest.quantityRequested} ${selectedRequest.item?.unit}` : ''}
            />
            <TextField
              fullWidth
              label="Remarks (Optional)"
              multiline
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks or conditions..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog(false)}>Cancel</Button>
          <Button onClick={handleApprove} variant="contained" color="success">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Request Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Rejection Reason"
              multiline
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} variant="contained" color="error">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StoreRequests;
