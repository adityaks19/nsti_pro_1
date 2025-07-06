import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Badge,
  LinearProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Grade as GradeIcon,
  TrendingUp as TrendingUpIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock data - replace with API calls
  useEffect(() => {
    const mockStudents = [
      {
        id: 1,
        name: 'Rahul Kumar Singh',
        rollNumber: 'NSTI2024001',
        email: 'rahul.kumar@nsti.edu',
        phone: '+91 9876543210',
        department: 'Computer Science & Engineering',
        course: 'Full Stack Web Development',
        semester: 4,
        status: 'Active',
        enrollmentDate: '2024-01-15',
        address: 'New Delhi, India',
        grade: 'A',
        attendance: 95,
        progress: 85,
        fatherName: 'Mr. Suresh Kumar Singh',
        motherName: 'Mrs. Sunita Singh',
        dateOfBirth: '2002-05-15',
        bloodGroup: 'B+',
        category: 'General',
        admissionNumber: 'ADM2024001'
      },
      {
        id: 2,
        name: 'Priya Sharma',
        rollNumber: 'NSTI2024002',
        email: 'priya.sharma@nsti.edu',
        phone: '+91 9876543211',
        department: 'Information Technology',
        course: 'Mobile App Development',
        semester: 4,
        status: 'Active',
        enrollmentDate: '2024-01-14',
        address: 'Mumbai, Maharashtra',
        grade: 'A+',
        attendance: 98,
        progress: 92,
        fatherName: 'Mr. Rajesh Sharma',
        motherName: 'Mrs. Meera Sharma',
        dateOfBirth: '2002-08-22',
        bloodGroup: 'A+',
        category: 'General',
        admissionNumber: 'ADM2024002'
      },
      {
        id: 3,
        name: 'Amit Singh Rajput',
        rollNumber: 'NSTI2024003',
        email: 'amit.singh@nsti.edu',
        phone: '+91 9876543212',
        department: 'Electronics & Communication',
        course: 'Embedded Systems Design',
        semester: 3,
        status: 'Active',
        enrollmentDate: '2024-01-13',
        address: 'Bangalore, Karnataka',
        grade: 'B+',
        attendance: 88,
        progress: 78,
        fatherName: 'Mr. Vikram Singh Rajput',
        motherName: 'Mrs. Kavita Rajput',
        dateOfBirth: '2002-12-10',
        bloodGroup: 'O+',
        category: 'OBC',
        admissionNumber: 'ADM2024003'
      },
      {
        id: 4,
        name: 'Sneha Patel',
        rollNumber: 'NSTI2024004',
        email: 'sneha.patel@nsti.edu',
        phone: '+91 9876543213',
        department: 'Mechanical Engineering',
        course: 'CAD/CAM Design',
        semester: 2,
        status: 'Active',
        enrollmentDate: '2024-01-12',
        address: 'Pune, Maharashtra',
        grade: 'A',
        attendance: 92,
        progress: 88,
        fatherName: 'Mr. Kiran Patel',
        motherName: 'Mrs. Nisha Patel',
        dateOfBirth: '2003-03-18',
        bloodGroup: 'AB+',
        category: 'General',
        admissionNumber: 'ADM2024004'
      },
      {
        id: 5,
        name: 'Vikash Kumar',
        rollNumber: 'NSTI2024005',
        email: 'vikash.kumar@nsti.edu',
        phone: '+91 9876543214',
        department: 'Electrical Engineering',
        course: 'Power Systems & Control',
        semester: 3,
        status: 'Active',
        enrollmentDate: '2024-01-11',
        address: 'Chennai, Tamil Nadu',
        grade: 'B',
        attendance: 85,
        progress: 75,
        fatherName: 'Mr. Ramesh Kumar',
        motherName: 'Mrs. Sita Devi',
        dateOfBirth: '2002-11-25',
        bloodGroup: 'B-',
        category: 'SC',
        admissionNumber: 'ADM2024005'
      }
    ];
    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDepartment) {
      filtered = filtered.filter(student => student.department === filterDepartment);
    }

    if (filterStatus) {
      filtered = filtered.filter(student => student.status === filterStatus);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, filterDepartment, filterStatus, students]);

  const handleAddStudent = () => {
    setDialogMode('add');
    setSelectedStudent(null);
    setOpenDialog(true);
  };

  const handleEditStudent = (student) => {
    setDialogMode('edit');
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleViewStudent = (student) => {
    setDialogMode('view');
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(s => s.id !== studentId));
      setSnackbar({ open: true, message: 'Student deleted successfully!', severity: 'success' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
  };

  const handleSaveStudent = () => {
    // Add save logic here
    setOpenDialog(false);
    setSnackbar({ open: true, message: 'Student saved successfully!', severity: 'success' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'error';
      case 'Suspended': return 'warning';
      default: return 'default';
    }
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+': return '#4caf50';
      case 'A': return '#8bc34a';
      case 'B+': return '#ffeb3b';
      case 'B': return '#ff9800';
      default: return '#f44336';
    }
  };

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Civil Engineering'
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Student Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage student enrollments, profiles, and academic progress
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddStudent}
                  sx={{ bgcolor: '#1a237e', borderRadius: 2 }}
                >
                  Add Student
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ borderColor: '#1a237e', color: '#1a237e', borderRadius: 2 }}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Student</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Course & Progress</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Performance</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 48, height: 48 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {student.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {student.rollNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.department}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        {student.course}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="caption" sx={{ mr: 1 }}>
                          Progress: {student.progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={student.progress} 
                        sx={{ height: 6, borderRadius: 3 }}
                        color={student.progress >= 80 ? 'success' : student.progress >= 60 ? 'warning' : 'error'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip 
                          label={`Grade: ${student.grade}`} 
                          size="small" 
                          sx={{ 
                            bgcolor: getGradeColor(student.grade), 
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Attendance: {student.attendance}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={student.status} 
                        size="small" 
                        color={getStatusColor(student.status)}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewStudent(student)}
                            sx={{ color: '#1a237e' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Student">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditStudent(student)}
                            sx={{ color: '#4caf50' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Student">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteStudent(student.id)}
                            sx={{ color: '#f44336' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#1a237e',
          '&:hover': { bgcolor: '#0d47a1' }
        }}
        onClick={handleAddStudent}
      >
        <AddIcon />
      </Fab>

      {/* Student Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#1a237e', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1 }} />
            {dialogMode === 'add' ? 'Add New Student' : 
             dialogMode === 'edit' ? 'Edit Student' : 'Student Details'}
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                variant="outlined"
                defaultValue={selectedStudent?.name || ''}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Roll Number"
                variant="outlined"
                defaultValue={selectedStudent?.rollNumber || ''}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                variant="outlined"
                defaultValue={selectedStudent?.email || ''}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                variant="outlined"
                defaultValue={selectedStudent?.phone || ''}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select 
                  label="Department"
                  defaultValue={selectedStudent?.department || ''}
                  disabled={dialogMode === 'view'}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Course"
                variant="outlined"
                defaultValue={selectedStudent?.course || ''}
                disabled={dialogMode === 'view'}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Father's Name"
                variant="outlined"
                defaultValue={selectedStudent?.fatherName || ''}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mother's Name"
                variant="outlined"
                defaultValue={selectedStudent?.motherName || ''}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                variant="outlined"
                defaultValue={selectedStudent?.dateOfBirth || ''}
                disabled={dialogMode === 'view'}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Blood Group"
                variant="outlined"
                defaultValue={selectedStudent?.bloodGroup || ''}
                disabled={dialogMode === 'view'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                variant="outlined"
                defaultValue={selectedStudent?.address || ''}
                disabled={dialogMode === 'view'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        {dialogMode !== 'view' && (
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleCloseDialog}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />}
              onClick={handleSaveStudent}
              sx={{ bgcolor: '#1a237e' }}
            >
              {dialogMode === 'add' ? 'Add Student' : 'Save Changes'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentManagement;
