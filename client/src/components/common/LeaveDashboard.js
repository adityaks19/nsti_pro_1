import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Container,
  Paper,
  CircularProgress,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const LeaveDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await axios.get('/api/leave/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      // Fetch recent applications based on user role
      let applicationsEndpoint = '/api/leave/my-applications';
      if (user.role === 'teacher') {
        applicationsEndpoint = '/api/leave/pending-teacher';
      } else if (user.role === 'to' || user.role === 'admin') {
        applicationsEndpoint = '/api/leave/all';
      }

      const applicationsResponse = await axios.get(applicationsEndpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (applicationsResponse.data.success) {
        const applications = applicationsResponse.data.applications || [];
        setRecentApplications(applications.slice(0, 5)); // Show only recent 5
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      case 'pending': return <ScheduleIcon />;
      case 'teacher_reviewing': return <PersonIcon />;
      case 'teacher_approved': return <CheckCircleIcon />;
      case 'to_reviewing': return <SchoolIcon />;
      default: return <AssignmentIcon />;
    }
  };

  const getRoleSpecificTitle = () => {
    switch (user.role) {
      case 'student': return 'My Leave Applications';
      case 'teacher': return 'Leave Applications to Review';
      case 'to': return 'Leave Management Dashboard';
      case 'admin': return 'Leave System Overview';
      default: return 'Leave Dashboard';
    }
  };

  const getRoleSpecificStats = () => {
    const statusStats = stats.byStatus || [];
    const stageStats = stats.byStage || [];

    const totalApplications = statusStats.reduce((sum, stat) => sum + stat.count, 0);
    const approvedCount = statusStats.find(s => s._id === 'approved')?.count || 0;
    const rejectedCount = statusStats.find(s => s._id === 'rejected')?.count || 0;
    const pendingCount = statusStats.find(s => s._id === 'pending')?.count || 0;

    return {
      total: totalApplications,
      approved: approvedCount,
      rejected: rejectedCount,
      pending: pendingCount,
      inProgress: totalApplications - approvedCount - rejectedCount - pendingCount
    };
  };

  const roleStats = getRoleSpecificStats();

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            {getRoleSpecificTitle()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Complete leave application workflow management system
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          sx={{ borderRadius: 2 }}
        >
          Refresh
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
                    {roleStats.total}
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
          <Card sx={{ borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {roleStats.approved}
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
          <Card sx={{ borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {roleStats.pending + roleStats.inProgress}
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
          <Card sx={{ borderRadius: 2, boxShadow: 3, background: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {roleStats.rejected}
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

      <Grid container spacing={3}>
        {/* Workflow Process */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1a237e' }}>
                Leave Application Workflow
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#1a237e', width: 40, height: 40 }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="1. Student Application"
                    secondary="Student submits leave application with reason and dates"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="2. Teacher Review"
                    secondary="Teacher reviews and provides initial approval/rejection"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#9c27b0', width: 40, height: 40 }}>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="3. TO Final Decision"
                    secondary="Training Officer provides final approval/rejection"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 40, height: 40 }}>
                      <CheckCircleIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary="4. Student Notification"
                    secondary="Student receives notification of final decision"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Applications */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                  Recent Applications
                </Typography>
                <Chip 
                  label={`${recentApplications.length} items`} 
                  size="small" 
                  color="primary" 
                />
              </Box>
              
              {recentApplications.length > 0 ? (
                <List>
                  {recentApplications.map((application, index) => (
                    <React.Fragment key={application._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#f5f5f5', width: 40, height: 40 }}>
                            {getStatusIcon(application.status)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {user.role === 'student' ? application.leaveType : application.student?.name}
                              </Typography>
                              <Chip
                                label={application.status?.replace('_', ' ').toUpperCase()}
                                color={getStatusColor(application.status)}
                                size="small"
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {user.role === 'student' 
                                ? `Applied: ${formatDate(application.submittedDate)}`
                                : `${application.leaveType} - ${formatDate(application.submittedDate)}`
                              }
                            </Typography>
                          }
                        />
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItem>
                      {index < recentApplications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Avatar sx={{ bgcolor: '#f5f5f5', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                    <AssignmentIcon sx={{ fontSize: 30, color: 'text.secondary' }} />
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    No recent applications
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Status */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: '#1a237e' }}>
                System Status & Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      System Operational
                    </Typography>
                    <Typography variant="body2">
                      Leave application system is fully functional and processing requests.
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Workflow Active
                    </Typography>
                    <Typography variant="body2">
                      Student → Teacher → TO approval workflow is active and working.
                    </Typography>
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      Processing Time
                    </Typography>
                    <Typography variant="body2">
                      Average processing time: 2-3 business days for complete approval.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default LeaveDashboard;
