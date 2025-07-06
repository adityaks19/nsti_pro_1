import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const TOLeaveManagement = () => {
  const [leaveApplications, setLeaveApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchLeaveApplications();
  }, []);

  const fetchLeaveApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/leave/all', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLeaveApplications(response.data.applications);
      }
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      toast.error('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setOpenDialog(true);
  };

  const handleAction = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
    setRemarks('');
    setActionDialog(true);
  };

  const submitAction = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = actionType === 'approve' ? 'approve' : 'reject';
      
      const response = await axios.put(
        `/api/leave/${selectedApplication._id}/${endpoint}`,
        { remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success(`Leave application ${actionType}d successfully`);
        fetchLeaveApplications();
        setActionDialog(false);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing application:`, error);
      toast.error(error.response?.data?.message || `Failed to ${actionType} application`);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getLeaveTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'sick': return '#f44336';
      case 'casual': return '#2196f3';
      case 'emergency': return '#ff9800';
      case 'medical': return '#9c27b0';
      default: return '#757575';
    }
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const filteredApplications = leaveApplications.filter(app => {
    const matchesSearch = 
      app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = 
      tabValue === 0 || // All
      (tabValue === 1 && app.status === 'pending') || // Pending
      (tabValue === 2 && app.status === 'approved') || // Approved
      (tabValue === 3 && app.status === 'rejected'); // Rejected

    return matchesSearch && matchesTab;
  });

  const stats = {
    total: leaveApplications.length,
    pending: leaveApplications.filter(app => app.status === 'pending').length,
    approved: leaveApplications.filter(app => app.status === 'approved').length,
    rejected: leaveApplications.filter(app => app.status === 'rejected').length
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading leave applications...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#7b1fa2', fontWeight: 'bold', mb: 1 }}>
          Leave Applications Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve student leave applications
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <AssignmentIcon sx={{ color: 'white', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Total Applications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ScheduleIcon sx={{ color: 'white', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats.pending}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Pending Review
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ApproveIcon sx={{ color: 'white', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats.approved}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Approved
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <RejectIcon sx={{ color: 'white', fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {stats.rejected}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Rejected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Approved (${stats.approved})`} />
          <Tab label={`Rejected (${stats.rejected})`} />
        </Tabs>
      </Box>

      {/* Applications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Student</strong></TableCell>
              <TableCell><strong>Leave Type</strong></TableCell>
              <TableCell><strong>Duration</strong></TableCell>
              <TableCell><strong>Days</strong></TableCell>
              <TableCell><strong>Applied Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredApplications.map((application) => (
              <TableRow key={application._id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {application.student?.name || 'Unknown Student'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {application.student?.studentId || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={application.leaveType}
                    size="small"
                    sx={{
                      backgroundColor: getLeaveTypeColor(application.leaveType),
                      color: 'white'
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {new Date(application.startDate).toLocaleDateString()} -
                    </Typography>
                    <Typography variant="body2">
                      {new Date(application.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {calculateDuration(application.startDate, application.endDate)} days
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(application.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={application.status}
                    color={getStatusColor(application.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={() => handleViewApplication(application)}
                      color="primary"
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  {application.status === 'pending' && (
                    <>
                      <Tooltip title="Approve">
                        <IconButton
                          onClick={() => handleAction(application, 'approve')}
                          color="success"
                          size="small"
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          onClick={() => handleAction(application, 'reject')}
                          color="error"
                          size="small"
                        >
                          <RejectIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredApplications.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No leave applications found
          </Typography>
        </Box>
      )}

      {/* View Application Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Leave Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Student Name</Typography>
                <Typography variant="body1">{selectedApplication.student?.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Student ID</Typography>
                <Typography variant="body1">{selectedApplication.student?.studentId}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Leave Type</Typography>
                <Chip
                  label={selectedApplication.leaveType}
                  size="small"
                  sx={{
                    backgroundColor: getLeaveTypeColor(selectedApplication.leaveType),
                    color: 'white'
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedApplication.status}
                  color={getStatusColor(selectedApplication.status)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                <Typography variant="body1">
                  {new Date(selectedApplication.startDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                <Typography variant="body1">
                  {new Date(selectedApplication.endDate).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                <Typography variant="body1">{selectedApplication.reason}</Typography>
              </Grid>
              {selectedApplication.remarks && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Remarks</Typography>
                  <Typography variant="body1">{selectedApplication.remarks}</Typography>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Applied On</Typography>
                <Typography variant="body1">
                  {new Date(selectedApplication.createdAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Application
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {actionType} this leave application?
          </Typography>
          <TextField
            fullWidth
            label="Remarks (Optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={`Add remarks for ${actionType}ing this application...`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(false)}>Cancel</Button>
          <Button
            onClick={submitAction}
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TOLeaveManagement;
