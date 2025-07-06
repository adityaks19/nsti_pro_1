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
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  Tab,
  Tabs,
  Badge,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Container
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  Send as SendIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const TeacherLeaveApplicationsFixed = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewAction, setReviewAction] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leave/pending-teacher', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setApplications(response.data.applications || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch applications');
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch leave applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = (application, action) => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewComments('');
    setRejectionReason('');
    setReviewDialog(true);
  };

  const submitReview = async () => {
    if (!reviewComments.trim()) {
      toast.error('Please provide review comments');
      return;
    }

    if (reviewAction === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide rejection reason');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const reviewData = {
        status: reviewAction,
        comments: reviewComments,
        rejectionReason: reviewAction === 'rejected' ? rejectionReason : null
      };

      const response = await axios.put(
        `/api/leave/${selectedApplication._id}/teacher-review`, 
        reviewData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Application ${reviewAction} successfully!`);
        setReviewDialog(false);
        fetchApplications(); // Refresh the list
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
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

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '#9c27b0';
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getLeaveTypeIcon = (leaveType) => {
    switch (leaveType?.toLowerCase()) {
      case 'medical leave': return <WarningIcon />;
      case 'personal leave': return <PersonIcon />;
      case 'family emergency': return <WarningIcon />;
      case 'academic leave': return <SchoolIcon />;
      default: return <AssignmentIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Student Leave Applications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve student leave applications
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {applications?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Pending Review
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AssignmentIcon sx={{ color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {applications?.filter(app => app.priority === 'urgent').length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Urgent
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <WarningIcon sx={{ color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {applications?.filter(app => app.leaveType === 'Medical Leave').length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Medical Leave
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <WarningIcon sx={{ color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {applications?.reduce((total, app) => total + calculateDays(app.startDate, app.endDate), 0) || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Days
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CalendarIcon sx={{ color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Applications Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Leave Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications && applications.map((application) => (
                    <TableRow key={application._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 50, height: 50 }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {application.student?.name || 'Unknown Student'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {application.student?.studentId || 'N/A'}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {application.student?.course || 'Course not specified'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Avatar sx={{ bgcolor: '#f5f5f5', mr: 1, width: 30, height: 30 }}>
                            {getLeaveTypeIcon(application.leaveType)}
                          </Avatar>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {application.leaveType}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Applied: {formatDate(application.submittedDate)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatDate(application.startDate)}
                        </Typography>
                        <Typography variant="body2">
                          to {formatDate(application.endDate)}
                        </Typography>
                        <Chip 
                          label={`${calculateDays(application.startDate, application.endDate)} days`}
                          size="small"
                          sx={{ mt: 0.5, bgcolor: '#e3f2fd', color: '#1976d2' }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={application.priority?.toUpperCase() || 'MEDIUM'}
                          size="small"
                          sx={{ 
                            bgcolor: getPriorityColor(application.priority),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Approve">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleReviewApplication(application, 'approved')}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Reject">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => handleReviewApplication(application, 'rejected')}
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

          {!loading && (!applications || applications.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar sx={{ bgcolor: '#f5f5f5', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              </Avatar>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Pending Applications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All student leave applications have been reviewed.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog 
        open={reviewDialog} 
        onClose={() => setReviewDialog(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ 
              bgcolor: reviewAction === 'approved' ? '#4caf50' : '#f44336', 
              mr: 2 
            }}>
              {reviewAction === 'approved' ? <ApproveIcon /> : <RejectIcon />}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {reviewAction === 'approved' ? 'Approve' : 'Reject'} Leave Application
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Student: {selectedApplication?.student?.name || 'Unknown Student'}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={3}>
              {/* Application Summary */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, bgcolor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Application Summary
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Leave Type</Typography>
                        <Typography variant="body1">{selectedApplication.leaveType}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">
                          {calculateDays(selectedApplication.startDate, selectedApplication.endDate)} days
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                        <Typography variant="body1">{formatDate(selectedApplication.startDate)}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                        <Typography variant="body1">{formatDate(selectedApplication.endDate)}</Typography>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                      <Typography variant="body1">{selectedApplication.reason}</Typography>
                    </Box>

                    {selectedApplication.urgencyReason && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Urgency Reason</Typography>
                        <Typography variant="body1">{selectedApplication.urgencyReason}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Review Comments */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Review Comments *"
                  multiline
                  rows={4}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder={`Please provide your ${reviewAction === 'approved' ? 'approval' : 'rejection'} comments...`}
                />
              </Grid>

              {/* Rejection Reason (only for rejection) */}
              {reviewAction === 'rejected' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Rejection Reason *"
                    multiline
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please specify the reason for rejection..."
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setReviewDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitReview}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
            sx={{
              bgcolor: reviewAction === 'approved' ? '#4caf50' : '#f44336',
              '&:hover': { 
                bgcolor: reviewAction === 'approved' ? '#388e3c' : '#d32f2f' 
              },
              borderRadius: 2,
              px: 3
            }}
          >
            {submitting ? 'Submitting...' : `${reviewAction === 'approved' ? 'Approve' : 'Reject'} Application`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherLeaveApplicationsFixed;
