import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Badge,
  Divider,
  Alert,
  Tooltip,
  IconButton,
  Paper,
  CircularProgress,
  Container
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  School as SchoolIcon,
  LibraryBooks as LibraryBooksIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  AccessTime as AccessTimeIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  Book as BookDetailIcon
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
  Legend,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalBookRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    issuedBooks: 0,
    overdueBooks: 0,
    returnedBooks: 0,
    totalFines: 0,
    pendingFines: 0,
    availableBooks: 0
  });

  const [myBookRequests, setMyBookRequests] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);

  // Colors for charts
  const COLORS = ['#1a237e', '#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da'];

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch dashboard data from the new endpoint
      const response = await axios.get('/api/student/dashboard', { headers });
      
      if (response.data.success) {
        const data = response.data.data;
        
        setDashboardData(data.stats);
        setMyBookRequests(data.recentRequests);
        setIssuedBooks(data.issuedBooks);
        setRecommendedBooks(data.recommendedBooks);
        setNotifications(data.notifications);
        setMonthlyActivity(data.monthlyActivity);
        setCategoryStats(data.categoryStats);
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
      
      // Fallback to mock data if API fails
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    // Fallback mock data in case API fails
    setDashboardData({
      totalBookRequests: 8,
      pendingRequests: 2,
      approvedRequests: 1,
      issuedBooks: 3,
      overdueBooks: 1,
      returnedBooks: 1,
      totalFines: 25,
      pendingFines: 15,
      availableBooks: 150
    });

    setMonthlyActivity([
      { month: 'Jan', requests: 3, issued: 2, returned: 1 },
      { month: 'Feb', requests: 5, issued: 4, returned: 3 },
      { month: 'Mar', requests: 2, issued: 2, returned: 2 },
      { month: 'Apr', requests: 4, issued: 3, returned: 2 },
      { month: 'May', requests: 6, issued: 5, returned: 4 },
      { month: 'Jun', requests: 3, issued: 2, returned: 3 }
    ]);

    setCategoryStats([
      { name: 'Computer Science', value: 5, color: '#1a237e' },
      { name: 'Mathematics', value: 3, color: '#3f51b5' },
      { name: 'Engineering', value: 2, color: '#5c6bc0' },
      { name: 'Science', value: 1, color: '#7986cb' }
    ]);

    setNotifications([
      {
        id: 1,
        type: 'warning',
        title: 'Book Due Soon',
        message: 'Your book "Database Management" is due in 2 days.',
        time: '1 day ago',
        icon: <WarningIcon />
      },
      {
        id: 2,
        type: 'success',
        title: 'Request Approved',
        message: 'Your request for "Computer Networks" has been approved.',
        time: '2 days ago',
        icon: <CheckCircleIcon />
      }
    ]);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'issued': return 'success';
      case 'overdue': return 'error';
      case 'returned': return 'default';
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

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Welcome back, {user?.name}!
        </Typography>
        {/* <Typography variant="body1" color="text.secondary">
          Here's your library activity overview
        </Typography> */}
      </Box>

      {/* Notifications Section - Top Priority */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsIcon sx={{ color: '#1a237e', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
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
                               notification.type === 'warning' ? 'warning.main' : 'info.main',
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
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    {dashboardData.totalBookRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Requests
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 56, height: 56 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {dashboardData.issuedBooks}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Books Issued
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                  <BookIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {dashboardData.pendingRequests}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Requests
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                  <ScheduleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    ₹{dashboardData.totalFines}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Fines
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                  <PaymentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid - Full Width */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Book Requests */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                  My Book Requests
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/dashboard/student/library')}
                  sx={{ color: '#1a237e' }}
                >
                  Request Book
                </Button>
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List sx={{ py: 0 }}>
                  {myBookRequests.slice(0, 4).map((request, index) => (
                    <React.Fragment key={request._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: '#1a237e', width: 40, height: 40 }}>
                            <BookDetailIcon />
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
                      {index < myBookRequests.slice(0, 4).length - 1 && <Divider />}
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
                      onClick={() => navigate('/dashboard/student/library')}
                      sx={{ mt: 1, borderColor: '#1a237e', color: '#1a237e' }}
                    >
                      Request Your First Book
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Issued Books */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
                Currently Issued Books
              </Typography>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List sx={{ py: 0 }}>
                  {issuedBooks.slice(0, 4).map((book, index) => (
                    <React.Fragment key={book._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                            <LibraryBooksIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {book.book?.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                Due: {formatDate(book.dueDate)}
                              </Typography>
                              <br />
                              {getDaysRemaining(book.dueDate) !== null && (
                                <Chip
                                  label={
                                    getDaysRemaining(book.dueDate) < 0
                                      ? `${Math.abs(getDaysRemaining(book.dueDate))} days overdue`
                                      : `${getDaysRemaining(book.dueDate)} days left`
                                  }
                                  size="small"
                                  color={getDaysRemaining(book.dueDate) < 0 ? 'error' : 
                                         getDaysRemaining(book.dueDate) <= 3 ? 'warning' : 'success'}
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < issuedBooks.slice(0, 4).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {issuedBooks.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No books currently issued
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommended Books */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
                Recommended for You
              </Typography>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                <List sx={{ py: 0 }}>
                  {recommendedBooks.slice(0, 4).map((book, index) => (
                    <React.Fragment key={book._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                            <StarIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {book.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" color="text.secondary">
                                {book.author}
                              </Typography>
                              <br />
                              <Chip
                                label={book.category}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                          }
                        />
                        <IconButton
                          size="small"
                          onClick={() => navigate('/dashboard/student/library')}
                          sx={{ color: '#1a237e' }}
                        >
                          <ViewIcon />
                        </IconButton>
                      </ListItem>
                      {index < recommendedBooks.slice(0, 4).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Monthly Activity Chart - Full Width */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}>
                Monthly Library Activity
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#1a237e" name="Requests" />
                    <Bar dataKey="issued" fill="#3f51b5" name="Issued" />
                    <Bar dataKey="returned" fill="#5c6bc0" name="Returned" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Distribution - Full Width */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}>
                Reading Categories Distribution
              </Typography>
              <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
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

export default StudentDashboard;
