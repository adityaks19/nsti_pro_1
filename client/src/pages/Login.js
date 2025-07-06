import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../pages/dashboard.jpg';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  CircularProgress,
  Divider,
  Link,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  School as SchoolIcon,
  Security,
  CheckCircle,
  Announcement,
  Event,
  TrendingUp,
  PersonAdd,
  Refresh,
  Phone,
  Home,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [newStudentOpen, setNewStudentOpen] = useState(false);
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
  });

  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
    semester: '',
    address: '',
    password: '',
  });

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Generate random captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaValue(result);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Latest updates for scrolling news
  const latestUpdates = [
    "New Digital Management System Launch - Advanced college management system with integrated modules now live",
    "Enhanced Security Features - Role-based access control and advanced authentication systems implemented",
    "Mobile-Responsive Interface - Access your dashboard seamlessly across all devices",
    "Digital Library System - New online book management and request system available",
    "Smart Inventory Management - Real-time store management with automated alerts",
    "Student Portal Enhancement - Improved user experience with new dashboard features",
  ];

  // Auto-scroll updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUpdateIndex((prev) => (prev + 1) % latestUpdates.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [latestUpdates.length]);

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Validate captcha
    if (captchaInput !== captchaValue) {
      setCaptchaError(true);
      generateCaptcha();
      return;
    }

    setLoading(true);
    const result = await login(loginData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      generateCaptcha(); // Regenerate captcha on failed login
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = () => {
    setForgotPasswordOpen(true);
  };

  const handleNewStudent = () => {
    setNewStudentOpen(true);
  };

  const handleForgotPasswordSubmit = () => {
    // Handle forgot password logic here
    console.log('Forgot password for:', forgotPasswordData.email);
    setForgotPasswordOpen(false);
    setForgotPasswordData({ email: '' });
  };

  const handleNewStudentSubmit = () => {
    // Handle new student registration logic here
    console.log('New student registration:', newStudentData);
    setNewStudentOpen(false);
    setNewStudentData({
      name: '',
      email: '',
      phone: '',
      course: '',
      semester: '',
      address: '',
      password: '',
    });
  };

  // Demo users for quick access
  const demoUsers = [
    { email: 'admin@nsti.edu', password: 'admin123', role: 'Admin' },
    { email: 'librarian@nsti.edu', password: 'lib123', role: 'Librarian' },
    { email: 'store@nsti.edu', password: 'store123', role: 'Store Manager' },
    { email: 'to@nsti.edu', password: 'to123456', role: 'Training Officer' },
    { email: 'teacher@nsti.edu', password: 'teacher123', role: 'Teacher' },
    { email: 'student@nsti.edu', password: 'student123', role: 'Student' },
  ];

  const handleDemoLogin = async (email, password) => {
    setLoading(true);
    const result = await login({ email, password });
    if (result.success) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        
        minHeight: '100vh',
       background: `
  linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
  url(${backgroundImage})
`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Welcome Banner */}
      <Box
        sx={{
          bgcolor: '#1976d2',
          color: 'white',
          py: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            animation: 'scroll-left 20s linear infinite',
            whiteSpace: 'nowrap',
            '@keyframes scroll-left': {
              '0%': { transform: 'translateX(100%)' },
              '100%': { transform: 'translateX(-100%)' },
            },
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, px: 4 }}>
            🎓 Welcome to NSTI Dehradun - National Skill Training Institute - Premier Technical Education Hub 🎓
          </Typography>
        </Box>
      </Box>

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
            <Typography variant="h6">Authenticating...</Typography>
          </Box>
        </Box>
      )}

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ flex: 1, py: 4 }}>
        <Grid container spacing={3} sx={{ height: '100%' ,display:"flex" }}>
          {/* Left Side - About NSTI (top) + Latest Updates (bottom) */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '600px',width:"800px", paddingLeft:"300px"  }}>
              
              {/* About NSTI Section - Top Half */}
              <Card
                sx={{
                  flex: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ fontSize: 35, color: '#1976d2', mr: 2 }} />
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#1976d2',
                        fontSize: { xs: '1.4rem', md: '1.6rem' }
                      }}
                    >
                      About NSTI
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      lineHeight: 1.5, 
                      color: '#333',
                      fontSize: '0.9rem',
                      mb: 2,
                      flex: 1
                    }}
                  >
                    National Skill Training Institute (NSTI) Dehradun is a premier government institution 
                    dedicated to providing world-class technical education and skill development programs. 
                    Established with the vision of creating skilled professionals for India's growing economy.
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#4caf50', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                        Government Certified
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#4caf50', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                        Industry Recognized
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle sx={{ color: '#4caf50', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#666', fontSize: '0.8rem' }}>
                        Modern Infrastructure
                      </Typography>
                    </Box>
                  </Box>

                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#666',
                      fontStyle: 'italic',
                      borderLeft: '3px solid #1976d2',
                      pl: 2,
                      py: 1,
                      bgcolor: '#f5f5f5',
                      borderRadius: 1,
                      fontSize: '0.8rem'
                    }}
                  >
                    "Empowering students with cutting-edge technology and comprehensive skill development 
                    programs to meet the demands of modern industry."
                  </Typography>
                </CardContent>
              </Card>

              {/* Latest Updates Section - Bottom Half */}
              <Card
                sx={{
                  flex: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Announcement sx={{ fontSize: 35, color: '#ff9800', mr: 2 }} />
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#ff9800',
                        fontSize: { xs: '1.4rem', md: '1.6rem' }
                      }}
                    >
                      Latest Updates
                    </Typography>
                  </Box>

                  {/* Scrolling News Container */}
                  <Box 
                    sx={{ 
                      flex: 1,
                      overflow: 'hidden',
                      position: 'relative',
                      border: '2px solid #e0e0e0',
                      borderRadius: 2,
                      bgcolor: '#fafafa'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        animation: 'scroll-up 15s linear infinite',
                        '@keyframes scroll-up': {
                          '0%': { transform: 'translateY(100%)' },
                          '100%': { transform: 'translateY(-100%)' },
                        },
                      }}
                    >
                      {latestUpdates.map((update, index) => (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            borderBottom: '1px solid #e0e0e0',
                            minHeight: '60px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#333',
                              lineHeight: 1.4,
                              fontSize: '0.85rem'
                            }}
                          >
                            {update}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic', fontSize: '0.75rem' }}>
                      📢 Live Updates - Stay Connected
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Right Side - Secure Login Portal (Full Height) */}
          <Grid item xs={12} lg={6} sx={{
            width:"650px",margin:"auto"  ,paddingRight:"200px"
          }}>
            <Paper
              elevation={24}
              sx={{
                height: '600px',
                p: 4,
                borderRadius: 4,
                bgcolor: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                
                },
              }}
            >
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: '#1976d2',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 6px 20px rgba(25, 118, 210, 0.3)',
                  }}
                >
                  <Security sx={{ fontSize: 30, color: 'white' }} />
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1976d2',
                    mb: 1,
                    fontSize: { xs: '1.5rem', md: '1.8rem' }
                  }}
                >
                  Secure Login Portal
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    fontSize: '0.9rem'
                  }}
                >
                  Access your NSTI account
                </Typography>
              </Box>

              {/* Login Form */}
              <Box component="form" onSubmit={handleLoginSubmit} sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#1976d2', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  size="small"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#1976d2', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                />

                {/* Captcha */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box
                      sx={{
                        bgcolor: '#f5f5f5',
                        border: '2px solid #ddd',
                        borderRadius: 1,
                        p: 1,
                        fontFamily: 'monospace',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        letterSpacing: 2,
                        textAlign: 'center',
                        minWidth: 100,
                        textDecoration: 'line-through',
                        color: '#333',
                      }}
                    >
                      {captchaValue}
                    </Box>
                    <IconButton onClick={generateCaptcha} size="small">
                      <Refresh />
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    label="Enter Captcha"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    required
                    size="small"
                    error={captchaError}
                    helperText={captchaError ? 'Invalid captcha. Please try again.' : ''}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="medium"
                  disabled={loading}
                  sx={{ 
                    mb: 2,
                    height: 45,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    bgcolor: '#1976d2',
                    boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                    '&:hover': {
                      bgcolor: '#1565c0',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <>
                      <LoginIcon sx={{ mr: 1, fontSize: 20 }} />
                      Sign In
                    </>
                  )}
                </Button>

                {/* Links */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleForgotPassword}
                    sx={{ 
                      color: '#1976d2', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    Forgot Password?
                  </Link>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleNewStudent}
                    sx={{ 
                      color: '#1976d2', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    New Student?
                  </Link>
                </Box>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="caption" sx={{ color: '#666', px: 1 }}>
                    Quick Demo Access
                  </Typography>
                </Divider>

                {/* Demo Users */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                  {demoUsers.map((user, index) => (
                    <Button
                      key={index}
                      variant="outlined"
                      size="small"
                      onClick={() => handleDemoLogin(user.email, user.password)}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.7rem',
                        borderColor: '#1976d2',
                        color: '#1976d2',
                        minWidth: 'auto',
                        px: 1,
                        py: 0.5,
                        '&:hover': {
                          bgcolor: '#1976d2',
                          color: 'white',
                        },
                      }}
                    >
                      {user.role}
                    </Button>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={() => setForgotPasswordOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            Forgot Password
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            Enter your email address to reset your password
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={forgotPasswordData.email}
            onChange={(e) => setForgotPasswordData({ email: e.target.value })}
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email sx={{ color: '#1976d2' }} />
                </InputAdornment>
              ),
            }}
          />
          <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
            We'll send you a password reset link to your email address.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3 }}>
          <Button 
            onClick={() => setForgotPasswordOpen(false)}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleForgotPasswordSubmit}
            variant="contained"
            sx={{ 
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Student Registration Dialog */}
      <Dialog 
        open={newStudentOpen} 
        onClose={() => setNewStudentOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
            New Student Registration
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
            Create your NSTI student account
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={newStudentData.name}
                onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={newStudentData.email}
                onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={newStudentData.phone}
                onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Course</InputLabel>
                <Select
                  value={newStudentData.course}
                  onChange={(e) => setNewStudentData({ ...newStudentData, course: e.target.value })}
                  label="Course"
                >
                  <MenuItem value="Computer Science">CSA</MenuItem>
                  <MenuItem value="Electronics">Electronics</MenuItem>
                  <MenuItem value="Mechanical">Electronics and Mechanics</MenuItem>
                  <MenuItem value="Civil">CHNM</MenuItem>
                  <MenuItem value="Electrical">Welder</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Semester</InputLabel>
                <Select
                  value={newStudentData.semester}
                  onChange={(e) => setNewStudentData({ ...newStudentData, semester: e.target.value })}
                  label="Semester"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <MenuItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid> */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newStudentData.password}
                onChange={(e) => setNewStudentData({ ...newStudentData, password: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={newStudentData.address}
                onChange={(e) => setNewStudentData({ ...newStudentData, address: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <Home sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3 }}>
          <Button 
            onClick={() => setNewStudentOpen(false)}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleNewStudentSubmit}
            variant="contained"
            sx={{ 
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: '#1976d2',
          color: 'white',
          py: 3,
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                NSTI Dehradun
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                National Skill Training Institute - Premier technical education and skill development hub.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Link href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  About Institute
                </Link>
                <Link href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Courses Offered
                </Link>
                <Link href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Admissions
                </Link>
                <Link href="#" sx={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Contact Us
                </Link>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contact Info
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                📍 NSTI Campus, Dehradun, Uttarakhand<br/>
                📞 +91-135-XXXXXXX<br/>
                ✉️ info@nsti.edu.in<br/>
                🌐 www.nsti.edu.in
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2025 NSTI Dehradun - All Rights Reserved | Government of India Initiative
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;
