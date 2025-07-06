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
  Paper,
  LinearProgress,
  Container,
  CircularProgress
} from '@mui/material';
import {
  MenuBook as BookIcon,
  Store as StoreIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  LibraryBooks as LibraryBooksIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Class as ClassIcon,
  RequestPage as RequestIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Payment as PaymentIcon,
  Star as StarIcon
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

const TeacherDashboard = () => {
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
    availableBooks: 0
  });

  const [myBookRequests, setMyBookRequests] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [monthlyActivity, setMonthlyActivity] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [leaveApplications, setLeaveApplications] = useState([]);

  // Colors for charts
  const COLORS = ['#1a237e', '#3f51b5', '#5c6bc0', '#7986cb', '#9fa8da'];

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch teacher's book requests
      const requestsResponse = await axios.get('/api/library/my-requests', { headers });
      if (requestsResponse.data.success) {
        const requests = requestsResponse.data.requests;
        setMyBookRequests(requests);
        
        // Calculate stats
        setDashboardData({
          totalBookRequests: requests.length,
          pendingRequests: requests.filter(r => r.status === 'pending').length,
          approvedRequests: requests.filter(r => r.status === 'approved').length,
          issuedBooks: requests.filter(r => r.status === 'issued').length,
          overdueBooks: requests.filter(r => r.status === 'overdue').length,
          returnedBooks: requests.filter(r => r.status === 'returned').length,
          totalFines: requests.reduce((sum, r) => sum + (r.fine || 0), 0),
          availableBooks: 0 // Will be updated from books API
        });

        setIssuedBooks(requests.filter(r => ['issued', 'overdue'].includes(r.status)));
      }

      // Fetch available books for recommendations
      const booksResponse = await axios.get('/api/library/books', { headers });
      if (booksResponse.data.success) {
        const books = booksResponse.data.data?.books || booksResponse.data.books || [];
        const availableBooks = books.filter(book => book.isActive && book.availableCopies > 0);
        setRecommendedBooks(availableBooks.slice(0, 6));
        setDashboardData(prev => ({ ...prev, availableBooks: availableBooks.length }));
      }

      // Generate mock monthly activity data
      setMonthlyActivity([
        { month: 'Jan', requests: 2, issued: 1, returned: 1 },
        { month: 'Feb', requests: 4, issued: 3, returned: 2 },
        { month: 'Mar', requests: 1, issued: 1, returned: 3 },
        { month: 'Apr', requests: 3, issued: 2, returned: 1 },
        { month: 'May', requests: 5, issued: 4, returned: 2 },
        { month: 'Jun', requests: 2, issued: 1, returned: 4 }
      ]);

      // Generate category stats
      setCategoryStats([
        { name: 'Computer Science', value: 8, color: '#1a237e' },
        { name: 'Mathematics', value: 5, color: '#3f51b5' },
        { name: 'Engineering', value: 3, color: '#5c6bc0' },
        { name: 'Science', value: 2, color: '#7986cb' },
        { name: 'Others', value: 1, color: '#9fa8da' }
      ]);

      // Generate notifications
      generateNotifications();

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = () => {
    const notifications = [];

    // Check for overdue books
    const overdueBooks = issuedBooks.filter(book => {
      return book.dueDate && new Date() > new Date(book.dueDate);
    });

    if (overdueBooks.length > 0) {
      notifications.push({
        id: 'overdue',
        type: 'error',
        title: 'Overdue Books',
        message: `You have ${overdueBooks.length} overdue book(s). Please return them to avoid fines.`,
        time: 'Now',
        icon: <WarningIcon />
      });
    }

    // Check for books due soon
    const dueSoonBooks = issuedBooks.filter(book => {
      if (!book.dueDate) return false;
      const daysUntilDue = Math.ceil((new Date(book.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntilDue > 0 && daysUntilDue <= 3;
    });

    if (dueSoonBooks.length > 0) {
      notifications.push({
        id: 'due-soon',
        type: 'warning',
        title: 'Books Due Soon',
        message: `${dueSoonBooks.length} book(s) are due within 3 days.`,
        time: 'Today',
        icon: <ScheduleIcon />
      });
    }

    // Check for approved requests
    const approvedRequests = myBookRequests.filter(r => r.status === 'approved');
    if (approvedRequests.length > 0) {
      notifications.push({
        id: 'approved',
        type: 'success',
        title: 'Requests Approved',
        message: `${approvedRequests.length} of your book requests have been approved.`,
        time: '1 day ago',
        icon: <CheckCircleIcon />
      });
    }

    // Add general notification
    notifications.push({
      id: 'new-books',
      type: 'info',
      title: 'New Books Available',
      message: 'Check out the latest additions to our library collection.',
      time: '2 days ago',
      icon: <BookIcon />
    });

    setNotifications(notifications);
  };

  const generateMockData = () => {
    // Fallback mock data
    setDashboardData({
      totalBookRequests: 12,
      pendingRequests: 3,
      approvedRequests: 2,
      issuedBooks: 5,
      overdueBooks: 1,
      returnedBooks: 1,
      totalFines: 50,
      availableBooks: 150
    });
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
      </Box>

      {/* Notifications Section */}
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
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

      {/* Main Content Grid */}
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
                  onClick={() => navigate('/dashboard/teacher/library')}
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
                      onClick={() => navigate('/dashboard/teacher/library')}
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
                        <Button
                          size="small"
                          onClick={() => navigate('/dashboard/teacher/library')}
                          sx={{ color: '#1a237e' }}
                        >
                          <ViewIcon />
                        </Button>
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
        {/* Monthly Activity Chart */}
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

        {/* Category Distribution */}
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

export default TeacherDashboard;
