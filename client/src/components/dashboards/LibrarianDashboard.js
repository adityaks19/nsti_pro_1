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
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  MenuBook as BookIcon,
  RequestPage as RequestIcon,
  People as PeopleIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  School as SchoolIcon,
  LibraryBooks as LibraryBooksIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Clear as ClearIcon
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
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const LibrarianDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    books: [],
    recentRequests: [],
    students: [],
    notifications: [],
    stats: {
      totalBooks: 0,
      availableBooks: 0,
      issuedBooks: 0,
      pendingRequests: 0,
      overdueBooks: 0,
      totalStudents: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/library/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
      // Fallback to mock data
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockData = {
      books: [
        { _id: 1, title: 'Introduction to Computer Science', author: 'Thomas H. Cormen', availableCopies: 8, totalCopies: 10, category: 'Computer Science', location: { shelf: 'A1', section: 'CS' } },
        { _id: 2, title: 'Digital Electronics', author: 'Morris Mano', availableCopies: 6, totalCopies: 8, category: 'Electronics', location: { shelf: 'B2', section: 'EC' } },
        { _id: 3, title: 'Data Structures and Algorithms', author: 'Robert Sedgewick', availableCopies: 10, totalCopies: 12, category: 'Computer Science', location: { shelf: 'A2', section: 'CS' } },
        { _id: 4, title: 'Engineering Mathematics', author: 'B.S. Grewal', availableCopies: 12, totalCopies: 15, category: 'Mathematics', location: { shelf: 'C3', section: 'MATH' } },
        { _id: 5, title: 'Mechanical Engineering Design', author: 'Joseph Shigley', availableCopies: 4, totalCopies: 6, category: 'Mechanical', location: { shelf: 'D4', section: 'MECH' } },
      ],
      recentRequests: [
        { _id: 1, requestedBy: { name: 'Aditya Sharma', role: 'student', studentId: 'STU2025040' }, book: { title: 'Introduction to Computer Science' }, status: 'pending', createdAt: '2025-07-05T10:30:00Z' },
        { _id: 2, requestedBy: { name: 'Prof. Rajesh Kumar', role: 'teacher', employeeId: 'EMP2025981' }, book: { title: 'Data Structures and Algorithms' }, status: 'pending', createdAt: '2025-07-05T09:15:00Z' },
        { _id: 3, requestedBy: { name: 'Training Officer', role: 'to', employeeId: 'EMP2025577' }, book: { title: 'Engineering Mathematics' }, status: 'approved', createdAt: '2025-07-04T14:20:00Z' },
        { _id: 4, requestedBy: { name: 'Priya Singh', role: 'student', studentId: 'STU2025041' }, book: { title: 'Digital Electronics' }, status: 'issued', createdAt: '2025-07-04T11:45:00Z', dueDate: '2025-07-18' },
        { _id: 5, requestedBy: { name: 'Rahul Kumar', role: 'student', studentId: 'STU2025042' }, book: { title: 'Mechanical Engineering Design' }, status: 'overdue', createdAt: '2025-06-20T16:30:00Z', dueDate: '2025-07-04' },
      ],
      notifications: [
        { id: 1, message: 'New request from Aditya Sharma (Student)', type: 'request', time: '30 minutes ago', priority: 'high', role: 'student' },
        { id: 2, message: 'New request from Prof. Rajesh Kumar (Teacher)', type: 'request', time: '2 hours ago', priority: 'high', role: 'teacher' },
        { id: 3, message: 'Book overdue: Mechanical Engineering Design', type: 'overdue', time: '1 day ago', priority: 'high', role: 'student' },
      ],
      stats: {
        totalBooks: 51,
        availableBooks: 40,
        issuedBooks: 11,
        pendingRequests: 2,
        overdueBooks: 1,
        totalStudents: 25
      }
    };
    setDashboardData(mockData);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApproveRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/library/requests/${requestId}/approve`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Request approved successfully');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Approve request error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  // Seed books for testing
  const seedBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/library/seed-books', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Seed books error:', error);
      toast.error('Failed to seed books data');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/library/requests/${requestId}/reject`, {
        remarks: 'Rejected from dashboard'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Request rejected');
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Reject request error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#2196f3';
      case 'approved': return '#ff9800';
      case 'issued': return '#4caf50';
      case 'returned': return '#9c27b0';
      case 'rejected': return '#f44336';
      case 'overdue': return '#d32f2f';
      case 'Active': return '#4caf50';
      default: return '#757575';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'student': return '#2196f3';
      case 'teacher': return '#4caf50';
      case 'to': return '#9c27b0';
      default: return '#757575';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return <PersonIcon />;
      case 'teacher': return <SchoolIcon />;
      case 'to': return <LibraryBooksIcon />;
      default: return <PersonIcon />;
    }
  };

  const chartData = [
    { name: 'Available', value: dashboardData.stats.availableBooks, color: '#4caf50' },
    { name: 'Issued', value: dashboardData.stats.issuedBooks, color: '#2196f3' },
    { name: 'Overdue', value: dashboardData.stats.overdueBooks, color: '#f44336' },
  ];

  const COLORS = ['#4caf50', '#2196f3', '#f44336'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Library Management Dashboard
          </Typography>
          {/* <Typography variant="body1" color="text.secondary">
            Manage books, requests, and student activities efficiently
          </Typography> */}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            sx={{ borderColor: '#1a237e', color: '#1a237e' }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            onClick={seedBooks}
            sx={{ borderColor: '#4caf50', color: '#4caf50' }}
          >
            Seed Books
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/librarian/add-book')}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
          >
            Add Book
          </Button>
        </Box>
      </Box>

      {/* Notifications Section - Reduced Height */}
      {dashboardData.notifications && dashboardData.notifications.length > 0 && (
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ color: '#1a237e', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Recent Notifications
              </Typography>
              <Badge badgeContent={dashboardData.notifications.length} color="error" sx={{ ml: 1 }} />
            </Box>
            <Grid container spacing={2}>
              {dashboardData.notifications.slice(0, 3).map((notification, index) => (
                <Grid item xs={12} md={4} key={notification.id || index}>
                  <Alert 
                    severity={
                      notification.type === 'overdue' ? 'error' : 
                      notification.type === 'request' ? 'info' : 'warning'
                    }
                    sx={{ borderRadius: 2 }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption">
                      {notification.time}
                    </Typography>
                  </Alert>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#1a237e', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <LibraryBooksIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                {dashboardData.stats.totalBooks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Books
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#4caf50', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {dashboardData.stats.availableBooks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Books
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#2196f3', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <BookIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196f3' }}>
                {dashboardData.stats.issuedBooks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Issued Books
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Badge badgeContent={dashboardData.stats.pendingRequests} color="error">
                <Avatar sx={{ bgcolor: '#ff9800', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <RequestIcon />
                </Avatar>
              </Badge>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {dashboardData.stats.pendingRequests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#f44336', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <WarningIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                {dashboardData.stats.overdueBooks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#9c27b0', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                {dashboardData.stats.totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trainees/Students
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

     {/* Charts Section - Three containers in one line */}
<Grid container spacing={3}>
  {/* Books Distribution Chart */}
  <Grid item xs={12} md={4}>
    <Card sx={{ borderRadius: 2, boxShadow: 3, height: '500px' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 2 }}>
          Books Distribution Overview
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
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

  {/* Available Books */}
  <Grid item xs={12} md={8}>
    <Card sx={{ borderRadius: 2, boxShadow: 3, height: '500px' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
            Available Books
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/librarian/books')}
            sx={{ borderColor: '#4caf50', color: '#4caf50' }}
          >
            Manage Books
          </Button>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <List sx={{ py: 0 }}>
            {dashboardData.books && dashboardData.books.slice(0, 5).map((book, index) => (
              <React.Fragment key={book._id}>
                <ListItem sx={{ px: 0, py: 2 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: '#e8f5e8', color: '#2e7d32', width: 40, height: 40 }}>
                      <BookIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={book.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          by {book.author}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={book.category} 
                            size="small" 
                            sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {typeof book.location === 'object' 
                              ? `${book.location.shelf}-${book.location.section}` 
                              : book.location || 'Not specified'}
                          </Typography>
                        </Box>
                      </Box>
                    }
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 'bold', 
                      color: (book.availableCopies || book.available) > 0 ? '#4caf50' : '#f44336',
                      mb: 0.5
                    }}>
                      {book.availableCopies || book.available}/{book.totalCopies || book.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Available
                    </Typography>
                  </Box>
                </ListItem>
                {index < Math.min(dashboardData.books.length, 5) - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          {(!dashboardData.books || dashboardData.books.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No books available
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  </Grid>
</Grid>

    </Container>
  );
};

export default LibrarianDashboard;



