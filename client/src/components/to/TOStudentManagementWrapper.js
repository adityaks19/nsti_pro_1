import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import StudentManagement from './StudentManagement';

const TOStudentManagementWrapper = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon sx={{ fontSize: 32, color: '#7c3aed', mr: 2 }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              Student Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage student records, enrollment, and academic information
            </Typography>
          </Box>
        </Box>
        
        <StudentManagement />
      </Paper>
    </Box>
  );
};

export default TOStudentManagementWrapper;
