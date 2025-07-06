import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tab,
  Tabs,
  Badge,
  LinearProgress,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  Book as BookIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  RequestPage as RequestIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Payment as PaymentIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  LibraryBooks as LibraryBooksIcon,
  Person as PersonIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const StudentLibrary = () => {
  const [books, setBooks] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [requestDialog, setRequestDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [fines, setFines] = useState([]);
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchBooks();
    fetchMyRequests();
    fetchFines();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/library/books', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const books = response.data.data?.books || response.data.books || [];
        setBooks(books);
        // Extract unique categories
        const uniqueCategories = [...new Set(books.map(book => book.category))];
        setCategories(uniqueCategories);
      } else {
        toast.error('Failed to fetch books');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Error fetching books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/library/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setMyRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      // Don't show error toast for requests as it's not critical
    }
  };

  const fetchFines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/library/my-fines', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setFines(response.data.fines);
      }
    } catch (error) {
      console.error('Error fetching fines:', error);
      // Don't show error toast for fines as it's not critical
    }
  };

  const handleRequestBook = async () => {
    if (!selectedBook) return;

    try {
      setRequestLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/library/request', {
        bookId: selectedBook._id,
        requestType: 'borrow'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Book request submitted successfully!');
        setRequestDialog(false);
        setSelectedBook(null);
        fetchMyRequests(); // Refresh requests
      } else {
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error requesting book:', error);
      toast.error(error.response?.data?.message || 'Error submitting request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'info';
      case 'issued': return 'success';
      case 'overdue': return 'error';
      case 'returned': return 'default';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory && book.isActive && book.availableCopies > 0;
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openRequestDialog = (book) => {
    setSelectedBook(book);
    setRequestDialog(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Library Books
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and request books from our library collection
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LibraryBooksIcon />
                Available Books
                <Badge badgeContent={filteredBooks.length} color="primary" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RequestIcon />
                My Requests
                <Badge badgeContent={myRequests.length} color="secondary" />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PaymentIcon />
                Fines
                <Badge badgeContent={fines.length} color="error" />
              </Box>
            } 
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {/* Search and Filter */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search books by title, author, or ISBN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                  >
                    Clear
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Books Grid */}
          {filteredBooks.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <LibraryBooksIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No books found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria or check back later for new additions
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredBooks.map((book) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
                          <BookIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '1rem',
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {book.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            by {book.author}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={book.category} 
                          size="small" 
                          sx={{ mb: 1, mr: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={`${book.availableCopies} available`} 
                          size="small" 
                          color="success"
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>ISBN:</strong> {book.isbn}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Publisher:</strong> {book.publisher}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        <strong>Price:</strong> ₹{book.price}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<RequestIcon />}
                          onClick={() => openRequestDialog(book)}
                          sx={{ 
                            flexGrow: 1,
                            bgcolor: '#1a237e',
                            '&:hover': { bgcolor: '#0d47a1' }
                          }}
                        >
                          Request
                        </Button>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => openRequestDialog(book)}
                            sx={{ color: '#1a237e' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* My Requests Tab */}
      {tabValue === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
              My Book Requests
            </Typography>
            
            {myRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <RequestIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No requests yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start by requesting some books from the Available Books tab
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Book</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Request Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myRequests.map((request) => (
                      <TableRow key={request._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: '#1a237e' }}>
                              <BookIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                {request.book?.title || 'Unknown Book'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ISBN: {request.book?.isbn || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {request.book?.author || 'Unknown Author'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={request.status?.toUpperCase() || 'UNKNOWN'}
                            color={getStatusColor(request.status)}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(request.requestDate)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(request.dueDate)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fines Tab */}
      {tabValue === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}>
              Library Fines
            </Typography>
            
            {fines.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No fines
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You have no outstanding library fines. Keep it up!
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Book</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Fine Amount</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fines.map((fine) => (
                      <TableRow key={fine._id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {fine.book?.title || 'Unknown Book'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                            ₹{fine.amount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {fine.reason || 'Late return'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(fine.date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={fine.status?.toUpperCase() || 'PENDING'}
                            color={fine.status === 'paid' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Request Book Dialog */}
      <Dialog 
        open={requestDialog} 
        onClose={() => setRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1a237e', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <RequestIcon />
          Request Book
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedBook && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                You are about to request this book. Once approved, you'll have 14 days to collect it from the library.
              </Alert>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 56, height: 56 }}>
                  <BookIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {selectedBook.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    by {selectedBook.author}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Category:</strong> {selectedBook.category}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>ISBN:</strong> {selectedBook.isbn}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Publisher:</strong> {selectedBook.publisher}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Available:</strong> {selectedBook.availableCopies} copies
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setRequestDialog(false)}
            disabled={requestLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRequestBook}
            variant="contained"
            disabled={requestLoading}
            startIcon={requestLoading ? <CircularProgress size={20} /> : <RequestIcon />}
            sx={{ 
              bgcolor: '#1a237e',
              '&:hover': { bgcolor: '#0d47a1' }
            }}
          >
            {requestLoading ? 'Requesting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentLibrary;
