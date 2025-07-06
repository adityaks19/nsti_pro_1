import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Tab,
  Tabs,
  Badge,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Class as ClassIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDialog, setStudentDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStudents = [
        {
          id: 1,
          name: 'Aditya Sharma',
          studentId: 'STU2025040',
          email: 'aditya.sharma@nsti.edu',
          phone: '9876543215',
          course: 'Diploma in Computer Engineering',
          semester: 4,
          department: 'Computer Science',
          status: 'Active',
          attendance: 85,
          performance: 'Good',
          address: 'NSTI Campus, Hostel Block A',
          enrollmentDate: '2023-08-15',
          leaveApplications: 2,
          bookRequests: 5,
          fines: 0
        },
        {
          id: 2,
          name: 'Priya Singh',
          studentId: 'STU2025041',
          email: 'priya.singh@nsti.edu',
          phone: '9876543216',
          course: 'Diploma in Computer Engineering',
          semester: 4,
          department: 'Computer Science',
          status: 'Active',
          attendance: 92,
          performance: 'Excellent',
          address: 'NSTI Campus, Hostel Block B',
          enrollmentDate: '2023-08-15',
          leaveApplications: 1,
          bookRequests: 8,
          fines: 0
        },
        {
          id: 3,
          name: 'Rahul Kumar',
          studentId: 'STU2025042',
          email: 'rahul.kumar@nsti.edu',
          phone: '9876543217',
          course: 'Diploma in Computer Engineering',
          semester: 4,
          department: 'Computer Science',
          status: 'Active',
          attendance: 78,
          performance: 'Average',
          address: 'NSTI Campus, Hostel Block A',
          enrollmentDate: '2023-08-15',
          leaveApplications: 3,
          bookRequests: 4,
          fines: 0
        },
        {
          id: 4,
          name: 'Sneha Patel',
          studentId: 'STU2025043',
          email: 'sneha.patel@nsti.edu',
          phone: '9876543218',
          course: 'Diploma in Computer Engineering',
          semester: 4,
          department: 'Computer Science',
          status: 'Active',
          attendance: 45,
          performance: 'Good',
          address: 'NSTI Campus, Hostel Block B',
          enrollmentDate: '2023-08-15',
          leaveApplications: 1,
          bookRequests: 6,
          fines: 0
        },
        {
          id: 5,
          name: 'Vikash Yadav',
          studentId: 'STU2025044',
          email: 'vikash.yadav@nsti.edu',
          phone: '9876543219',
          course: 'Diploma in Computer Engineering',
          semester: 4,
          department: 'Computer Science',
          status: 'Active',
          attendance: 95,
          performance: 'Excellent',
          address: 'NSTI Campus, Hostel Block A',
          enrollmentDate: '2023-08-15',
          leaveApplications: 0,
          bookRequests: 7,
          fines: 0
        }
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#4caf50';
      case 'Inactive': return '#f44336';
      case 'Suspended': return '#ff9800';
      default: return '#757575';
    }
  };

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case 'Excellent': return '#4caf50';
      case 'Good': return '#2196f3';
      case 'Average': return '#ff9800';
      case 'Poor': return '#f44336';
      default: return '#757575';
    }
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 90) return '#4caf50';
    if (attendance >= 75) return '#2196f3';
    if (attendance >= 60) return '#ff9800';
    return '#f44336';
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStudents = filteredStudents.filter(s => s.status === 'Active');
  const studentsWithFines = filteredStudents.filter(s => s.fines > 0);
  const lowAttendanceStudents = filteredStudents.filter(s => s.attendance < 75);

  const getTabData = () => {
    switch (tabValue) {
      case 0: return filteredStudents;
      case 1: return activeStudents;
      case 2: return studentsWithFines;
      case 3: return lowAttendanceStudents;
      default: return filteredStudents;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
        👥 My Students
      </Typography>

      {/* Search Bar */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search students by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)} 
          sx={{ px: 3, pt: 2 }}
        >
          <Tab label={`All Students (${filteredStudents.length})`} />
          <Tab label={`Active (${activeStudents.length})`} />
          <Tab label={
            <Badge badgeContent={studentsWithFines.length} color="error">
              With Fines
            </Badge>
          } />
          <Tab label={
            <Badge badgeContent={lowAttendanceStudents.length} color="warning">
              Low Attendance
            </Badge>
          } />
        </Tabs>
      </Card>

      {/* Students Grid */}
      <Grid container spacing={3}>
        {getTabData().map((student) => (
          <Grid item xs={12} sm={6} md={4} key={student.id}>
            <Card 
              sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(26, 35, 126, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Student Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: '#1a237e', 
                      width: 56, 
                      height: 56, 
                      mr: 2,
                      fontSize: '1.5rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {student.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {student.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {student.studentId}
                    </Typography>
                    <Chip 
                      label={student.status} 
                      size="small" 
                      sx={{ 
                        bgcolor: getStatusColor(student.status),
                        color: 'white',
                        fontWeight: 'bold',
                        mt: 0.5
                      }} 
                    />
                  </Box>
                </Box>

                {/* Student Details */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      {student.email}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SchoolIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      Semester {student.semester}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, mr: 1, color: '#666' }} />
                    <Typography variant="body2" color="text.secondary">
                      {student.phone}
                    </Typography>
                  </Box>
                </Box>

                {/* Performance Metrics */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Attendance
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: getAttendanceColor(student.attendance)
                      }}
                    >
                      {student.attendance}%
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      Performance
                    </Typography>
                    <Chip 
                      label={student.performance} 
                      size="small" 
                      sx={{ 
                        bgcolor: getPerformanceColor(student.performance),
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>

                  {student.fines > 0 && (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Outstanding Fines: ₹{student.fines}
                      </Typography>
                    </Alert>
                  )}
                </Box>

                {/* Quick Stats */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1565c0' }}>
                        {student.leaveApplications}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Leave Apps
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#e8f5e8' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {student.bookRequests}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Books
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1, textAlign: 'center', bgcolor: '#fff3e0' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                        ₹{student.fines}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Fines
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Action Button */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ViewIcon />}
                  onClick={() => {
                    setSelectedStudent(student);
                    setStudentDialog(true);
                  }}
                  sx={{
                    bgcolor: '#1a237e',
                    borderRadius: 2,
                    py: 1,
                    '&:hover': { bgcolor: '#0d47a1' }
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Student Details Dialog */}
      <Dialog 
        open={studentDialog} 
        onClose={() => setStudentDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          Student Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedStudent && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#1a237e', 
                        width: 100, 
                        height: 100, 
                        mx: 'auto',
                        mb: 2,
                        fontSize: '2rem'
                      }}
                    >
                      {selectedStudent.name.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {selectedStudent.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedStudent.studentId}
                    </Typography>
                    <Chip 
                      label={selectedStudent.status} 
                      sx={{ 
                        bgcolor: getStatusColor(selectedStudent.status),
                        color: 'white',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e' }}>
                    Personal Information
                  </Typography>
                  
                  <List>
                    <ListItem>
                      <ListItemIcon><EmailIcon /></ListItemIcon>
                      <ListItemText primary="Email" secondary={selectedStudent.email} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PhoneIcon /></ListItemIcon>
                      <ListItemText primary="Phone" secondary={selectedStudent.phone} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><SchoolIcon /></ListItemIcon>
                      <ListItemText primary="Course" secondary={selectedStudent.course} />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><ClassIcon /></ListItemIcon>
                      <ListItemText primary="Semester" secondary={`Semester ${selectedStudent.semester}`} />
                    </ListItem>
                  </List>

                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1a237e', mt: 3 }}>
                    Academic Performance
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ 
                          fontWeight: 'bold', 
                          color: getAttendanceColor(selectedStudent.attendance),
                          mb: 1 
                        }}>
                          {selectedStudent.attendance}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Attendance
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Chip 
                          label={selectedStudent.performance} 
                          sx={{ 
                            bgcolor: getPerformanceColor(selectedStudent.performance),
                            color: 'white',
                            fontWeight: 'bold',
                            mb: 1
                          }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          Performance
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setStudentDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyStudents;
