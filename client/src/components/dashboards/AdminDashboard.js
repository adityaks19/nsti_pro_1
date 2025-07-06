import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  IconButton,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
} from '@mui/material';
import {
  People as PeopleIcon,
  MenuBook as BookIcon,
  Store as StoreIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  School as SchoolIcon,
  SupervisorAccount as SupervisorAccountIcon,
  LocalLibrary as LocalLibraryIcon,
  Inventory as InventoryIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
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
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalUsers: 0,
      totalBooks: 0,
      totalStoreItems: 0,
      pendingRequests: 0,
      activeStudents: 0,
      systemAlerts: 0
    },
    recentUsers: [],
    recentBooks: [],
    recentRequests: [],
    systemAlerts: [],
    notifications: []
  });
  
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      
      const mockData = {
        stats: {
          totalUsers: 156,
          totalBooks: 2847,
          totalStoreItems: 1234,
          pendingRequests: 23,
          activeStudents: 142,
          systemAlerts: 3
        },
        recentUsers: [
          { id: 1, name: 'Aditya Sharma', role: 'student', email: 'aditya@nsti.edu', status: 'Active', joinDate: '2025-07-01' },
          { id: 2, name: 'Prof. Rajesh Kumar', role: 'teacher', email: 'rajesh@nsti.edu', status: 'Active', joinDate: '2025-06-28' },
          { id: 3, name: 'Priya Singh', role: 'student', email: 'priya@nsti.edu', status: 'Active', joinDate: '2025-06-25' },
          { id: 4, name: 'Training Officer', role: 'to', email: 'to@nsti.edu', status: 'Active', joinDate: '2025-06-20' },
          { id: 5, name: 'Store Manager', role: 'store', email: 'store@nsti.edu', status: 'Active', joinDate: '2025-06-15' },
        ],
        recentBooks: [
          { id: 1, title: 'Advanced Computer Science', author: 'Dr. Smith', category: 'Computer Science', available: 15, total: 20, addedDate: '2025-07-03' },
          { id: 2, title: 'Digital Signal Processing', author: 'Prof. Johnson', category: 'Electronics', available: 8, total: 12, addedDate: '2025-07-02' },
          { id: 3, title: 'Machine Learning Fundamentals', author: 'Dr. Brown', category: 'AI/ML', available: 22, total: 25, addedDate: '2025-07-01' },
          { id: 4, title: 'Database Management Systems', author: 'Prof. Davis', category: 'Computer Science', available: 18, total: 20, addedDate: '2025-06-30' },
          { id: 5, title: 'Network Security', author: 'Dr. Wilson', category: 'Cybersecurity', available: 12, total: 15, addedDate: '2025-06-28' },
        ],
        recentRequests: [
          { id: 1, type: 'Book Request', user: 'Aditya Sharma', item: 'Advanced Computer Science', status: 'pending', date: '2025-07-05' },
          { id: 2, type: 'Store Request', user: 'Prof. Rajesh', item: 'A4 Paper - 100 sheets', status: 'approved', date: '2025-07-05' },
          { id: 3, type: 'Leave Application', user: 'Priya Singh', item: 'Medical Leave - 3 days', status: 'pending', date: '2025-07-04' },
          { id: 4, type: 'Book Request', user: 'Training Officer', item: 'Database Management', status: 'issued', date: '2025-07-04' },
          { id: 5, type: 'Store Request', user: 'Sneha Patel', item: 'Cleaning Supplies', status: 'pending', date: '2025-07-03' },
        ],
        systemAlerts: [
          { id: 1, type: 'warning', message: 'Low stock alert: A4 Paper (Only 15 packets remaining)', priority: 'high', time: '2 hours ago' },
          { id: 2, type: 'info', message: 'System backup completed successfully', priority: 'low', time: '6 hours ago' },
          { id: 3, type: 'error', message: '3 books are overdue and need immediate attention', priority: 'high', time: '1 day ago' },
        ],
        notifications: [
          { id: 1, message: 'New user registration: Vikash Yadav (Student)', type: 'user', time: '1 hour ago', priority: 'medium' },
          { id: 2, message: 'Book request approved: Machine Learning Fundamentals', type: 'book', time: '3 hours ago', priority: 'low' },
          { id: 3, message: 'Store inventory updated: 50 new items added', type: 'store', time: '5 hours ago', priority: 'medium' },
          { id: 4, message: 'System maintenance scheduled for tonight', type: 'system', time: '8 hours ago', priority: 'high' },
        ]
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCRUDOperation = async (operation, type, data = null) => {
    try {
      setLoading(true);
      
      switch (operation) {
        case 'create':
          // Create new item
          toast.success(`${type} created successfully!`);
          break;
        case 'update':
          // Update existing item
          toast.success(`${type} updated successfully!`);
          break;
        case 'delete':
          // Delete item
          toast.success(`${type} deleted successfully!`);
          break;
        case 'view':
          // View item details
          setSelectedItem(data);
          setDialogType('view');
          setDialogOpen(true);
          break;
        default:
          break;
      }
      
      // Refresh data after operation
      await fetchDashboardData();
    } catch (error) {
      toast.error(`Failed to ${operation} ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type, operation, item = null) => {
    setDialogType(`${operation}-${type}`);
    setSelectedItem(item);
    setFormData(item || {});
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType('');
    setSelectedItem(null);
    setFormData({});
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#4caf50';
      case 'pending': return '#2196f3';
      case 'approved': return '#ff9800';
      case 'issued': return '#4caf50';
      case 'rejected': return '#f44336';
      case 'overdue': return '#d32f2f';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const chartData = [
    { name: 'Users', value: dashboardData.stats.totalUsers, color: '#1a237e' },
    { name: 'Books', value: dashboardData.stats.totalBooks, color: '#4caf50' },
    { name: 'Store Items', value: dashboardData.stats.totalStoreItems, color: '#ff9800' },
    { name: 'Students', value: dashboardData.stats.activeStudents, color: '#2196f3' },
  ];

  const COLORS = ['#1a237e', '#4caf50', '#ff9800', '#2196f3'];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Welcome, {user?.name}!
        </Typography>
        {/* <Typography variant="body1" color="text.secondary">
          Complete system administration and management dashboard
        </Typography> */}
      </Box>

      {/* System Alerts - Top Priority */}
      {dashboardData.systemAlerts.length > 0 && (
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: '0 8px 32px rgba(244, 67, 54, 0.1)',
          border: '1px solid rgba(244, 67, 54, 0.2)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#f44336', mr: 2, width: 48, height: 48 }}>
                <WarningIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                System Alerts ({dashboardData.systemAlerts.length})
              </Typography>
            </Box>
            
            {dashboardData.systemAlerts.map((alert, index) => (
              <Alert 
                key={alert.id} 
                severity={alert.type} 
                sx={{ mb: index < dashboardData.systemAlerts.length - 1 ? 2 : 0, borderRadius: 2 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {alert.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alert.time}
                </Typography>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
     <Grid container spacing={3} sx={{ mb: 4, px: 2 }}>
  {[
    {
      title: 'Total Users',
      value: dashboardData.stats.totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)',
      shadow: 'rgba(26, 35, 126, 0.1)',
      route: '/dashboard/admin/users',
      buttonLabel: 'Manage',
    },
    {
      title: 'Total Books',
      value: dashboardData.stats.totalBooks,
      icon: <BookIcon sx={{ fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
      shadow: 'rgba(76, 175, 80, 0.1)',
      route: '/dashboard/admin/library',
      buttonLabel: 'Manage',
    },
    {
      title: 'Store Items',
      value: dashboardData.stats.totalStoreItems,
      icon: <StoreIcon sx={{ fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)',
      shadow: 'rgba(255, 152, 0, 0.1)',
      route: '/dashboard/admin/store',
      buttonLabel: 'Manage',
    },
    {
      title: 'Pending Requests',
      value: dashboardData.stats.pendingRequests,
      icon: <AssignmentIcon sx={{ fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
      shadow: 'rgba(33, 150, 243, 0.1)',
      route: '/dashboard/admin/requests',
      buttonLabel: 'Review',
    },
    {
      title: 'Active Students',
      value: dashboardData.stats.activeStudents,
      icon: <SchoolIcon sx={{ fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
      shadow: 'rgba(156, 39, 176, 0.1)',
      route: '/dashboard/admin/students',
      buttonLabel: 'View',
    },
    {
      title: 'System Alerts',
      value: dashboardData.systemAlerts.length,
      icon: <SettingsIcon sx={{ fontSize: 28 }} />,
      bg: 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)',
      shadow: 'rgba(244, 67, 54, 0.1)',
      route: '/dashboard/admin/settings',
      buttonLabel: 'Settings',
    },
  ].map((card, index) => (
    <Grid item xs={12} sm={6} md={4} lg={2} key={index} sx={{ display: 'flex', justifyContent: 'between' }}>
      <Card
        sx={{
          borderRadius: 3,
          height: '50%',
          width: '100%',
          boxShadow: `0 8px 32px ${card.shadow}`,
          background: card.bg,
          color: 'white',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': { transform: 'translateY(-4px)' },
        }}
      >
        <CardContent sx={{ p: 3, textAlign: 'center',width: '100%',}}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              mx: 'auto',
              mb: 2,
              width: 35,
              height: 35,
            }}
          >
            {card.icon}
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1,fontSize: '1.5rem' }}>
            {card.value}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
            {card.title}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(card.route)}
            sx={{
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': { borderColor: 'white' },
            }}
          >
            {card.buttonLabel}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3} sx={{ mb: 4,  }}>
        {/* Recent Users Management */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 48, height: 48 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                      Recent Users
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest registered users
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    color="primary" 
                    onClick={() => openDialog('user', 'create')}
                    sx={{ bgcolor: '#e3f2fd' }}
                  >
                    <AddIcon />
                  </IconButton>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate('/dashboard/admin/users')}
                    sx={{ borderColor: '#1a237e', color: '#1a237e' }}
                  >
                    View All
                  </Button>
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                {dashboardData.recentUsers.map((user, index) => (
                  <React.Fragment key={user.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ 
                          bgcolor: user.role === 'admin' ? '#f44336' : 
                                   user.role === 'teacher' ? '#4caf50' : 
                                   user.role === 'student' ? '#2196f3' : '#ff9800',
                          width: 40, 
                          height: 40 
                        }}>
                          {user.role === 'admin' ? <AdminIcon /> : 
                           user.role === 'teacher' ? <SchoolIcon /> : 
                           <PersonIcon />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {user.name}
                            </Typography>
                            <Chip 
                              label={user.role} 
                              size="small" 
                              sx={{ 
                                bgcolor: user.role === 'admin' ? '#ffebee' : 
                                         user.role === 'teacher' ? '#e8f5e8' : 
                                         user.role === 'student' ? '#e3f2fd' : '#fff3e0',
                                color: user.role === 'admin' ? '#c62828' : 
                                       user.role === 'teacher' ? '#2e7d32' : 
                                       user.role === 'student' ? '#1565c0' : '#f57c00',
                                textTransform: 'capitalize',
                                fontWeight: 'bold'
                              }} 
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Joined: {new Date(user.joinDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={user.status} 
                          size="small" 
                          sx={{ 
                            bgcolor: getStatusColor(user.status),
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 1
                          }} 
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => openDialog('user', 'view', user)}
                            sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => openDialog('user', 'edit', user)}
                            sx={{ bgcolor: '#fff3e0', color: '#f57c00' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCRUDOperation('delete', 'user', user)}
                            sx={{ bgcolor: '#ffebee', color: '#c62828' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < dashboardData.recentUsers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Books Management */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#4caf50', mr: 2, width: 48, height: 48 }}>
                    <BookIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                      Recent Books
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest added books
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    color="primary" 
                    onClick={() => openDialog('book', 'create')}
                    sx={{ bgcolor: '#e8f5e8' }}
                  >
                    <AddIcon />
                  </IconButton>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => navigate('/dashboard/admin/library')}
                    sx={{ borderColor: '#4caf50', color: '#4caf50' }}
                  >
                    View All
                  </Button>
                </Box>
              </Box>

              <List sx={{ p: 0 }}>
                {dashboardData.recentBooks.map((book, index) => (
                  <React.Fragment key={book.id}>
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
                                Added: {new Date(book.addedDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ textAlign: 'right', mr: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            color: book.available > 0 ? '#4caf50' : '#f44336',
                            mb: 0.5
                          }}>
                            {book.available}/{book.total}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Available
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => openDialog('book', 'view', book)}
                            sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => openDialog('book', 'edit', book)}
                            sx={{ bgcolor: '#fff3e0', color: '#f57c00' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleCRUDOperation('delete', 'book', book)}
                            sx={{ bgcolor: '#ffebee', color: '#c62828' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </ListItem>
                    {index < dashboardData.recentBooks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Analytics Chart */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 3 }}>
                System Overview
              </Typography>
              
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box sx={{ mt: 2 }}>
                {chartData.map((item, index) => (
                  <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      bgcolor: COLORS[index],
                      mr: 1
                    }} />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {item.value.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Requests Management */}
        <Grid item xs={12} lg={6}>
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#2196f3', mr: 2, width: 48, height: 48 }}>
                    <AssignmentIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                      Recent Requests
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      All system requests
                    </Typography>
                  </Box>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/dashboard/admin/requests')}
                  sx={{ borderColor: '#2196f3', color: '#2196f3' }}
                >
                  View All
                </Button>
              </Box>

              <List sx={{ p: 0 }}>
                {dashboardData.recentRequests.map((request, index) => (
                  <React.Fragment key={request.id}>
                    <ListItem sx={{ px: 0, py: 2 }}>
                      <ListItemIcon>
                        <Avatar sx={{ 
                          bgcolor: request.type === 'Book Request' ? '#e8f5e8' : 
                                   request.type === 'Store Request' ? '#fff3e0' : '#f3e5f5',
                          color: request.type === 'Book Request' ? '#2e7d32' : 
                                 request.type === 'Store Request' ? '#f57c00' : '#7b1fa2',
                          width: 40, 
                          height: 40 
                        }}>
                          {request.type === 'Book Request' ? <BookIcon /> : 
                           request.type === 'Store Request' ? <StoreIcon /> : <AssignmentIcon />}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {request.user}
                            </Typography>
                            <Chip 
                              label={request.type} 
                              size="small" 
                              sx={{ 
                                bgcolor: request.type === 'Book Request' ? '#e8f5e8' : 
                                         request.type === 'Store Request' ? '#fff3e0' : '#f3e5f5',
                                color: request.type === 'Book Request' ? '#2e7d32' : 
                                       request.type === 'Store Request' ? '#f57c00' : '#7b1fa2',
                                fontWeight: 'bold'
                              }} 
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                              {request.item}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(request.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={request.status} 
                          size="small" 
                          sx={{ 
                            bgcolor: getStatusColor(request.status),
                            color: 'white',
                            fontWeight: 'bold',
                            textTransform: 'capitalize'
                          }} 
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => openDialog('request', 'view', request)}
                            sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          {request.status === 'pending' && (
                            <>
                              <IconButton 
                                size="small" 
                                onClick={() => handleCRUDOperation('approve', 'request', request)}
                                sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                onClick={() => handleCRUDOperation('reject', 'request', request)}
                                sx={{ bgcolor: '#ffebee', color: '#c62828' }}
                              >
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                    {index < dashboardData.recentRequests.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Floating Action Button for Quick Actions */}
      <Fab 
        color="primary" 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          bgcolor: '#1a237e',
          '&:hover': { bgcolor: '#0d47a1' }
        }}
        onClick={() => setDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* CRUD Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          {dialogType.includes('create') ? 'Create New' : 
           dialogType.includes('edit') ? 'Edit' : 
           dialogType.includes('view') ? 'View Details' : 'Action'} {' '}
          {dialogType.includes('user') ? 'User' : 
           dialogType.includes('book') ? 'Book' : 
           dialogType.includes('request') ? 'Request' : 'Item'}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedItem && dialogType.includes('view') ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                {selectedItem.name || selectedItem.title || selectedItem.user}
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(selectedItem).map(([key, value]) => (
                  <Grid item xs={12} sm={6} key={key}>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {dialogType.includes('create') ? 'Create a new item in the system.' : 
                 dialogType.includes('edit') ? 'Edit the selected item.' : 
                 'Perform the selected action.'}
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                This is a demonstration interface. In the full system, this would connect to the database for real CRUD operations.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeDialog}>
            Cancel
          </Button>
          {!dialogType.includes('view') && (
            <Button 
              variant="contained" 
              onClick={() => {
                handleCRUDOperation(
                  dialogType.includes('create') ? 'create' : 'update',
                  dialogType.includes('user') ? 'user' : 
                  dialogType.includes('book') ? 'book' : 'request'
                );
                closeDialog();
              }}
              sx={{ bgcolor: '#1a237e' }}
            >
              {dialogType.includes('create') ? 'Create' : 'Update'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
