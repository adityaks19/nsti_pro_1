import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  InputAdornment,
  Fab,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  MenuBook as BookIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';

const BookRequests = () => {
  const [tabValue, setTabValue] = useState(0);
  const [availableBooks, setAvailableBooks] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock data for available books
  useEffect(() => {
    const mockBooks = [
      {
        id: 1,
        title: 'Advanced Programming Concepts in Java',
        author: 'Herbert Schildt',
        isbn: '978-0071808552',
        category: 'Programming',
        publisher: 'McGraw-Hill Education',
        edition: '11th Edition',
        year: 2020,
        pages: 1248,
        available: 8,
        total: 10,
        description: 'Comprehensive guide to Java programming with advanced concepts and practical examples.',
        language: 'English',
        location: 'Section A - Shelf 12'
      },
      {
        id: 2,
        title: 'Database Management Systems',
        author: 'Raghu Ramakrishnan, Johannes Gehrke',
        isbn: '978-0072465631',
        category: 'Database',
        publisher: 'McGraw-Hill Education',
        edition: '3rd Edition',
        year: 2019,
        pages: 1065,
        available: 5,
        total: 8,
        description: 'Complete coverage of database concepts, design, and implementation.',
        language: 'English',
        location: 'Section B - Shelf 5'
      },
      {
        id: 3,
        title: 'Computer Networks: A Top-Down Approach',
        author: 'James Kurose, Keith Ross',
        isbn: '978-0133594140',
        category: 'Networking',
        publisher: 'Pearson',
        edition: '7th Edition',
        year: 2021,
        pages: 864,
        available: 12,
        total: 15,
        description: 'Modern approach to computer networking with practical applications.',
        language: 'English',
        location: 'Section C - Shelf 8'
      },
      {
        id: 4,
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz, Peter Galvin',
        isbn: '978-1118063330',
        category: 'Operating Systems',
        publisher: 'Wiley',
        edition: '10th Edition',
        year: 2018,
        pages: 976,
        available: 6,
        total: 10,
        description: 'Comprehensive coverage of operating system principles and design.',
        language: 'English',
        location: 'Section A - Shelf 15'
      },
      {
        id: 5,
        title: 'Software Engineering: A Practitioner\'s Approach',
        author: 'Roger Pressman, Bruce Maxim',
        isbn: '978-0078022128',
        category: 'Software Engineering',
        publisher: 'McGraw-Hill Education',
        edition: '8th Edition',
        year: 2020,
        pages: 976,
        available: 4,
        total: 7,
        description: 'Practical approach to software engineering methodologies and practices.',
        language: 'English',
        location: 'Section D - Shelf 3'
      }
    ];
    setAvailableBooks(mockBooks);
    setFilteredBooks(mockBooks);
  }, []);

  // Mock data for my requests
  useEffect(() => {
    const mockRequests = [
      {
        id: 1,
        bookId: 1,
        bookTitle: 'Advanced Programming Concepts in Java',
        author: 'Herbert Schildt',
        isbn: '978-0071808552',
        requestDate: '2024-01-15',
        status: 'Pending',
        priority: 'High',
        quantity: 2,
        purpose: 'Course Material for Advanced Java Programming',
        expectedDate: '2024-01-20',
        notes: 'Required for upcoming semester course'
      },
      {
        id: 2,
        bookId: 2,
        bookTitle: 'Database Management Systems',
        author: 'Raghu Ramakrishnan',
        isbn: '978-0072465631',
        requestDate: '2024-01-13',
        status: 'Approved',
        priority: 'Normal',
        quantity: 1,
        purpose: 'Reference for Database Course',
        expectedDate: '2024-01-18',
        approvedDate: '2024-01-14',
        approvedBy: 'Ms. Librarian',
        notes: 'Approved for course reference'
      },
      {
        id: 3,
        bookId: 3,
        bookTitle: 'Computer Networks: A Top-Down Approach',
        author: 'James Kurose',
        isbn: '978-0133594140',
        requestDate: '2024-01-12',
        status: 'Issued',
        priority: 'Normal',
        quantity: 1,
        purpose: 'Teaching Material for Networking Course',
        issuedDate: '2024-01-14',
        dueDate: '2024-01-28',
        issuedBy: 'Ms. Librarian',
        notes: 'Book issued successfully'
      },
      {
        id: 4,
        bookId: 4,
        bookTitle: 'Operating System Concepts',
        author: 'Abraham Silberschatz',
        isbn: '978-1118063330',
        requestDate: '2024-01-10',
        status: 'Rejected',
        priority: 'Low',
        quantity: 3,
        purpose: 'Additional copies for lab sessions',
        rejectedDate: '2024-01-11',
        rejectedBy: 'Ms. Librarian',
        rejectionReason: 'Insufficient copies available',
        notes: 'Request rejected due to limited stock'
      }
    ];
    setMyRequests(mockRequests);
  }, []);

  // Filter books based on search and category
  useEffect(() => {
    let filtered = availableBooks;

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(book => book.category === filterCategory);
    }

    setFilteredBooks(filtered);
  }, [searchTerm, filterCategory, availableBooks]);

  const handleRequestBook = (book) => {
    setSelectedBook(book);
    setOpenRequestDialog(true);
  };

  const handleSubmitRequest = () => {
    // Add request submission logic here
    setOpenRequestDialog(false);
    setSnackbar({ open: true, message: 'Book request submitted successfully!', severity: 'success' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Approved': return 'info';
      case 'Issued': return 'success';
      case 'Rejected': return 'error';
      case 'Returned': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Normal': return 'primary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  const getAvailabilityColor = (available, total) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return 'success';
    if (percentage > 20) return 'warning';
    return 'error';
  };

  const categories = ['Programming', 'Database', 'Networking', 'Operating Systems', 'Software Engineering', 'Web Development', 'Mobile Development'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
          Library Book Requests
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse available books and manage your book requests
        </Typography>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Badge badgeContent={availableBooks.length} color="primary">
                Available Books
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={myRequests.filter(req => req.status === 'Pending').length} color="warning">
                My Requests
              </Badge>
            } 
          />
        </Tabs>
      </Card>

      {/* Available Books Tab */}
      {tabValue === 0 && (
        <>
          {/* Search and Filter Controls */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: 3 }}>
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
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    {filteredBooks.length} books found
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Books Grid */}
          <Grid container spacing={3}>
            {filteredBooks.map((book) => (
              <Grid item xs={12} md={6} lg={4} key={book.id}>
                <Card sx={{ 
                  borderRadius: 2, 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)' 
                  }
                }}>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#1a237e', mr: 2, width: 56, height: 56 }}>
                        <BookIcon fontSize="large" />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, lineHeight: 1.2 }}>
                          {book.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          by {book.author}
                        </Typography>
                        <Chip 
                          label={book.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2, flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {book.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ISBN: {book.isbn} • {book.edition} • {book.year}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          Availability
                        </Typography>
                        <Chip 
                          label={`${book.available}/${book.total}`}
                          size="small"
                          color={getAvailabilityColor(book.available, book.total)}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Location: {book.location}
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleRequestBook(book)}
                      disabled={book.available === 0}
                      sx={{ 
                        bgcolor: '#1a237e',
                        borderRadius: 2,
                        '&:hover': { bgcolor: '#0d47a1' }
                      }}
                    >
                      {book.available === 0 ? 'Out of Stock' : 'Request Book'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* My Requests Tab */}
      {tabValue === 1 && (
        <Card sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8f9fa' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Book Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Request Info</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1a237e' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myRequests.map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ bgcolor: '#4caf50', mr: 2, width: 48, height: 48 }}>
                            <BookIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {request.bookTitle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              by {request.author}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ISBN: {request.isbn}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Purpose:</strong> {request.purpose}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Quantity:</strong> {request.quantity}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Requested:</strong> {request.requestDate}
                        </Typography>
                        {request.issuedDate && (
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            <strong>Due Date:</strong> {request.dueDate}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Chip 
                            label={request.status} 
                            size="small" 
                            color={getStatusColor(request.status)}
                            sx={{ fontWeight: 'bold' }}
                          />
                          <Chip 
                            label={request.priority} 
                            size="small" 
                            color={getPriorityColor(request.priority)}
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            sx={{ color: '#1a237e' }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Request Book Dialog */}
      <Dialog 
        open={openRequestDialog} 
        onClose={() => setOpenRequestDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          bgcolor: '#4caf50', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BookIcon sx={{ mr: 1 }} />
            Request Book
          </Box>
          <IconButton onClick={() => setOpenRequestDialog(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedBook && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {selectedBook.title}
                  </Typography>
                  <Typography variant="body2">
                    by {selectedBook.author} • Available: {selectedBook.available}/{selectedBook.total}
                  </Typography>
                </Alert>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  type="number"
                  variant="outlined"
                  defaultValue={1}
                  inputProps={{ min: 1, max: selectedBook.available }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select label="Priority" defaultValue="Normal">
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose/Reason"
                  multiline
                  rows={3}
                  variant="outlined"
                  placeholder="Please specify the purpose for requesting this book..."
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Expected Return Date"
                  type="date"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={2}
                  variant="outlined"
                  placeholder="Any additional information..."
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenRequestDialog(false)}
            startIcon={<CancelIcon />}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSubmitRequest}
            sx={{ bgcolor: '#4caf50' }}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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

export default BookRequests;
