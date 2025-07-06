import React from 'react';
import { Typography, Box, Paper } from '@mui/material';

const UserManagement = () => {
  return (
    <Box className="fade-in">
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 4 }}>
        User Management
      </Typography>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="textSecondary">
          User Management Component
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          This component will handle user CRUD operations for admins and TOs.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UserManagement;
