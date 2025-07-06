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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  AttachFile as AttachFileIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  HourglassEmpty as HourglassIcon,
  Done as DoneIcon,
  Close as CloseIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentLeaveApplicationEnhanced = () => {
  const [applications, setApplications] = useState([]);
  const [newApplicationDialog, setNewApplicationDialog] = useState(false);
  const [viewApplicationDialog, setViewApplicationDialog] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    priority: 'medium',
    urgencyReason: ''
  });

  const [errors, setErrors] = useState({});

  const leaveTypes = [
    'Medical Leave',
    'Personal Leave', 
    'Family Emergency',
    'Academic Leave',
    'Other'
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: '#4caf50' },
    { value: 'medium', label: 'Medium', color: '#ff9800' },
    { value: 'high', label: 'High', color: '#f44336' },
    { value: 'urgent', label: 'Urgent', color: '#9c27b0' }
  ];

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leave/my-applications', {
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.leaveType) newErrors.leaveType = 'Leave type is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
      if (new Date(formData.startDate) < new Date()) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (formData.priority === 'urgent' && !formData.urgencyReason.trim()) {
      newErrors.urgencyReason = 'Urgency reason is required for urgent applications';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitApplication = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/leave/apply', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Leave application submitted successfully!');
        setNewApplicationDialog(false);
        resetForm();
        fetchApplications();
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      priority: 'medium',
      urgencyReason: ''
    });
    setErrors({});
  };

  const handleCloseDialog = () => {
    setNewApplicationDialog(false);
    resetForm();
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setViewApplicationDialog(true);
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

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircleIcon />;
      case 'rejected': return <CancelIcon />;
      case 'pending': return <HourglassIcon />;
      case 'teacher_reviewing': return <ScheduleIcon />;
      case 'teacher_approved': return <DoneIcon />;
      case 'to_reviewing': return <ScheduleIcon />;
      default: return <AssignmentIcon />;
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

  const getApplicationProgress = (application) => {
    const stages = ['student_submitted', 'teacher_review', 'to_review', 'completed'];
    const currentStageIndex = stages.indexOf(application.currentStage);
    return ((currentStageIndex + 1) / stages.length) * 100;
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
        date: application.teacherReview?.reviewStarted,
        completed: application.teacherReview?.status ? true : false,
        icon: <PersonIcon />,
        color: application.teacherReview?.status === 'approved' ? 'success' : 
               application.teacherReview?.status === 'rejected' ? 'error' : 'grey'
      },
      {
        label: 'TO Final Approval',
        date: application.toReview?.reviewStarted,
        completed: application.toReview?.status ? true : false,
        icon: <SchoolIcon />,
        color: application.toReview?.status === 'approved' ? 'success' : 
               application.toReview?.status === 'rejected' ? 'error' : 'grey'
      },
      {
        label: 'Completed',
        date: application.completedDate,
        completed: application.status === 'approved' || application.status === 'rejected',
        icon: application.status === 'approved' ? <CheckCircleIcon /> : 
              application.status === 'rejected' ? <CancelIcon /> : <HourglassIcon />,
        color: application.status === 'approved' ? 'success' : 
               application.status === 'rejected' ? 'error' : 'grey'
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
              {item.label === 'Teacher Review' && application.teacherReview?.comments && (
                <Typography variant="body2" color="text.secondary">
                  {application.teacherReview.comments}
                </Typography>
              )}
              {item.label === 'TO Final Approval' && application.toReview?.comments && (
                <Typography variant="body2" color="text.secondary">
                  {application.toReview.comments}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Leave Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your leave requests and track their status through the approval workflow
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewApplicationDialog(true)}
          sx={{
            bgcolor: '#1a237e',
            '&:hover': { bgcolor: '#0d47a1' },
            borderRadius: 2,
            px: 3,
            py: 1.5
          }}
        >
          Apply for Leave
        </Button>
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

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {applications?.filter(app => ['pending', 'teacher_reviewing', 'to_reviewing'].includes(app.status)).length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    In Progress
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <ScheduleIcon sx={{ color: 'white' }} />
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
                    {applications?.filter(app => app.status === 'approved').length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Approved
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
                    {applications?.filter(app => app.status === 'rejected').length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Rejected
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CancelIcon sx={{ color: 'white' }} />
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Application Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications && applications.map((application) => (
                    <TableRow key={application._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 50, height: 50 }}>
                            {getStatusIcon(application.status)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {application.leaveType}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Applied: {formatDate(application.submittedDate)}
                            </Typography>
                            <br />
                            <Chip 
                              label={application.priority?.toUpperCase()} 
                              size="small" 
                              sx={{ 
                                bgcolor: priorityLevels.find(p => p.value === application.priority)?.color || '#757575',
                                color: 'white',
                                fontSize: '0.7rem'
                              }} 
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatDate(application.startDate)} - {formatDate(application.endDate)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {calculateDays(application.startDate, application.endDate)} days
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={application.status?.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(application.status)}
                          size="small"
                          icon={getStatusIcon(application.status)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ width: '100%' }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={getApplicationProgress(application)} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: '#f5f5f5',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: application.status === 'approved' ? '#4caf50' : 
                                        application.status === 'rejected' ? '#f44336' : '#1a237e'
                              }
                            }} 
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                            {Math.round(getApplicationProgress(application))}% Complete
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title="View Details & Timeline">
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
          )}

          {!loading && (!applications || applications.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Avatar sx={{ bgcolor: '#f5f5f5', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              </Avatar>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Leave Applications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You haven't submitted any leave applications yet. Start by applying for your first leave.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setNewApplicationDialog(true)}
                sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
              >
                Apply for Leave
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* New Application Dialog */}
      <Dialog 
        open={newApplicationDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
              <AddIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Apply for Leave
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Leave Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.leaveType}>
                <InputLabel>Leave Type *</InputLabel>
                <Select
                  value={formData.leaveType}
                  onChange={(e) => handleInputChange('leaveType', e.target.value)}
                  label="Leave Type *"
                >
                  {leaveTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.leaveType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.leaveType}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  label="Priority"
                >
                  {priorityLevels.map((priority) => (
                    <MenuItem key={priority.value} value={priority.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{ 
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: priority.color, 
                            mr: 1 
                          }} 
                        />
                        {priority.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Start Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.startDate}
                helperText={errors.startDate}
              />
            </Grid>

            {/* End Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date *"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.endDate}
                helperText={errors.endDate}
              />
            </Grid>

            {/* Days Calculation */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {formData.startDate && formData.endDate && new Date(formData.startDate) <= new Date(formData.endDate)
                  ? `Total Leave Duration: ${calculateDays(formData.startDate, formData.endDate)} days`
                  : 'Select start and end dates to calculate leave duration'
                }
              </Alert>
            </Grid>

            {/* Urgency Reason (only for urgent priority) */}
            {formData.priority === 'urgent' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Urgency Reason *"
                  multiline
                  rows={2}
                  value={formData.urgencyReason}
                  onChange={(e) => handleInputChange('urgencyReason', e.target.value)}
                  placeholder="Please explain why this leave application is urgent..."
                  error={!!errors.urgencyReason}
                  helperText={errors.urgencyReason}
                />
              </Grid>
            )}

            {/* Reason */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Leave *"
                multiline
                rows={4}
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Please provide detailed reason for your leave application..."
                error={!!errors.reason}
                helperText={errors.reason}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitApplication}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
            sx={{
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d47a1' },
              borderRadius: 2,
              px: 3
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Application Dialog */}
      <Dialog 
        open={viewApplicationDialog} 
        onClose={() => setViewApplicationDialog(false)} 
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
              icon={getStatusIcon(selectedApplication?.status)}
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
                          bgcolor: priorityLevels.find(p => p.value === selectedApplication.priority)?.color || '#757575',
                          color: 'white'
                        }} 
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Submitted Date</Typography>
                      <Typography variant="body1">
                        {formatDate(selectedApplication.submittedDate)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                      <Typography variant="body1">
                        {selectedApplication.reason}
                      </Typography>
                    </Box>

                    {selectedApplication.urgencyReason && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Urgency Reason</Typography>
                        <Typography variant="body1">
                          {selectedApplication.urgencyReason}
                        </Typography>
                      </Box>
                    )}
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

              {/* Progress Indicator */}
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 2 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e' }}>
                      Application Progress
                    </Typography>
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getApplicationProgress(selectedApplication)} 
                        sx={{ 
                          height: 12, 
                          borderRadius: 6,
                          bgcolor: '#f5f5f5',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: selectedApplication.status === 'approved' ? '#4caf50' : 
                                    selectedApplication.status === 'rejected' ? '#f44336' : '#1a237e'
                          }
                        }} 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {Math.round(getApplicationProgress(selectedApplication))}% Complete - 
                      Current Stage: {selectedApplication.currentStage?.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setViewApplicationDialog(false)}
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

export default StudentLeaveApplicationEnhanced;
