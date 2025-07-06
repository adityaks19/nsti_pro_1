import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircleOutline as CheckIcon,
  CancelOutlined as CancelOutlinedIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const TOLeaveApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: '',
    comments: '',
    rejectionReason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leave/pending-to', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleReviewApplication = (application, status) => {
    setSelectedApplication(application);
    setReviewData({
      status,
      comments: '',
      rejectionReason: ''
    });
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!reviewData.status) {
      toast.error('Please select a status');
      return;
    }

    if (reviewData.status === 'rejected' && !reviewData.rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `/api/leave/${selectedApplication._id}/to-review`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(`Application ${reviewData.status} successfully!`);
        setReviewDialogOpen(false);
        setReviewData({ status: '', comments: '', rejectionReason: '' });
        fetchPendingApplications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'teacher_approved':
        return 'info';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'teacher_approved':
        return <CheckIcon />;
      case 'approved':
        return <CheckCircleIcon />;
      case 'rejected':
        return <CancelOutlinedIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Leave Applications - Final Approval
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve leave applications that have been approved by teachers
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            height: '120px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {applications.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Pending Final Approval
                  </Typography>
                </Box>
                <AssignmentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
            color: 'white',
            height: '120px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {applications.filter(app => app.teacherReview?.status === 'approved').length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Teacher Approved
                  </Typography>
                </Box>
                <CheckIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
            color: 'white',
            height: '120px'
          }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {applications.reduce((total, app) => total + calculateDays(app.startDate, app.endDate), 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Leave Days
                  </Typography>
                </Box>
                <CalendarIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Applications Table */}
      <Card sx={{ boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
            Applications Pending Final Approval
          </Typography>
          
          {applications.length === 0 ? (
            <Box textAlign="center" py={6}>
              <AssignmentIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No applications pending final approval
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All applications have been processed or none are available for review
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Teacher Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ mr: 2, bgcolor: '#1976d2' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {application.student?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {application.student?.studentId} • {application.student?.department}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={application.leaveType} 
                          size="small"
                          sx={{ 
                            backgroundColor: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(application.startDate)} - {formatDate(application.endDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${calculateDays(application.startDate, application.endDate)} days`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon('teacher_approved')}
                          label="Teacher Approved"
                          color="success"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(application.submittedDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewApplication(application)}
                              sx={{ color: '#1976d2' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              onClick={() => handleReviewApplication(application, 'approved')}
                              sx={{ color: '#4caf50' }}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              onClick={() => handleReviewApplication(application, 'rejected')}
                              sx={{ color: '#f44336' }}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* View Application Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1976d2', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ViewIcon />
          Leave Application Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedApplication && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    Student Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Name" 
                        secondary={selectedApplication.student?.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Student ID" 
                        secondary={selectedApplication.student?.studentId}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SchoolIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Department" 
                        secondary={selectedApplication.student?.department}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    Leave Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><AssignmentIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Leave Type" 
                        secondary={selectedApplication.leaveType}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CalendarIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Duration" 
                        secondary={`${formatDate(selectedApplication.startDate)} - ${formatDate(selectedApplication.endDate)}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ScheduleIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="Total Days" 
                        secondary={`${calculateDays(selectedApplication.startDate, selectedApplication.endDate)} days`}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                    Reason for Leave
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    p: 2, 
                    backgroundColor: 'white', 
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}>
                    {selectedApplication.reason}
                  </Typography>
                </Card>
              </Grid>

              {selectedApplication.teacherReview && (
                <Grid item xs={12}>
                  <Card sx={{ p: 2, backgroundColor: '#e8f5e8' }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#2e7d32' }}>
                      Teacher Review
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        icon={<CheckIcon />}
                        label="Approved by Teacher"
                        color="success"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Reviewed by:</strong> {selectedApplication.teacherReview.reviewedBy?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Review Date:</strong> {formatDate(selectedApplication.teacherReview.reviewDate)}
                    </Typography>
                    {selectedApplication.teacherReview.comments && (
                      <Typography variant="body2">
                        <strong>Comments:</strong> {selectedApplication.teacherReview.comments}
                      </Typography>
                    )}
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setViewDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Application Dialog */}
      <Dialog 
        open={reviewDialogOpen} 
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: reviewData.status === 'approved' ? '#4caf50' : '#f44336', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          {reviewData.status === 'approved' ? <ApproveIcon /> : <RejectIcon />}
          {reviewData.status === 'approved' ? 'Approve' : 'Reject'} Leave Application
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert 
            severity={reviewData.status === 'approved' ? 'success' : 'warning'}
            sx={{ mb: 3 }}
          >
            You are about to <strong>{reviewData.status}</strong> this leave application.
            {reviewData.status === 'approved' && ' The student will be notified of the approval.'}
            {reviewData.status === 'rejected' && ' Please provide a clear reason for rejection.'}
          </Alert>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Comments (Optional)"
            value={reviewData.comments}
            onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
            sx={{ mb: 2 }}
            placeholder="Add any additional comments..."
          />

          {reviewData.status === 'rejected' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason *"
              value={reviewData.rejectionReason}
              onChange={(e) => setReviewData({ ...reviewData, rejectionReason: e.target.value })}
              required
              error={!reviewData.rejectionReason.trim()}
              helperText={!reviewData.rejectionReason.trim() ? 'Rejection reason is required' : ''}
              placeholder="Please provide a clear reason for rejection..."
            />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setReviewDialogOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitReview}
            variant="contained"
            color={reviewData.status === 'approved' ? 'success' : 'error'}
            disabled={submitting || (reviewData.status === 'rejected' && !reviewData.rejectionReason.trim())}
            startIcon={submitting ? <CircularProgress size={20} /> : (reviewData.status === 'approved' ? <ApproveIcon /> : <RejectIcon />)}
          >
            {submitting ? 'Processing...' : (reviewData.status === 'approved' ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TOLeaveApplications;
