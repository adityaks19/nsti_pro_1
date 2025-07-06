import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardMedia,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MenuBook as BookIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  RequestPage as RequestIcon,
  Visibility as ViewIcon,
  Category as CategoryIcon,
  Person as AuthorIcon,
  Business as PublisherIcon,
  CalendarToday as YearIcon,
  LocationOn as LocationIcon,
  CheckCircle as AvailableIcon,
  Error as UnavailableIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import libraryService from '../../services/libraryService';

const LibraryBooks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    categories: [],
    languages: [],
    conditions: []
  });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [booksPerPage] = useState(12);
  
  // Dialog states
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookDetailsOpen, setBookDetailsOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState('borrow');
  const [priority, setPriority] = useState('normal');
  const [remarks, setRemarks] = useState('');

  // Fetch books
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: booksPerPage,
        sortBy,
        sortOrder
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedLanguage !== 'all') params.language = selectedLanguage;
      if (selectedCondition !== 'all') params.condition = selectedCondition;
      if (availableOnly) params.available = 'true';
      
      const response = await libraryService.getBooks(params);
      
      if (response.success) {
        setBooks(response.data.books);
        setTotalPages(response.data.pagination.totalPages);
        setTotalBooks(response.data.pagination.totalBooks);
        setFilters(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setError(error.message || 'Failed to fetch books');
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [currentPage, selectedCategory, selectedLanguage, selectedCondition, availableOnly, sortBy, sortOrder]);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchBooks();
  };

  // Handle search on Enter key
  const handleSearchKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLanguage('all');
    setSelectedCondition('all');
    setAvailableOnly(false);
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  // Handle book request
  const handleRequestBook = async () => {
    try {
      const requestData = {
        bookId: selectedBook._id,
        requestType,
        priority,
        remarks: remarks.trim()
      };

      const response = await libraryService.requestBook(requestData);
      
      if (response.success) {
        toast.success('Book request submitted successfully!');
        setRequestDialogOpen(false);
        setRemarks('');
        setRequestType('borrow');
        setPriority('normal');
        fetchBooks(); // Refresh to update request counts
      }
    } catch (error) {
      console.error('Error requesting book:', error);
      toast.error(error.message || 'Failed to request book');
    }
  };

  // Open book details
  const openBookDetails = (book) => {
    setSelectedBook(book);
    setBookDetailsOpen(true);
  };

  // Open request dialog
  const openRequestDialog = (book) => {
    setSelectedBook(book);
    setRequestDialogOpen(true);
  };

  // Get availability status
  const getAvailabilityStatus = (book) => {
    if (book.availableCopies === 0) {
      return { status: 'Out of Stock', color: 'error', icon: <UnavailableIcon /> };
    } else if (book.availableCopies <= 2) {
      return { status: 'Low Stock', color: 'warning', icon: <AvailableIcon /> };
    } else {
      return { status: 'Available', color: 'success', icon: <AvailableIcon /> };
    }
  };

  // Check if user can request books
  const canRequestBooks = () => {
    return ['student', 'teacher', 'to', 'admin'].includes(user?.role);
  };

  if (loading && books.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            📚 Library Books
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and request books from our collection
          </Typography>
        </Box>
        
        {(user?.role === 'librarian' || user?.role === 'admin') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/library/add-book')}
            sx={{ ml: 2 }}
          >
            Add Book
          </Button>
        )}
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search books, authors, ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleSearchKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} size="small">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {filters.categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Language Filter */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Language</InputLabel>
                <Select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  label="Language"
                >
                  <MenuItem value="all">All Languages</MenuItem>
                  {filters.languages.map((language) => (
                    <MenuItem key={language} value={language}>
                      {language}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort */}
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="createdAt">Date Added</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="author">Author</MenuItem>
                  <MenuItem value="publishedYear">Year</MenuItem>
                  <MenuItem value="requestCount">Popularity</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Actions */}
            <Grid item xs={12} md={2}>
              <Box display="flex" gap={1}>
                <Tooltip title="Available Only">
                  <IconButton
                    onClick={() => setAvailableOnly(!availableOnly)}
                    color={availableOnly ? 'primary' : 'default'}
                  >
                    <FilterIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset Filters">
                  <IconButton onClick={resetFilters}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
        <Typography variant="body2" color="text.secondary">
          Showing {books.length} of {totalBooks} books
        </Typography>
        <FormControl size="small">
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Books Grid */}
      {books.length === 0 && !loading ? (
        <Box textAlign="center" py={8}>
          <BookIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No books found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {books.map((book) => {
            const availability = getAvailabilityStatus(book);
            
            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={book._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  {/* Book Image */}
                  <CardMedia
                    component="div"
                    sx={{
                      height: 200,
                      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    <BookIcon sx={{ fontSize: 60, opacity: 0.7 }} />
                    
                    {/* Availability Badge */}
                    <Chip
                      icon={availability.icon}
                      label={availability.status}
                      color={availability.color}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8
                      }}
                    />
                  </CardMedia>

                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Title */}
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {book.title}
                    </Typography>

                    {/* Author */}
                    <Box display="flex" alignItems="center" mb={1}>
                      <AuthorIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {book.author}
                      </Typography>
                    </Box>

                    {/* Category */}
                    <Box display="flex" alignItems="center" mb={1}>
                      <CategoryIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Chip 
                        label={book.category} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </Box>

                    {/* Publisher & Year */}
                    <Box display="flex" alignItems="center" mb={1}>
                      <PublisherIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {book.publisher} ({book.publishedYear})
                      </Typography>
                    </Box>

                    {/* Location */}
                    <Box display="flex" alignItems="center" mb={2}>
                      <LocationIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {book.location?.section} - {book.location?.shelf}
                      </Typography>
                    </Box>

                    {/* Copies Info */}
                    <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        Available: {book.availableCopies}/{book.totalCopies}
                      </Typography>
                      <Typography variant="body2" color="primary">
                        ₹{book.price}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        onClick={() => openBookDetails(book)}
                        fullWidth
                      >
                        Details
                      </Button>
                      
                      {canRequestBooks() && book.availableCopies > 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<RequestIcon />}
                          onClick={() => openRequestDialog(book)}
                          fullWidth
                        >
                          Request
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(event, page) => setCurrentPage(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Book Details Dialog */}
      <Dialog
        open={bookDetailsOpen}
        onClose={() => setBookDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedBook && (
          <>
            <DialogTitle>
              <Typography variant="h5" component="div">
                {selectedBook.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                by {selectedBook.author}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>ISBN:</strong> {selectedBook.isbn}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Category:</strong> {selectedBook.category}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Publisher:</strong> {selectedBook.publisher}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Published Year:</strong> {selectedBook.publishedYear}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Language:</strong> {selectedBook.language}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Condition:</strong> {selectedBook.condition}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Total Copies:</strong> {selectedBook.totalCopies}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Available:</strong> {selectedBook.availableCopies}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Location:</strong> {selectedBook.location?.section} - {selectedBook.location?.shelf}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Floor:</strong> {selectedBook.location?.floor}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Price:</strong> ₹{selectedBook.price}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Requests:</strong> {selectedBook.requestCount}
                  </Typography>
                </Grid>
                {selectedBook.description && (
                  <Grid item xs={12}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Description:</strong>
                    </Typography>
                    <Typography variant="body2">
                      {selectedBook.description}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setBookDetailsOpen(false)}>
                Close
              </Button>
              {canRequestBooks() && selectedBook.availableCopies > 0 && (
                <Button
                  variant="contained"
                  startIcon={<RequestIcon />}
                  onClick={() => {
                    setBookDetailsOpen(false);
                    openRequestDialog(selectedBook);
                  }}
                >
                  Request Book
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Request Dialog */}
      <Dialog
        open={requestDialogOpen}
        onClose={() => setRequestDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Request Book: {selectedBook?.title}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Request Type</InputLabel>
                <Select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  label="Request Type"
                >
                  <MenuItem value="borrow">Borrow</MenuItem>
                  <MenuItem value="reference">Reference</MenuItem>
                  <MenuItem value="research">Research</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Remarks (Optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any additional notes or requirements..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRequestBook}
            startIcon={<RequestIcon />}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LibraryBooks;
