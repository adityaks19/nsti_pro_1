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
  Container,
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
  TextField,
  Tab,
  Tabs,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
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
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Gavel as GavelIcon,
  Timeline as TimelineIcon,
  Done as DoneIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const TOLeaveManagementEnhanced = () => {
  const [applications, setApplications] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [reviewComments, setReviewComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewAction, setReviewAction] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
    fetchAllApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leave/pending-to', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setApplications(response.data.applications || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leave/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAllApplications(response.data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching all applications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leave/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStartReview = async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/leave/${applicationId}/start-to-review`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Review started');
      fetchApplications();
    } catch (error) {
      console.error('Error starting review:', error);
      toast.error(error.response?.data?.message || 'Failed to start review');
    }
  };

  const handleReviewApplication = (application, action) => {
    setSelectedApplication(application);
    setReviewAction(action);
    setReviewComments('');
    setRejectionReason('');
    setReviewDialog(true);
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setViewDialog(true);
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
        `/api/leave/${selectedApplication._id}/to-review`, 
        reviewData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Application ${reviewAction} successfully!`);
        setReviewDialog(false);
        fetchApplications();
        fetchAllApplications();
        fetchStats();
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      case 'teacher_reviewing': return 'info';
      case 'teacher_approved': return 'primary';
      case 'to_reviewing': return 'secondary';
      default: return 'default';
    }
  };

  const renderApplicationTimeline = (application) => {
    const timelineItems = [
      {
        label: 'Application Submitted',
        date: application.submittedDate,
        completed: true,
        icon: <SendIcon />,
        color: 'primary'
      },
      {
        label: 'Teacher Review',
        date: application.teacherReview?.reviewDate,
        completed: application.teacherReview?.status ? true : false,
        icon: <PersonIcon />,
        color: application.teacherReview?.status === 'approved' ? 'success' : 
               application.teacherReview?.status === 'rejected' ? 'error' : 'grey',
        comments: application.teacherReview?.comments
      },
      {
        label: 'TO Final Decision',
        date: application.toReview?.reviewDate,
        completed: application.toReview?.status ? true : false,
        icon: <GavelIcon />,
        color: application.toReview?.status === 'approved' ? 'success' : 
               application.toReview?.status === 'rejected' ? 'error' : 'grey',
        comments: application.toReview?.comments
      }
    ];

    return (
      <Timeline>
        {timelineItems.map((item, index) => (
          <TimelineItem key={index}>
            <TimelineOppositeContent color="text.secondary">
              {item.date ? formatDate(item.date) : 'Pending'}
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={item.color}>
                {item.icon}
              </TimelineDot>
              {index < timelineItems.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6" component="span">
                {item.label}
              </Typography>
              {item.comments && (
                <Typography variant="body2" color="text.secondary">
                  {item.comments}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Leave Management System
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Final approval authority for student leave applications
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
                    Pending Final Approval
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <GavelIcon sx={{ color: 'white' }} />
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
                    {stats.byStatus?.find(s => s._id === 'approved')?.count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Approved
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CheckCircleIcon sx={{ color: 'white' }} />
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
                    {stats.byStatus?.find(s => s._id === 'rejected')?.count || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Rejected
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CancelIcon sx={{ color: 'white' }} />
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
                    {allApplications?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Applications
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AssignmentIcon sx={{ color: 'white' }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab 
              label={
                <Badge badgeContent={applications?.length || 0} color="error">
                  Pending Final Approval
                </Badge>
              } 
            />
            <Tab label="All Applications" />
          </Tabs>
        </Box>

        {/* Pending Applications Tab */}
        <TabPanel value={tabValue} index={0}>
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Teacher Review</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
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
                              {application.student?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {application.student?.studentId}
                            </Typography>
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              {application.student?.course}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {application.leaveType}
                          </Typography>
                          <Chip
                            label={application.priority?.toUpperCase()}
                            size="small"
                            sx={{ 
                              bgcolor: getPriorityColor(application.priority),
                              color: 'white',
                              fontWeight: 'bold',
                              mt: 0.5
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Applied: {formatDate(application.submittedDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                            ✓ Approved by Teacher
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {application.teacherReview?.reviewedBy?.name}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(application.teacherReview?.reviewDate)}
                          </Typography>
                        </Box>
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
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewApplication(application)}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Final Approval">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => handleReviewApplication(application, 'approved')}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Final Rejection">
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
                No Applications Pending Final Approval
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All teacher-approved applications have been processed.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {/* All Applications Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Leave Type</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allApplications && allApplications.map((application) => (
                  <TableRow key={application._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {application.student?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {application.student?.studentId}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">{application.leaveType}</Typography>
                      <Chip
                        label={application.priority?.toUpperCase()}
                        size="small"
                        sx={{ 
                          bgcolor: getPriorityColor(application.priority),
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(application.startDate)} - {formatDate(application.endDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({calculateDays(application.startDate, application.endDate)} days)
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={application.status?.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(application.status)}
                        size="small"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleViewApplication(application)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
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
                Final {reviewAction === 'approved' ? 'Approval' : 'Rejection'} - Training Officer Decision
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Student: {selectedApplication?.student?.name}
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
                        <Typography variant="subtitle2" color="text.secondary">Student</Typography>
                        <Typography variant="body1">{selectedApplication.student?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedApplication.student?.studentId} | {selectedApplication.student?.course}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Leave Type</Typography>
                        <Typography variant="body1">{selectedApplication.leaveType}</Typography>
                        <Chip
                          label={selectedApplication.priority?.toUpperCase()}
                          size="small"
                          sx={{ 
                            bgcolor: getPriorityColor(selectedApplication.priority),
                            color: 'white',
                            mt: 0.5
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                        <Typography variant="body1">
                          {formatDate(selectedApplication.startDate)} - {formatDate(selectedApplication.endDate)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({calculateDays(selectedApplication.startDate, selectedApplication.endDate)} days)
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">Applied Date</Typography>
                        <Typography variant="body1">{formatDate(selectedApplication.submittedDate)}</Typography>
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

              {/* Teacher Review */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2, bgcolor: '#e8f5e8' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
                      Teacher Review - Approved
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Reviewed By</Typography>
                      <Typography variant="body1">{selectedApplication.teacherReview?.reviewedBy?.name}</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Review Date</Typography>
                      <Typography variant="body1">{formatDate(selectedApplication.teacherReview?.reviewDate)}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Teacher Comments</Typography>
                      <Typography variant="body1">{selectedApplication.teacherReview?.comments}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* TO Review Comments */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Final Decision Comments *"
                  multiline
                  rows={4}
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder={`Please provide your final ${reviewAction === 'approved' ? 'approval' : 'rejection'} comments as Training Officer...`}
                />
              </Grid>

              {/* Rejection Reason (only for rejection) */}
              {reviewAction === 'rejected' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Final Rejection Reason *"
                    multiline
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please specify the reason for final rejection..."
                  />
                </Grid>
              )}

              {/* Decision Impact */}
              <Grid item xs={12}>
                <Alert 
                  severity={reviewAction === 'approved' ? 'success' : 'warning'}
                  sx={{ borderRadius: 2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {reviewAction === 'approved' ? 'Final Approval Impact:' : 'Final Rejection Impact:'}
                  </Typography>
                  <Typography variant="body2">
                    {reviewAction === 'approved' 
                      ? 'This decision will grant the student official leave for the requested period. The student will be notified immediately.'
                      : 'This decision will reject the leave application. The student will be notified and expected to attend classes as scheduled.'
                    }
                  </Typography>
                </Alert>
              </Grid>
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
            startIcon={submitting ? <CircularProgress size={16} /> : <GavelIcon />}
            sx={{
              bgcolor: reviewAction === 'approved' ? '#4caf50' : '#f44336',
              '&:hover': { 
                bgcolor: reviewAction === 'approved' ? '#388e3c' : '#d32f2f' 
              },
              borderRadius: 2,
              px: 3
            }}
          >
            {submitting ? 'Processing...' : `Final ${reviewAction === 'approved' ? 'Approval' : 'Rejection'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Application Dialog */}
      <Dialog 
        open={viewDialog} 
        onClose={() => setViewDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
                <TimelineIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Leave Application Details
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Application ID: {selectedApplication?._id?.slice(-8)}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={selectedApplication?.status?.replace('_', ' ').toUpperCase()}
              color={getStatusColor(selectedApplication?.status)}
            />
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={3}>
              {/* Application Details */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e' }}>
                      Application Details
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Student</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedApplication.student?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedApplication.student?.studentId} | {selectedApplication.student?.course}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Leave Type</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {selectedApplication.leaveType}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Duration</Typography>
                      <Typography variant="body1">
                        {formatDate(selectedApplication.startDate)} - {formatDate(selectedApplication.endDate)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ({calculateDays(selectedApplication.startDate, selectedApplication.endDate)} days)
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                      <Chip 
                        label={selectedApplication.priority?.toUpperCase()} 
                        size="small" 
                        sx={{ 
                          bgcolor: getPriorityColor(selectedApplication.priority),
                          color: 'white'
                        }} 
                      />
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                      <Typography variant="body1">
                        {selectedApplication.reason}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Timeline */}
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e' }}>
                      Application Timeline
                    </Typography>
                    {renderApplicationTimeline(selectedApplication)}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setViewDialog(false)}
            variant="contained"
            sx={{
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d47a1' },
              borderRadius: 2
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TOLeaveManagementEnhanced;
