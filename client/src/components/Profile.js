import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  const getRoleColor = (role) => {
    const colors = {
      admin: '#dc2626',
      librarian: '#059669',
      store: '#d97706',
      to: '#7c3aed',
      teacher: '#2563eb',
      student: '#0891b2',
    };
    return colors[role] || '#6b7280';
  };

  const getRoleDisplayName = (role) => {
    const names = {
      admin: 'Administrator',
      librarian: 'Librarian',
      store: 'Store Manager',
      to: 'Training Officer',
      teacher: 'Teacher',
      student: 'Student',
    };
    return names[role] || role;
  };

  return (
    <Box className="fade-in">
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        My Profile
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={4}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: getRoleColor(user?.role),
              fontSize: '2rem',
              mr: 3,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h2" gutterBottom>
              {user?.name}
            </Typography>
            <Chip
              label={getRoleDisplayName(user?.role)}
              sx={{
                bgcolor: getRoleColor(user?.role),
                color: 'white',
                fontWeight: 600,
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Personal Information
            </Typography>

            <Box display="flex" alignItems="center" mb={2}>
              <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Full Name
                </Typography>
                <Typography variant="body1">{user?.name}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Email Address
                </Typography>
                <Typography variant="body1">{user?.email}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" mb={2}>
              <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">{user?.phone}</Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="flex-start" mb={2}>
              <HomeIcon sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Address
                </Typography>
                <Typography variant="body1">{user?.address}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              {user?.role === 'student' ? 'Academic Information' : 'Professional Information'}
            </Typography>

            <Box display="flex" alignItems="center" mb={2}>
              <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Role
                </Typography>
                <Typography variant="body1">{getRoleDisplayName(user?.role)}</Typography>
              </Box>
            </Box>

            {user?.studentId && (
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Student ID
                  </Typography>
                  <Typography variant="body1">{user.studentId}</Typography>
                </Box>
              </Box>
            )}

            {user?.employeeId && (
              <Box display="flex" alignItems="center" mb={2}>
                <WorkIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Employee ID
                  </Typography>
                  <Typography variant="body1">{user.employeeId}</Typography>
                </Box>
              </Box>
            )}

            {user?.department && (
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Department
                  </Typography>
                  <Typography variant="body1">{user.department}</Typography>
                </Box>
              </Box>
            )}

            {user?.course && (
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Course
                  </Typography>
                  <Typography variant="body1">{user.course}</Typography>
                </Box>
              </Box>
            )}

            {user?.semester && (
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Semester
                  </Typography>
                  <Typography variant="body1">{user.semester}</Typography>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
