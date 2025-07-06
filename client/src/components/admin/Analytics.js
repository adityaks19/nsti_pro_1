import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DatePicker,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  MenuBook as BookIcon,
  Store as StoreIcon,
  Assignment as AssignmentIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from 'recharts';
import axios from 'axios';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({});
  const [trends, setTrends] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topBooks, setTopBooks] = useState([]);
  const [topItems, setTopItems] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, reportType]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, trendsRes, usersRes, booksRes, itemsRes] = await Promise.all([
        axios.get(`/api/analytics/overview?days=${dateRange}`),
        axios.get(`/api/analytics/trends?days=${dateRange}`),
        axios.get(`/api/analytics/top-users?days=${dateRange}`),
        axios.get(`/api/analytics/top-books?days=${dateRange}`),
        axios.get(`/api/analytics/top-items?days=${dateRange}`)
      ]);
      
      setAnalyticsData(analyticsRes.data.data || {});
      setTrends(trendsRes.data.data || []);
      setTopUsers(usersRes.data.data || []);
      setTopBooks(booksRes.data.data || []);
      setTopItems(itemsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box flex={1}>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                {subtitle}
              </Typography>
            )}
            {change !== undefined && (
              <Box display="flex" alignItems="center" gap={0.5}>
                {change >= 0 ? (
                  <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
                ) : (
                  <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                )}
                <Typography 
                  variant="caption" 
                  sx={{ color: change >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}
                >
                  {change >= 0 ? '+' : ''}{change}% vs last period
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56, ml: 2 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Sample data for charts
  const userActivityData = [
    { name: 'Mon', students: 45, teachers: 12, staff: 8 },
    { name: 'Tue', students: 52, teachers: 15, staff: 10 },
    { name: 'Wed', students: 48, teachers: 18, staff: 12 },
    { name: 'Thu', students: 61, teachers: 14, staff: 9 },
    { name: 'Fri', students: 55, teachers: 16, staff: 11 },
    { name: 'Sat', students: 35, teachers: 8, staff: 5 },
    { name: 'Sun', students: 28, teachers: 6, staff: 3 },
  ];

  const libraryUsageData = [
    { name: 'Computer Science', requests: 45, issued: 38 },
    { name: 'Engineering', requests: 35, issued: 30 },
    { name: 'Mathematics', requests: 28, issued: 25 },
    { name: 'Physics', requests: 22, issued: 18 },
    { name: 'Literature', requests: 18, issued: 15 },
  ];

  const storeUsageData = [
    { name: 'Cleaning', value: 35, color: '#3b82f6' },
    { name: 'Stationary', value: 28, color: '#10b981' },
    { name: 'Office Supplies', value: 20, color: '#f59e0b' },
    { name: 'Maintenance', value: 12, color: '#ef4444' },
    { name: 'Others', value: 5, color: '#8b5cf6' },
  ];

  const monthlyTrendsData = [
    { month: 'Jan', users: 120, books: 450, requests: 89 },
    { month: 'Feb', users: 135, books: 520, requests: 95 },
    { month: 'Mar', users: 142, books: 580, requests: 102 },
    { month: 'Apr', users: 158, books: 620, requests: 118 },
    { month: 'May', users: 165, books: 680, requests: 125 },
    { month: 'Jun', users: 178, books: 720, requests: 134 },
  ];

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
          Analytics & Reports
        </Typography>
        <Box display="flex" gap={1}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              label="Period"
            >
              <MenuItem value="7">Last 7 days</MenuItem>
              <MenuItem value="30">Last 30 days</MenuItem>
              <MenuItem value="90">Last 3 months</MenuItem>
              <MenuItem value="365">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAnalyticsData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ bgcolor: '#1e3a8a' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Active Users"
            value={analyticsData.totalUsers || 0}
            change={12}
            icon={<PeopleIcon />}
            color="#1e3a8a"
            subtitle="Across all roles"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Books Issued"
            value={analyticsData.booksIssued || 0}
            change={8}
            icon={<BookIcon />}
            color="#059669"
            subtitle="This period"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Store Requests"
            value={analyticsData.storeRequests || 0}
            change={-3}
            icon={<StoreIcon />}
            color="#d97706"
            subtitle="Fulfilled requests"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="System Usage"
            value={`${analyticsData.systemUsage || 0}%`}
            change={5}
            icon={<AnalyticsIcon />}
            color="#7c3aed"
            subtitle="Overall activity"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* User Activity Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Daily User Activity
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <ComposedChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Legend />
                <Bar dataKey="students" fill="#3b82f6" name="Students" />
                <Bar dataKey="teachers" fill="#10b981" name="Teachers" />
                <Bar dataKey="staff" fill="#f59e0b" name="Staff" />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Store Usage Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Store Category Usage
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={storeUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {storeUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Library Usage and Monthly Trends */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Library Usage by Category
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={libraryUsageData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Bar dataKey="requests" fill="#3b82f6" name="Requests" />
                <Bar dataKey="issued" fill="#10b981" name="Issued" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 350 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Monthly Growth Trends
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={monthlyTrendsData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: 'white'
                  }} 
                />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                <Area type="monotone" dataKey="books" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorBooks)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Performers Tables */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Most Active Users
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Activity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'John Doe', role: 'Student', activity: 45 },
                    { name: 'Jane Smith', role: 'Teacher', activity: 38 },
                    { name: 'Mike Johnson', role: 'Student', activity: 32 },
                    { name: 'Sarah Wilson', role: 'Teacher', activity: 28 },
                    { name: 'David Brown', role: 'Student', activity: 25 },
                  ].map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {user.role}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.activity} 
                          size="small" 
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Most Requested Books
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Book</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Requests</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { title: 'Data Structures', author: 'Cormen', requests: 28 },
                    { title: 'Operating Systems', author: 'Galvin', requests: 24 },
                    { title: 'Computer Networks', author: 'Tanenbaum', requests: 22 },
                    { title: 'Database Systems', author: 'Korth', requests: 19 },
                    { title: 'Software Engineering', author: 'Pressman', requests: 16 },
                  ].map((book, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {book.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            by {book.author}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={book.requests} 
                          size="small" 
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Most Requested Items
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Requests</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { name: 'A4 Paper', category: 'Stationary', requests: 35 },
                    { name: 'Whiteboard Markers', category: 'Stationary', requests: 28 },
                    { name: 'Cleaning Spray', category: 'Cleaning', requests: 22 },
                    { name: 'Printer Ink', category: 'Office', requests: 18 },
                    { name: 'Tissue Boxes', category: 'Cleaning', requests: 15 },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {item.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={item.requests} 
                          size="small" 
                          color="warning"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
