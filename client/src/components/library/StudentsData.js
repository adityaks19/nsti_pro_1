import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
  Paper,
  Divider,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Badge,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Book as BookIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as FineIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
// Removed LibraryLayout - using main DashboardLayout instead

const StudentsData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'studentId', label: 'Student ID' },
    { value: 'course', label: 'Course' },
    { value: 'year', label: 'Year' },
    { value: 'createdAt', label: 'Registration Date' }
  ];

  // Fetch students from API
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        role: 'student',
        page: currentPage,
        limit: studentsPerPage,
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`/api/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setStudents(response.data.data || []);
        setTotalPages(Math.ceil((response.data.count || 0) / studentsPerPage));
        setTotalStudents(response.data.count || 0);
      }
    } catch (error) {
      console.error('Fetch students error:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to fetch students data', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage]);

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchStudents();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (stats) => {
    if (stats.overdueBooks > 0) return 'error';
    if (stats.pendingFines > 0) return 'warning';
    if (stats.issuedBooks > 0) return 'info';
    return 'success';
  };

  const getStatusText = (stats) => {
    if (stats.overdueBooks > 0) return 'Has Overdue Books';
    if (stats.pendingFines > 0) return 'Has Pending Fines';
    if (stats.issuedBooks > 0) return 'Active Borrower';
    return 'Good Standing';
  };

  const renderStudentDialog = () => {
    if (!selectedStudent) return null;

    const stats = selectedStudent.stats;

    return (
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedStudent.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStudent.studentId} | {selectedStudent.course}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedStudent.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Phone:</strong> {selectedStudent.phone || 'Not provided'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2">
                  <strong>Course:</strong> {selectedStudent.course}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Year:</strong> {selectedStudent.year} | <strong>Section:</strong> {selectedStudent.section}
              </Typography>
              <Typography variant="body2">
                <strong>Registered:</strong> {formatDate(selectedStudent.createdAt)}
              </Typography>
            </Grid>

            {/* Library Statistics */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ color: '#1a237e', fontWeight: 'bold', mt: 2 }}>
                Library Activity
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {stats.totalRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Requests
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {stats.pendingRequests}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Requests
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                      {stats.issuedBooks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Currently Issued
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="error.main" sx={{ fontWeight: 'bold' }}>
                      {stats.overdueBooks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue Books
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Fine Information */}
            {stats.totalFines > 0 && (
              <Grid item xs={12}>
                <Alert 
                  severity={stats.pendingFines > 0 ? "warning" : "info"}
                  sx={{ mt: 2 }}
                >
                  <Typography variant="body2">
                    <strong>Total Fines:</strong> ₹{stats.totalFines} | 
                    <strong> Pending:</strong> ₹{stats.pendingFines}
                  </Typography>
                </Alert>
              </Grid>
            )}

            {/* Status */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  <strong>Status:</strong>
                </Typography>
                <Chip
                  label={getStatusText(stats)}
                  color={getStatusColor(stats)}
                  icon={stats.overdueBooks > 0 ? <WarningIcon /> : <CheckCircleIcon />}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Students Data
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View student information and their library activity (Read-only access)
          </Typography>
        </Box>

        {/* Search and Controls */}
        <Card sx={{ mb: 3, borderRadius: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by name, student ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                    sx={{ borderRadius: 0 }}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchStudents}
                    sx={{ borderRadius: 0 }}
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    sx={{ borderRadius: 0 }}
                    disabled
                  >
                    Export
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card sx={{ borderRadius: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading students data...</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student Details</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Course Information</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Library Activity</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {student.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {student.studentId}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="text.secondary">
                                {student.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {student.course}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Year: {student.year} | Section: {student.section}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            Registered: {formatDate(student.createdAt)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Total Requests
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {student.stats.totalRequests}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Currently Issued
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                {student.stats.issuedBooks}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Pending
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                {student.stats.pendingRequests}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="caption" color="text.secondary">
                                Overdue
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                {student.stats.overdueBooks}
                              </Typography>
                            </Grid>
                          </Grid>
                        </TableCell>
                        
                        <TableCell>
                          <Chip
                            label={getStatusText(student.stats)}
                            color={getStatusColor(student.stats)}
                            size="small"
                            icon={student.stats.overdueBooks > 0 ? <WarningIcon /> : <CheckCircleIcon />}
                          />
                          {student.stats.totalFines > 0 && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={`Fine: ₹${student.stats.pendingFines}`}
                                size="small"
                                color="error"
                                icon={<FineIcon />}
                              />
                            </Box>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewStudent(student)}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(event, value) => setCurrentPage(value)}
                  color="primary"
                />
              </Box>
            )}

            {/* No data message */}
            {!loading && students.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  No students found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card sx={{ mt: 3, borderRadius: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Students
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant="body2" color="text.secondary">
                  This page provides read-only access to student information and their library activity. 
                  As a librarian, you can view student details, their borrowing history, and current status 
                  to better assist them with their library needs.
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Student Details Dialog */}
        {renderStudentDialog()}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 0 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default StudentsData;
