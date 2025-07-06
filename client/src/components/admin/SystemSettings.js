import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Backup as BackupIcon,
  Update as UpdateIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import axios from 'axios';

const SystemSettings = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'NSTI College Management System',
    systemEmail: 'admin@nsti.edu',
    maxBookIssueLimit: 5,
    bookReturnDays: 14,
    finePerDay: 5,
    enableNotifications: true,
    enableEmailAlerts: true,
    maintenanceMode: false,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableTwoFactor: false,
    autoLogoutTime: 60,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    overdueBookReminders: true,
    lowStockAlerts: true,
    newRequestNotifications: true,
    systemMaintenanceAlerts: true,
    emailFrequency: 'daily',
    smsNotifications: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/settings');
      const data = response.data.data || {};
      
      setGeneralSettings(prev => ({ ...prev, ...data.general }));
      setSecuritySettings(prev => ({ ...prev, ...data.security }));
      setNotificationSettings(prev => ({ ...prev, ...data.notifications }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      showSnackbar('Error fetching settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (type) => {
    try {
      let data = {};
      switch (type) {
        case 'general':
          data = { general: generalSettings };
          break;
        case 'security':
          data = { security: securitySettings };
          break;
        case 'notifications':
          data = { notifications: notificationSettings };
          break;
        default:
          return;
      }

      await axios.put('/api/admin/settings', data);
      showSnackbar('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Error saving settings', 'error');
    }
  };

  const handleBackup = async () => {
    try {
      const response = await axios.post('/api/admin/backup');
      showSnackbar('Backup created successfully', 'success');
    } catch (error) {
      console.error('Error creating backup:', error);
      showSnackbar('Error creating backup', 'error');
    }
  };

  const handleSystemUpdate = async () => {
    try {
      await axios.post('/api/admin/update');
      showSnackbar('System update initiated', 'info');
    } catch (error) {
      console.error('Error updating system:', error);
      showSnackbar('Error updating system', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  const SettingCard = ({ title, description, children }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
          System Settings
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchSettings}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<BackupIcon />}
            onClick={handleBackup}
            sx={{ bgcolor: '#059669' }}
          >
            Create Backup
          </Button>
        </Box>
      </Box>

      {/* System Status Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#10b981', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <CheckCircleIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                System Status
              </Typography>
              <Chip label="Online" color="success" size="small" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#3b82f6', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <SecurityIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Security Level
              </Typography>
              <Chip label="High" color="primary" size="small" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#f59e0b', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <BackupIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Last Backup
              </Typography>
              <Typography variant="body2" color="textSecondary">
                2 hours ago
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#8b5cf6', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <UpdateIcon />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Version
              </Typography>
              <Typography variant="body2" color="textSecondary">
                v2.1.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Settings Tabs */}
      <Paper>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="General" 
            icon={<SettingsIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Security" 
            icon={<SecurityIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Notifications" 
            icon={<NotificationsIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="System" 
            icon={<UpdateIcon />} 
            iconPosition="start"
          />
        </Tabs>

        {/* General Settings Tab */}
        <TabPanel value={currentTab} index={0}>
          <SettingCard
            title="System Information"
            description="Basic system configuration and display settings"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="System Name"
                  value={generalSettings.systemName}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    systemName: e.target.value
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="System Email"
                  type="email"
                  value={generalSettings.systemEmail}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    systemEmail: e.target.value
                  })}
                />
              </Grid>
            </Grid>
          </SettingCard>

          <SettingCard
            title="Library Settings"
            description="Configure library-specific rules and limits"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Max Book Issue Limit"
                  type="number"
                  value={generalSettings.maxBookIssueLimit}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    maxBookIssueLimit: parseInt(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Book Return Days"
                  type="number"
                  value={generalSettings.bookReturnDays}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    bookReturnDays: parseInt(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fine Per Day (₹)"
                  type="number"
                  value={generalSettings.finePerDay}
                  onChange={(e) => setGeneralSettings({
                    ...generalSettings,
                    finePerDay: parseInt(e.target.value)
                  })}
                />
              </Grid>
            </Grid>
          </SettingCard>

          <SettingCard
            title="System Features"
            description="Enable or disable system-wide features"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={generalSettings.enableNotifications}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        enableNotifications: e.target.checked
                      })}
                    />
                  }
                  label="Enable Notifications"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={generalSettings.enableEmailAlerts}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        enableEmailAlerts: e.target.checked
                      })}
                    />
                  }
                  label="Enable Email Alerts"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={generalSettings.maintenanceMode}
                      onChange={(e) => setGeneralSettings({
                        ...generalSettings,
                        maintenanceMode: e.target.checked
                      })}
                    />
                  }
                  label="Maintenance Mode"
                />
                {generalSettings.maintenanceMode && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Maintenance mode will restrict access to admin users only.
                  </Alert>
                )}
              </Grid>
            </Grid>
          </SettingCard>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => saveSettings('general')}
              sx={{ bgcolor: '#1e3a8a' }}
            >
              Save General Settings
            </Button>
          </Box>
        </TabPanel>

        {/* Security Settings Tab */}
        <TabPanel value={currentTab} index={1}>
          <SettingCard
            title="Password Policy"
            description="Configure password requirements and security rules"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Minimum Password Length"
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    passwordMinLength: parseInt(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Login Attempts"
                  type="number"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    maxLoginAttempts: parseInt(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.requireSpecialChars}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        requireSpecialChars: e.target.checked
                      })}
                    />
                  }
                  label="Require Special Characters in Password"
                />
              </Grid>
            </Grid>
          </SettingCard>

          <SettingCard
            title="Session Management"
            description="Configure user session and timeout settings"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    sessionTimeout: parseInt(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Auto Logout Time (minutes)"
                  type="number"
                  value={securitySettings.autoLogoutTime}
                  onChange={(e) => setSecuritySettings({
                    ...securitySettings,
                    autoLogoutTime: parseInt(e.target.value)
                  })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={securitySettings.enableTwoFactor}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        enableTwoFactor: e.target.checked
                      })}
                    />
                  }
                  label="Enable Two-Factor Authentication"
                />
              </Grid>
            </Grid>
          </SettingCard>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => saveSettings('security')}
              sx={{ bgcolor: '#dc2626' }}
            >
              Save Security Settings
            </Button>
          </Box>
        </TabPanel>

        {/* Notifications Settings Tab */}
        <TabPanel value={currentTab} index={2}>
          <SettingCard
            title="Alert Preferences"
            description="Configure when and how to receive system notifications"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.overdueBookReminders}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        overdueBookReminders: e.target.checked
                      })}
                    />
                  }
                  label="Overdue Book Reminders"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.lowStockAlerts}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        lowStockAlerts: e.target.checked
                      })}
                    />
                  }
                  label="Low Stock Alerts"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.newRequestNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        newRequestNotifications: e.target.checked
                      })}
                    />
                  }
                  label="New Request Notifications"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.systemMaintenanceAlerts}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        systemMaintenanceAlerts: e.target.checked
                      })}
                    />
                  }
                  label="System Maintenance Alerts"
                />
              </Grid>
            </Grid>
          </SettingCard>

          <SettingCard
            title="Communication Preferences"
            description="Choose how you want to receive notifications"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Email Frequency</InputLabel>
                  <Select
                    value={notificationSettings.emailFrequency}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      emailFrequency: e.target.value
                    })}
                    label="Email Frequency"
                  >
                    <MenuItem value="immediate">Immediate</MenuItem>
                    <MenuItem value="daily">Daily Digest</MenuItem>
                    <MenuItem value="weekly">Weekly Summary</MenuItem>
                    <MenuItem value="never">Never</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: e.target.checked
                      })}
                    />
                  }
                  label="SMS Notifications"
                />
              </Grid>
            </Grid>
          </SettingCard>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={() => saveSettings('notifications')}
              sx={{ bgcolor: '#f59e0b' }}
            >
              Save Notification Settings
            </Button>
          </Box>
        </TabPanel>

        {/* System Tab */}
        <TabPanel value={currentTab} index={3}>
          <SettingCard
            title="System Maintenance"
            description="Perform system maintenance tasks and updates"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<BackupIcon />}
                  onClick={handleBackup}
                  sx={{ mb: 1 }}
                >
                  Create System Backup
                </Button>
                <Typography variant="caption" color="textSecondary">
                  Last backup: 2 hours ago
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<UpdateIcon />}
                  onClick={handleSystemUpdate}
                  sx={{ mb: 1 }}
                >
                  Check for Updates
                </Button>
                <Typography variant="caption" color="textSecondary">
                  Current version: v2.1.0
                </Typography>
              </Grid>
            </Grid>
          </SettingCard>

          <SettingCard
            title="Database Management"
            description="Manage database operations and maintenance"
          >
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Database operations can affect system performance. Please perform during maintenance windows.
              </Typography>
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="warning"
                >
                  Optimize Database
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="info"
                >
                  Clear Cache
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                >
                  Reset Logs
                </Button>
              </Grid>
            </Grid>
          </SettingCard>

          <SettingCard
            title="System Information"
            description="View detailed system information and statistics"
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Server Uptime:</strong> 15 days, 8 hours
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Database Size:</strong> 2.4 GB
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Active Users:</strong> 245
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Memory Usage:</strong> 68%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>CPU Usage:</strong> 23%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Disk Space:</strong> 45% used
                </Typography>
              </Grid>
            </Grid>
          </SettingCard>
        </TabPanel>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
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

export default SystemSettings;
