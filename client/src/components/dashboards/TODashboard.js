import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Badge,
  Divider,
  Alert,
  Container,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  MenuBook as BookIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  SupervisorAccount as SupervisorIcon,
  LibraryBooks as LibraryBooksIcon,
  Inventory as InventoryIcon,
  RequestPage as RequestIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const TODashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    students: { total: 4, active: 4, inactive: 0 },
    leaveApplications: { total: 10, pending: 8, approved: 2, rejected: 0 },
    bookRequests: { total: 10, pending: 0, approved: 7, issued: 0 },
    storeRequests: { total: 14, pending: 0, approved: 10, fulfilled: 0 }
  });

  const [recentStudents, setRecentStudents] = useState([]);
  const [pendingLeaveApplications, setPendingLeaveApplications] = useState([]);
  const [myBookRequests, setMyBookRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);

  // Colors for charts
  const COLORS = ['#7b1fa2', '#9c27b0', '#ab47bc', '#ba68c8', '#ce93d8'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch students data
      try {
        const studentsResponse = await axios.get('/api/users?role=student', { headers });
        if (studentsResponse.data.success) {
          const students = studentsResponse.data.users;
          setRecentStudents(students.slice(0, 5));
          setDashboardData(prev => ({
            ...prev,
            students: {
              total: students.length,
              active: students.filter(s => s.isActive !== false).length,
              inactive: students.filter(s => s.isActive === false).length
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }

      // Fetch leave applications
      try {
        const leaveResponse = await axios.get('/api/leave/pending-to', { headers });
        if (leaveResponse.data.success) {
          const applications = leaveResponse.data.applications;
          setPendingLeaveApplications(applications.slice(0, 5));
          setDashboardData(prev => ({
            ...prev,
            leaveApplications: {
              total: applications.length,
              pending: applications.filter(a => a.status === 'teacher_approved').length,
              approved: applications.filter(a => a.status === 'approved').length,
              rejected: applications.filter(a => a.status === 'rejected').length
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching leave applications:', error);
      }

      // Fetch TO's book requests
      try {
        const bookRequestsResponse = await axios.get('/api/library/my-requests', { headers });
        if (bookRequestsResponse.data.success) {
          const requests = bookRequestsResponse.data.requests;
          setMyBookRequests(requests.slice(0, 5));
          setDashboardData(prev => ({
            ...prev,
            bookRequests: {
              total: requests.length,
              pending: requests.filter(r => r.status === 'pending').length,
              approved: requests.filter(r => r.status === 'approved').length,
              issued: requests.filter(r => r.status === 'issued').length
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching book requests:', error);
      }

      // Generate mock monthly stats
      setMonthlyStats([
        { month: 'Jan', students: 45, leaves: 8, books: 12 },
        { month: 'Feb', students: 48, leaves: 6, books: 15 },
        { month: 'Mar', students: 52, leaves: 10, books: 18 },
        { month: 'Apr', students: 50, leaves: 12, books: 20 },
        { month: 'May', students: 55, leaves: 15, books: 22 },
        { month: 'Jun', students: 58, leaves: 9, books: 25 }
      ]);

      // Generate department stats
      setDepartmentStats([
        { name: 'CSA', value: 25, color: '#7b1fa2' },
        { name: 'CHNM', value: 20, color: '#9c27b0' },
        { name: 'Welder', value: 18, color: '#ab47bc' },
        { name: 'Electronic Mechanics', value: 15, color: '#ba68c8' },
        { name: 'Electronics', value: 12, color: '#ce93d8' }
      ]);

      // Generate notifications
      generateNotifications();

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = () => {
    const notifications = [];

    // Check for pending leave applications
    if (pendingLeaveApplications.length > 0) {
      notifications.push({
        id: 'pending-leaves',
        type: 'warning',
        title: 'Pending Leave Applications',
        message: `${pendingLeaveApplications.length} leave applications require your final approval.`,
        time: 'Now',
        icon: <AssignmentIcon />
      });
    }

    // Check for new students
    notifications.push({
      id: 'student-management',
      type: 'info',
      title: 'Student Management',
      message: `You are managing ${dashboardData.students.total} students across all departments.`,
      time: 'Today',
      icon: <GroupIcon />
    });

    // Check for book requests
    if (myBookRequests.length > 0) {
      notifications.push({
        id: 'book-requests',
        type: 'success',
        title: 'Library Access',
        message: `You have ${myBookRequests.length} book requests in progress.`,
        time: '1 day ago',
        icon: <BookIcon />
    });
    }

    setNotifications(notifications);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'teacher_approved': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2', mb: 1 }}>
          Welcome back, {user?.name}!
        </Typography>
        {/* <Typography variant="body1" color="text.secondary">
          Training Officer Dashboard - Manage students, approve leaves, and oversee training activities
        </Typography> */}
      </Box>

      {/* Notifications Section */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsIcon sx={{ color: '#7b1fa2', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
              Recent Notifications
            </Typography>
            <Badge badgeContent={notifications.length} color="error" sx={{ ml: 1 }} />
          </Box>
          <List sx={{ py: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Avatar sx={{ 
                      bgcolor: notification.type === 'success' ? 'success.main' : 
                               notification.type === 'warning' ? 'warning.main' : 
                               notification.type === 'error' ? 'error.main' : 'info.main',
                      width: 40, 
                      height: 40 
                    }}>
                      {notification.icon}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {notification.time}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                    {dashboardData.students.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#7b1fa2', width: 56, height: 56 }}>
                  <GroupIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {dashboardData.leaveApplications.pending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Leaves
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {dashboardData.bookRequests.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    My Book Requests
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <LibraryBooksIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                    {dashboardData.leaveApplications.approved}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Approved Leaves
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Recent Students */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                  Recent Students
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/dashboard/users')}
                  sx={{ color: '#7b1fa2' }}
                >
                  Manage
                </Button>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List sx={{ py: 0 }}>
                  {recentStudents.map((student, index) => (
                    <React.Fragment key={student._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#7b1fa2', width: 40, height: 40 }}>
                            <PersonIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {student.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {student.studentId} • {student.department}
                              </Typography>
                              <br />
                              <Chip
                                label={student.course || 'N/A'}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentStudents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {recentStudents.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No students found
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/dashboard/users')}
                      sx={{ mt: 1, borderColor: '#7b1fa2', color: '#7b1fa2' }}
                    >
                      Manage Students
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Leave Applications */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                  Pending Leave Applications
                </Typography>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => navigate('/dashboard/to/leave-applications')}
                  sx={{ color: '#7b1fa2' }}
                >
                  View All
                </Button>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List sx={{ py: 0 }}>
                  {pendingLeaveApplications.map((application, index) => (
                    <React.Fragment key={application._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                            <AssignmentIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {application.student?.name}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {application.leaveType} • {formatDate(application.startDate)}
                              </Typography>
                              <br />
                              <Chip
                                label={application.status?.toUpperCase()}
                                size="small"
                                color={getStatusColor(application.status)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < pendingLeaveApplications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {pendingLeaveApplications.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No pending applications
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* My Book Requests */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2' }}>
                  My Book Requests
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/dashboard/to/library')}
                  sx={{ color: '#7b1fa2' }}
                >
                  Request Book
                </Button>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List sx={{ py: 0 }}>
                  {myBookRequests.map((request, index) => (
                    <React.Fragment key={request._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                            <BookIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {request.book?.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {request.book?.author}
                              </Typography>
                              <br />
                              <Chip
                                label={request.status?.toUpperCase()}
                                size="small"
                                color={getStatusColor(request.status)}
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < myBookRequests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {myBookRequests.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No book requests yet
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/dashboard/to/library')}
                      sx={{ mt: 1, borderColor: '#7b1fa2', color: '#7b1fa2' }}
                    >
                      Request Books
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Monthly Statistics */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2', mb: 3 }}>
                Monthly Training Statistics
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#7b1fa2" name="Students" />
                    <Bar dataKey="leaves" fill="#9c27b0" name="Leave Applications" />
                    <Bar dataKey="books" fill="#ab47bc" name="Book Requests" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2', mb: 3 }}>
                Department Distribution
              </Typography>
              <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {departmentStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      
    </Container>
  );
};

export default TODashboard;
