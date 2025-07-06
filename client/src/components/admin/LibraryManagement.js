import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Alert,
  Snackbar,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Book as BookIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import axios from 'axios';

const LibraryManagement = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [books, setBooks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: '',
    totalCopies: 1,
    availableCopies: 1,
    description: '',
  });

  const categories = [
    'Computer Science',
    'Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Literature',
    'History',
    'Economics',
    'Management',
    'Other'
  ];

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [booksRes, requestsRes] = await Promise.all([
        axios.get('/api/library/books', { headers }),
        axios.get('/api/library/requests', { headers })
      ]);
      
      setBooks(booksRes.data.data?.books || []);
      setRequests(requestsRes.data.data?.requests || []);
      
      // Calculate stats from the data
      const totalBooks = booksRes.data.data?.books?.length || 0;
      const totalRequests = requestsRes.data.data?.requests?.length || 0;
      const pendingRequests = requestsRes.data.data?.requests?.filter(r => r.status === 'pending')?.length || 0;
      const approvedRequests = requestsRes.data.data?.requests?.filter(r => r.status === 'approved')?.length || 0;
      
      setStats({
        totalBooks,
        totalRequests,
        pendingRequests,
        approvedRequests,
        issuedBooks: approvedRequests
      });
      
      // Set issued books from approved requests
      setIssuedBooks(requestsRes.data.data?.requests?.filter(r => r.status === 'approved') || []);
      
    } catch (error) {
      console.error('Error fetching library data:', error);
      showSnackbar('Error fetching library data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publishedYear: '',
      totalCopies: 1,
      availableCopies: 1,
      description: '',
    });
    setOpenDialog(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      publisher: book.publisher || '',
      publishedYear: book.publishedYear || '',
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      description: book.description || '',
    });
    setOpenDialog(true);
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`/api/library/books/${bookId}`);
        fetchLibraryData();
        showSnackbar('Book deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting book:', error);
        showSnackbar('Error deleting book', 'error');
      }
    }
  };

  const handleSubmitBook = async () => {
    try {
      if (editingBook) {
        await axios.put(`/api/library/books/${editingBook._id}`, formData);
        showSnackbar('Book updated successfully', 'success');
      } else {
        await axios.post('/api/library/books', formData);
        showSnackbar('Book added successfully', 'success');
      }
      setOpenDialog(false);
      fetchLibraryData();
    } catch (error) {
      console.error('Error saving book:', error);
      showSnackbar('Error saving book', 'error');
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await axios.put(`/api/library/requests/${requestId}/approve`);
      fetchLibraryData();
      showSnackbar('Request approved successfully', 'success');
    } catch (error) {
      console.error('Error approving request:', error);
      showSnackbar('Error approving request', 'error');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`/api/library/requests/${requestId}/reject`);
      fetchLibraryData();
      showSnackbar('Request rejected', 'info');
    } catch (error) {
      console.error('Error rejecting request:', error);
      showSnackbar('Error rejecting request', 'error');
    }
  };

  const handleReturnBook = async (issuedId) => {
    try {
      await axios.put(`/api/library/issued/${issuedId}/return`);
      fetchLibraryData();
      showSnackbar('Book returned successfully', 'success');
    } catch (error) {
      console.error('Error returning book:', error);
      showSnackbar('Error returning book', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      case 'issued': return '#3b82f6';
      case 'returned': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = filterCategory === '' || book.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e3a8a' }}>
          Library
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLibraryData}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBook}
            sx={{ bgcolor: '#059669' }}
          >
            Add Book
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#059669', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <BookIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.totalBooks || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Books
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#3b82f6', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <AssignmentIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.issuedBooks || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Issued Books
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#f59e0b', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <ScheduleIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.pendingRequests || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: '#ef4444', mx: 'auto', mb: 1, width: 50, height: 50 }}>
                <WarningIcon />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {stats.overdueBooks || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overdue Books
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Books" 
            icon={<BookIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={
              <Badge badgeContent={requests.filter(r => r.status === 'pending').length} color="error">
                Requests
              </Badge>
            } 
            icon={<AssignmentIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Issued Books" 
            icon={<CheckCircleIcon />} 
            iconPosition="start"
          />
        </Tabs>

        {/* Books Tab */}
        <TabPanel value={currentTab} index={0}>
          {/* Search and Filter */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
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
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="textSecondary">
                Showing {filteredBooks.length} books
              </Typography>
            </Grid>
          </Grid>

          {/* Books Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Book Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Copies</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Availability</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBooks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((book) => (
                  <TableRow key={book._id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          by {book.author}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ISBN: {book.isbn}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.category}
                        size="small"
                        sx={{ bgcolor: '#e0f2fe', color: '#0277bd' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Total: {book.totalCopies}
                      </Typography>
                      <Typography variant="body2">
                        Available: {book.availableCopies}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                        color={book.availableCopies > 0 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="View Details">
                          <IconButton size="small" sx={{ color: '#3b82f6' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Book">
                          <IconButton
                            size="small"
                            onClick={() => handleEditBook(book)}
                            sx={{ color: '#059669' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Book">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteBook(book._id)}
                            sx={{ color: '#dc2626' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Requests Tab */}
        <TabPanel value={currentTab} index={1}>
          <List>
            {requests.map((request) => (
              <React.Fragment key={request._id}>
                <ListItem
                  sx={{
                    bgcolor: request.status === 'pending' ? '#fffbeb' : 'transparent',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getStatusColor(request.status) }}>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {request.book?.title || 'Unknown Book'}
                        </Typography>
                        <Chip
                          label={request.status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(request.status),
                            color: 'white',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Requested by: {request.user?.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Date: {new Date(request.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  {request.status === 'pending' && (
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => handleApproveRequest(request._id)}
                        startIcon={<CheckCircleIcon />}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleRejectRequest(request._id)}
                        startIcon={<CancelIcon />}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        {/* Issued Books Tab */}
        <TabPanel value={currentTab} index={2}>
          <List>
            {issuedBooks.map((issued) => (
              <React.Fragment key={issued._id}>
                <ListItem
                  sx={{
                    bgcolor: isOverdue(issued.dueDate) ? '#fef2f2' : '#f0fdf4',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: isOverdue(issued.dueDate) ? '#ef4444' : '#10b981' }}>
                      <BookIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {issued.book?.title || 'Unknown Book'}
                        </Typography>
                        <Chip
                          label={isOverdue(issued.dueDate) ? 'Overdue' : 'Active'}
                          color={isOverdue(issued.dueDate) ? 'error' : 'success'}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Issued to: {issued.user?.name || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Issue Date: {new Date(issued.issueDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Due Date: {new Date(issued.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleReturnBook(issued._id)}
                    sx={{ bgcolor: '#059669' }}
                  >
                    Mark Returned
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={currentTab === 0 ? filteredBooks.length : currentTab === 1 ? requests.length : issuedBooks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add/Edit Book Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBook ? 'Edit Book' : 'Add New Book'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ISBN"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Published Year"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Total Copies"
                type="number"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Available Copies"
                type="number"
                value={formData.availableCopies}
                onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value) })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitBook} variant="contained">
            {editingBook ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default LibraryManagement;
