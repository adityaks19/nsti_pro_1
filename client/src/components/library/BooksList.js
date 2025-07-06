import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MenuBook as BookIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const BooksList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  
  // Dialog states
  const [bookDialog, setBookDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: '',
    totalCopies: '',
    location: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const categories = [
    'Computer Science',
    'Electronics',
    'Mathematics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Physics',
    'Chemistry',
    'General'
  ];

  // Fetch books data
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/library/books', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setBooks(response.data.data.books);
        setFilteredBooks(response.data.data.books);
      }
    } catch (error) {
      console.error('Books fetch error:', error);
      toast.error('Failed to load books data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books based on search and filters
  useEffect(() => {
    const filtered = books.filter(book => {
      const matchesSearch = 
        book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
      
      const matchesAvailability = 
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && book.availableCopies > 0) ||
        (availabilityFilter === 'unavailable' && book.availableCopies === 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });

    setFilteredBooks(filtered);
  }, [searchTerm, categoryFilter, availabilityFilter, books]);

  // CRUD Operations
  const handleAddBook = () => {
    setEditMode(false);
    setSelectedBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publishedYear: '',
      totalCopies: '',
      location: '',
      description: ''
    });
    setFormErrors({});
    setBookDialog(true);
  };

  const handleEditBook = (book) => {
    setEditMode(true);
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher || '',
      publishedYear: book.publishedYear?.toString() || '',
      totalCopies: book.totalCopies.toString(),
      location: typeof book.location === 'object' 
        ? `${book.location.shelf}-${book.location.section}` 
        : book.location || '',
      description: book.description || ''
    });
    setFormErrors({});
    setBookDialog(true);
  };

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setViewDialog(true);
  };

  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setDeleteDialog(true);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.author.trim()) errors.author = 'Author is required';
    if (!formData.isbn.trim()) errors.isbn = 'ISBN is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.totalCopies || isNaN(formData.totalCopies) || formData.totalCopies < 1) {
      errors.totalCopies = 'Valid total copies is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveBook = async () => {
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Parse location string into object if it contains a dash
      let locationObj;
      if (formData.location && formData.location.includes('-')) {
        const [shelf, section] = formData.location.split('-');
        locationObj = {
          shelf: shelf.trim(),
          section: section.trim(),
          floor: 'Ground Floor'
        };
      } else {
        locationObj = {
          shelf: formData.location || 'A1',
          section: 'GEN',
          floor: 'Ground Floor'
        };
      }

      const bookData = {
        ...formData,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : null,
        totalCopies: parseInt(formData.totalCopies),
        availableCopies: editMode ? selectedBook.availableCopies : parseInt(formData.totalCopies),
        location: locationObj
      };

      let response;
      if (editMode) {
        response = await axios.put(`/api/library/books/${selectedBook._id}`, bookData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await axios.post('/api/library/books', bookData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        toast.success(`Book ${editMode ? 'updated' : 'added'} successfully`);
        setBookDialog(false);
        fetchBooks();
      }
    } catch (error) {
      console.error('Save book error:', error);
      toast.error(error.response?.data?.message || `Failed to ${editMode ? 'update' : 'add'} book`);
    }
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/library/books/${selectedBook._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Book deleted successfully');
        setDeleteDialog(false);
        fetchBooks();
      }
    } catch (error) {
      console.error('Delete book error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getAvailabilityStatus = (book) => {
    if (book.availableCopies === 0) return { status: 'Out of Stock', color: 'error', icon: <ErrorIcon /> };
    if (book.availableCopies <= 2) return { status: 'Low Stock', color: 'warning', icon: <WarningIcon /> };
    return { status: 'Available', color: 'success', icon: <CheckCircleIcon /> };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Books Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage library books collection with full CRUD operations
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchBooks}
            sx={{ borderColor: '#1a237e', color: '#1a237e' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBook}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
          >
            Add Book
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    {books.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Books
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#1a237e', width: 56, height: 56 }}>
                  <BookIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                    {books.filter(book => book.availableCopies > 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#4caf50', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                    {books.filter(book => book.availableCopies <= 2 && book.availableCopies > 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Low Stock
                  </Typography>
                </Box>
                <Badge badgeContent={books.filter(book => book.availableCopies <= 2 && book.availableCopies > 0).length} color="error">
                  <Avatar sx={{ bgcolor: '#ff9800', width: 56, height: 56 }}>
                    <WarningIcon />
                  </Avatar>
                </Badge>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                    {books.filter(book => book.availableCopies === 0).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Out of Stock
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f44336', width: 56, height: 56 }}>
                  <ErrorIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  label="Availability"
                >
                  <MenuItem value="all">All Books</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="unavailable">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Book Details</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Availability</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBooks.map((book) => {
                  const availabilityInfo = getAvailabilityStatus(book);
                  return (
                    <TableRow key={book._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 40, height: 40 }}>
                            <BookIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {book.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              by {book.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ISBN: {book.isbn}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={book.category}
                          size="small"
                          sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Chip
                            icon={availabilityInfo.icon}
                            label={availabilityInfo.status}
                            color={availabilityInfo.color}
                            size="small"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {book.availableCopies}/{book.totalCopies} copies
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {typeof book.location === 'object' 
                            ? `${book.location.shelf}-${book.location.section}` 
                            : book.location || 'Not specified'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => handleViewBook(book)}
                              sx={{ color: '#2196f3' }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Book">
                            <IconButton 
                              size="small" 
                              onClick={() => handleEditBook(book)}
                              sx={{ color: '#ff9800' }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Book">
                            <IconButton 
                              size="small" 
                              onClick={() => handleDeleteBook(book)}
                              sx={{ color: '#f44336' }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredBooks.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <BookIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No books found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter criteria
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Book Dialog */}
      <Dialog open={bookDialog} onClose={() => setBookDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#1a237e', mr: 2 }}>
              {editMode ? <EditIcon /> : <AddIcon />}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {editMode ? 'Edit Book' : 'Add New Book'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title *"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Author *"
                value={formData.author}
                onChange={(e) => handleFormChange('author', e.target.value)}
                error={!!formErrors.author}
                helperText={formErrors.author}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ISBN *"
                value={formData.isbn}
                onChange={(e) => handleFormChange('isbn', e.target.value)}
                error={!!formErrors.isbn}
                helperText={formErrors.isbn}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  label="Category *"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {formErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Publisher"
                value={formData.publisher}
                onChange={(e) => handleFormChange('publisher', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Published Year"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => handleFormChange('publishedYear', e.target.value)}
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Copies *"
                type="number"
                value={formData.totalCopies}
                onChange={(e) => handleFormChange('totalCopies', e.target.value)}
                error={!!formErrors.totalCopies}
                helperText={formErrors.totalCopies}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="e.g., A1-CS, B2-EC (Shelf-Section)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="Brief description of the book..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setBookDialog(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveBook}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d47a1' } }}
          >
            {editMode ? 'Update Book' : 'Add Book'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Book Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Book Details</DialogTitle>
        <DialogContent>
          {selectedBook && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                {selectedBook.title}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Author:</Typography>
                  <Typography variant="body1">{selectedBook.author}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">ISBN:</Typography>
                  <Typography variant="body1">{selectedBook.isbn}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Category:</Typography>
                  <Typography variant="body1">{selectedBook.category}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Publisher:</Typography>
                  <Typography variant="body1">{selectedBook.publisher || 'Not specified'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Published Year:</Typography>
                  <Typography variant="body1">{selectedBook.publishedYear || 'Not specified'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Location:</Typography>
                  <Typography variant="body1">
                    {typeof selectedBook.location === 'object' 
                      ? `${selectedBook.location.shelf}-${selectedBook.location.section}` 
                      : selectedBook.location || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Total Copies:</Typography>
                  <Typography variant="body1">{selectedBook.totalCopies}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Available:</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: selectedBook.availableCopies > 0 ? '#4caf50' : '#f44336' }}>
                    {selectedBook.availableCopies}
                  </Typography>
                </Grid>
                {selectedBook.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Description:</Typography>
                    <Typography variant="body1">{selectedBook.description}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: '#f44336', mr: 2 }}>
              <DeleteIcon />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The book will be permanently removed from the library.
          </Alert>
          {selectedBook && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete the following book?
              </Typography>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {selectedBook.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  by {selectedBook.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ISBN: {selectedBook.isbn}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Copies: {selectedBook.availableCopies}/{selectedBook.totalCopies}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDeleteDialog(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Delete Book
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BooksList;
