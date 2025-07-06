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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Tooltip
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
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentLeaveApplication = () => {
  const [applications, setApplications] = useState([]);
  const [newApplicationDialog, setNewApplicationDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    alternatePhone: ''
  });

  const [errors, setErrors] = useState({});

  const leaveTypes = [
    'Medical Leave',
    'Personal Leave',
    'Family Emergency',
    'Academic Leave',
    'Other'
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
      emergencyContact: '',
      alternatePhone: ''
    });
    setErrors({});
  };

  const handleCloseDialog = () => {
    setNewApplicationDialog(false);
    resetForm();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
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

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Leave Applications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your leave requests and track their status
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
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    {applications?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Applications
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 56, height: 56 }}>
                  <AssignmentIcon />
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
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {applications?.filter(app => app.status === 'pending').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <ScheduleIcon />
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
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {applications?.filter(app => app.status === 'approved').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <CheckCircleIcon />
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
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {applications?.filter(app => app.status === 'rejected').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <CancelIcon />
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Leave Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Applied Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications && applications.map((application) => (
                    <TableRow key={application._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 40, height: 40 }}>
                            <CalendarIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {application.leaveType}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {application.reason?.substring(0, 30)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(application.startDate)} - {formatDate(application.endDate)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {calculateDays(application.startDate, application.endDate)} days
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(application.createdAt)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={application.status?.toUpperCase()}
                          color={getStatusColor(application.status)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
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
                You haven't submitted any leave applications yet.
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
          sx={{ height: '56px' }} // Match TextField height
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

    {/* Emergency Contact */}
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Emergency Contact"
        value={formData.emergencyContact}
        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
        placeholder="Contact person name"
        sx={{ height: '56px' }} // Explicit height
      />
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
        sx={{ height: '56px' }} // Explicit height
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
        sx={{ height: '56px' }} // Explicit height
      />
    </Grid>

    {/* Alternate Phone */}
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        label="Alternate Phone"
        value={formData.alternatePhone}
        onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
        placeholder="Alternate contact number"
        sx={{ height: '56px' }} // Explicit height
      />
    </Grid>

    {/* Days Calculation */}
    <Grid item xs={12} md={6}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        height: '56px', // Match other fields
        border: '1px solid rgba(0, 0, 0, 0.23)',
        borderRadius: '4px',
        px: 2,
        backgroundColor: '#f5f5f5'
      }}>
        <Typography variant="body1" color="text.secondary">
          {formData.startDate && formData.endDate && new Date(formData.startDate) <= new Date(formData.endDate)
            ? `Total Days: ${calculateDays(formData.startDate, formData.endDate)}`
            : 'Select dates to calculate duration'
          }
        </Typography>
      </Box>
    </Grid>

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
            startIcon={submitting ? <CircularProgress size={16} /> : <AssignmentIcon />}
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
    </Container>
  );
};

export default StudentLeaveApplication;
