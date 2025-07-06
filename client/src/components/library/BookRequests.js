import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Pagination,
  Avatar
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  LocalLibrary as IssueIcon,
  Assignment as ReturnIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  MenuBook as BookIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircleOutline as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import libraryService from '../../services/libraryService';

const BookRequests = () => {
  const { user } = useAuth();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and pagination states
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [requestsPerPage] = useState(10);
  
  // Dialog states
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Check if user is librarian/admin
  const isLibrarian = user?.role === 'librarian' || user?.role === 'admin';

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: requestsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await libraryService.getRequests(params);
      
      if (response.success) {
        setRequests(response.data.requests);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRequests(response.data.pagination.totalRequests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.message || 'Failed to fetch requests');
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter]);

  // Handle approve request
  const handleApproveRequest = async (requestId) => {
    try {
      const response = await libraryService.approveRequest(requestId);
      if (response.success) {
        toast.success('Request approved successfully!');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    }
  };

  // Handle reject request
  const handleRejectRequest = async () => {
    try {
      if (!rejectionReason.trim()) {
        toast.error('Please provide a rejection reason');
        return;
      }

      const response = await libraryService.rejectRequest(selectedRequest._id, rejectionReason);
      if (response.success) {
        toast.success('Request rejected successfully!');
        setRejectDialogOpen(false);
        setRejectionReason('');
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error(error.message || 'Failed to reject request');
    }
  };

  // Handle issue book
  const handleIssueBook = async (requestId) => {
    try {
      const response = await libraryService.issueBook(requestId);
      if (response.success) {
        toast.success('Book issued successfully!');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error(error.message || 'Failed to issue book');
    }
  };

  // Handle return book
  const handleReturnBook = async (requestId) => {
    try {
      const response = await libraryService.returnBook(requestId);
      if (response.success) {
        const message = response.fine > 0 
          ? `Book returned successfully! Fine: ₹${response.fine}`
          : 'Book returned successfully!';
        toast.success(message);
        fetchRequests();
      }
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error.message || 'Failed to return book');
    }
  };

  // Get status chip
  const getStatusChip = (status) => {
    const statusConfig = {
      pending: { color: 'warning', icon: <ScheduleIcon />, label: 'Pending' },
      approved: { color: 'info', icon: <CheckIcon />, label: 'Approved' },
      rejected: { color: 'error', icon: <ErrorIcon />, label: 'Rejected' },
      issued: { color: 'success', icon: <BookIcon />, label: 'Issued' },
      returned: { color: 'default', icon: <CheckIcon />, label: 'Returned' },
      overdue: { color: 'error', icon: <WarningIcon />, label: 'Overdue' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  // Get priority chip
  const getPriorityChip = (priority) => {
    const priorityConfig = {
      low: { color: 'default', label: 'Low' },
      normal: { color: 'primary', label: 'Normal' },
      high: { color: 'warning', label: 'High' },
      urgent: { color: 'error', label: 'Urgent' }
    };

    const config = priorityConfig[priority] || priorityConfig.normal;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate days remaining/overdue
  const getDaysInfo = (request) => {
    if (!request.dueDate) return null;
    
    const today = new Date();
    const dueDate = new Date(request.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (request.status === 'overdue') {
      return { type: 'overdue', days: Math.abs(diffDays), color: 'error' };
    } else if (request.status === 'issued') {
      if (diffDays < 0) {
        return { type: 'overdue', days: Math.abs(diffDays), color: 'error' };
      } else if (diffDays <= 3) {
        return { type: 'due_soon', days: diffDays, color: 'warning' };
      } else {
        return { type: 'normal', days: diffDays, color: 'success' };
      }
    }
    return null;
  };

  // Open reject dialog
  const openRejectDialog = (request) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  // Open details dialog
  const openDetailsDialog = (request) => {
    setSelectedRequest(request);
    setDetailsDialogOpen(true);
  };

  if (loading && requests.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            📋 Book Requests
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isLibrarian ? 'Manage book requests from users' : 'Your book requests'}
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchRequests}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status Filter"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="issued">Issued</MenuItem>
                  <MenuItem value="returned">Returned</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Total Requests: {totalRequests}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Requests Table */}
      {requests.length === 0 && !loading ? (
        <Box textAlign="center" py={8}>
          <BookIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No requests found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLibrarian ? 'No book requests to display' : 'You haven\'t made any book requests yet'}
          </Typography>
        </Box>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Book</TableCell>
                  {isLibrarian && <TableCell>Requested By</TableCell>}
                  <TableCell>Request Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => {
                  const daysInfo = getDaysInfo(request);
                  
                  return (
                    <TableRow key={request._id} hover>
                      {/* Book Info */}
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <BookIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              {request.book?.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              by {request.book?.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {request.book?.category}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Requested By (for librarians) */}
                      {isLibrarian && (
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {request.requestedBy?.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {request.requestedBy?.role}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                      )}

                      {/* Request Date */}
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(request.requestDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {request.requestType}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {getStatusChip(request.status)}
                        {request.status === 'rejected' && request.rejectionReason && (
                          <Tooltip title={request.rejectionReason}>
                            <ErrorIcon sx={{ ml: 1, fontSize: 16, color: 'error.main' }} />
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* Priority */}
                      <TableCell>
                        {getPriorityChip(request.priority)}
                      </TableCell>

                      {/* Due Date */}
                      <TableCell>
                        {request.dueDate ? (
                          <Box>
                            <Typography variant="body2">
                              {formatDate(request.dueDate)}
                            </Typography>
                            {daysInfo && (
                              <Typography 
                                variant="caption" 
                                color={`${daysInfo.color}.main`}
                                sx={{ fontWeight: 'bold' }}
                              >
                                {daysInfo.type === 'overdue' 
                                  ? `${daysInfo.days} days overdue`
                                  : daysInfo.type === 'due_soon'
                                  ? `Due in ${daysInfo.days} days`
                                  : `${daysInfo.days} days left`
                                }
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => openDetailsDialog(request)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>

                          {isLibrarian && (
                            <>
                              {request.status === 'pending' && (
                                <>
                                  <Tooltip title="Approve">
                                    <IconButton
                                      size="small"
                                      color="success"
                                      onClick={() => handleApproveRequest(request._id)}
                                    >
                                      <ApproveIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => openRejectDialog(request)}
                                    >
                                      <RejectIcon />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}

                              {request.status === 'approved' && (
                                <Tooltip title="Issue Book">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleIssueBook(request._id)}
                                  >
                                    <IssueIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {(request.status === 'issued' || request.status === 'overdue') && (
                                <Tooltip title="Return Book">
                                  <IconButton
                                    size="small"
                                    color="secondary"
                                    onClick={() => handleReturnBook(request._id)}
                                  >
                                    <ReturnIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" p={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => setCurrentPage(page)}
                color="primary"
              />
            </Box>
          )}
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reject Request
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Please provide a reason for rejecting this request:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleRejectRequest}
            disabled={!rejectionReason.trim()}
          >
            Reject Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRequest && (
          <>
            <DialogTitle>
              Request Details
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Book Information
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Title:</strong> {selectedRequest.book?.title}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Author:</strong> {selectedRequest.book?.author}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>ISBN:</strong> {selectedRequest.book?.isbn}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Category:</strong> {selectedRequest.book?.category}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Request Information
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Requested By:</strong> {selectedRequest.requestedBy?.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Role:</strong> {selectedRequest.requestedBy?.role}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Request Date:</strong> {formatDate(selectedRequest.requestDate)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Request Type:</strong> {selectedRequest.requestType}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Priority:</strong> {selectedRequest.priority}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Status:</strong> {selectedRequest.status}
                  </Typography>
                </Grid>

                {selectedRequest.approvalDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Approval Date:</strong> {formatDate(selectedRequest.approvalDate)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Approved By:</strong> {selectedRequest.approvedBy?.name}
                    </Typography>
                  </Grid>
                )}

                {selectedRequest.issueDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Issue Date:</strong> {formatDate(selectedRequest.issueDate)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Due Date:</strong> {formatDate(selectedRequest.dueDate)}
                    </Typography>
                  </Grid>
                )}

                {selectedRequest.actualReturnDate && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Return Date:</strong> {formatDate(selectedRequest.actualReturnDate)}
                    </Typography>
                    {selectedRequest.fine > 0 && (
                      <Typography variant="body2" gutterBottom>
                        <strong>Fine:</strong> ₹{selectedRequest.fine}
                      </Typography>
                    )}
                  </Grid>
                )}

                {selectedRequest.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Remarks:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.remarks}
                    </Typography>
                  </Grid>
                )}

                {selectedRequest.rejectionReason && (
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Rejection Reason:</strong>
                    </Typography>
                    <Typography variant="body2" color="error">
                      {selectedRequest.rejectionReason}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default BookRequests;
