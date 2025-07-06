import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import StoreItems from '../store/StoreItems';
import StoreRequestsTracker from '../store/StoreRequestsTracker';

const StoreRequests = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
          <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Store Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Browse store items and manage your requests
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              minHeight: 70,
              fontSize: '1rem',
              fontWeight: 600,
            }
          }}
        >
          <Tab 
            icon={<InventoryIcon />} 
            label="Browse Items"
            iconPosition="start"
            sx={{ 
              '&.Mui-selected': { 
                color: '#1976d2',
                bgcolor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          />
          <Tab 
            icon={<AssignmentIcon />} 
            label="My Requests"
            iconPosition="start"
            sx={{ 
              '&.Mui-selected': { 
                color: '#1976d2',
                bgcolor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box>
        {tabValue === 0 && <StoreItems />}
        {tabValue === 1 && <StoreRequestsTracker />}
      </Box>
    </Box>
  );
};

export default StoreRequests;
