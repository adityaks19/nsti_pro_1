import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Snackbar,
  Paper,
  Divider,
  Chip,
  InputAdornment,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Save as SaveIcon,
  Clear as ClearIcon,
  Book as BookIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Language as LanguageIcon,
  Star as StarIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { StandardTextField, StandardSelect, StandardNumberField } from '../common/StandardInput';

const AddBook = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publisher: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 1,
    description: '',
    price: '',
    language: 'English',
    condition: 'New',
    location: {
      shelf: '',
      section: '',
      floor: 'Ground Floor'
    },
    tags: []
  });

  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const categories = [
    'Engineering',
    'Science',
    'Mathematics',
    'Computer Science',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Automobile',
    'Information Technology',
    'General',
    'Reference',
    'Technical',
    'Management',
    'Communication Skills',
    'Soft Skills'
  ];

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Other'];
  const conditions = ['New', 'Good', 'Fair', 'Poor'];
  const floors = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor'];

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author is required';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.publisher.trim()) newErrors.publisher = 'Publisher is required';
    if (!formData.publishedYear || formData.publishedYear < 1900 || formData.publishedYear > new Date().getFullYear()) {
      newErrors.publishedYear = 'Valid published year is required';
    }
    if (!formData.totalCopies || formData.totalCopies < 1) {
      newErrors.totalCopies = 'Total copies must be at least 1';
    }
    if (!formData.location.shelf.trim()) newErrors['location.shelf'] = 'Shelf location is required';
    if (!formData.location.section.trim()) newErrors['location.section'] = 'Section location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/library/books', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success('Book added successfully!');
        setSnackbar({ 
          open: true, 
          message: 'Book added successfully!', 
          severity: 'success' 
        });

        // Reset form after successful submission
        setTimeout(() => {
          navigate('/dashboard/library/manage-books');
        }, 2000);
      }
    } catch (error) {
      console.error('Add book error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
        setSnackbar({ 
          open: true, 
          message: error.response.data.message, 
          severity: 'error' 
        });
      } else if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.param] = err.msg;
        });
        setErrors(serverErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error('Failed to add book');
        setSnackbar({ 
          open: true, 
          message: 'Failed to add book', 
          severity: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publisher: '',
      publishedYear: new Date().getFullYear(),
      totalCopies: 1,
      description: '',
      price: '',
      language: 'English',
      condition: 'New',
      location: {
        shelf: '',
        section: '',
        floor: 'Ground Floor'
      },
      tags: []
    });
    setErrors({});
    setTagInput('');
  };

  return (
      <Box>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e', mb: 1 }}>
            Add New Book
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add a new book to the library collection
          </Typography>
        </Box>

        {/* Form Card */}
        <Card sx={{ borderRadius: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BookIcon sx={{ fontSize: 32, color: '#1a237e', mr: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                Book Information
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StandardTextField
                    label="Book Title"
                    value={formData.title}
                    onChange={handleChange('title')}
                    name="title"
                    required
                    error={!!errors.title}
                    helperText={errors.title}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StandardTextField
                    label="Author"
                    value={formData.author}
                    onChange={handleChange('author')}
                    name="author"
                    required
                    error={!!errors.author}
                    helperText={errors.author}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StandardTextField
                    label="ISBN"
                    value={formData.isbn}
                    onChange={handleChange('isbn')}
                    name="isbn"
                    required
                    error={!!errors.isbn}
                    helperText={errors.isbn || 'e.g., 978-0123456789'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StandardSelect
                    label="Category"
                    value={formData.category}
                    onChange={handleChange('category')}
                    name="category"
                    options={categories}
                    required
                    error={!!errors.category}
                    helperText={errors.category}
                  />
                </Grid>

                {/* Publication Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#1a237e' }}>
                    Publication Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StandardTextField
                    label="Publisher"
                    value={formData.publisher}
                    onChange={handleChange('publisher')}
                    name="publisher"
                    required
                    error={!!errors.publisher}
                    helperText={errors.publisher}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StandardNumberField
                    label="Published Year"
                    value={formData.publishedYear}
                    onChange={handleChange('publishedYear')}
                    name="publishedYear"
                    min={1900}
                    max={new Date().getFullYear()}
                    required
                    error={!!errors.publishedYear}
                    helperText={errors.publishedYear}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <StandardTextField
                    label="Edition"
                    value={formData.edition || ''}
                    onChange={handleChange('edition')}
                    placeholder="e.g., 1st, 2nd, Revised"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={formData.language}
                      onChange={handleChange('language')}
                      label="Language"
                      sx={{ borderRadius: 0 }}
                    >
                      {languages.map((language) => (
                        <MenuItem key={language} value={language}>
                          {language}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={formData.condition}
                      onChange={handleChange('condition')}
                      label="Condition"
                      sx={{ borderRadius: 0 }}
                      startAdornment={
                        <InputAdornment position="start">
                          <StarIcon />
                        </InputAdornment>
                      }
                    >
                      {conditions.map((condition) => (
                        <MenuItem key={condition} value={condition}>
                          {condition}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Price (₹)"
                    type="number"
                    value={formData.price}
                    onChange={handleChange('price')}
                    inputProps={{ min: 0, step: 0.01 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                </Grid>

                {/* Location Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#1a237e' }}>
                    Location Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Shelf *"
                    value={formData.location.shelf}
                    onChange={handleChange('location.shelf')}
                    error={!!errors['location.shelf']}
                    helperText={errors['location.shelf']}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Section *"
                    value={formData.location.section}
                    onChange={handleChange('location.section')}
                    error={!!errors['location.section']}
                    helperText={errors['location.section']}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Floor</InputLabel>
                    <Select
                      value={formData.location.floor}
                      onChange={handleChange('location.floor')}
                      label="Floor"
                      sx={{ borderRadius: 0 }}
                    >
                      {floors.map((floor) => (
                        <MenuItem key={floor} value={floor}>
                          {floor}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Physical Details */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#1a237e' }}>
                    Physical Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Total Copies *"
                    type="number"
                    value={formData.totalCopies}
                    onChange={handleChange('totalCopies')}
                    error={!!errors.totalCopies}
                    helperText={errors.totalCopies}
                    inputProps={{ min: 1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Number of Pages"
                    type="number"
                    value={formData.pages}
                    onChange={handleChange('pages')}
                    inputProps={{ min: 1 }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={handleChange('description')}
                    placeholder="Brief description of the book content..."
                    inputProps={{ maxLength: 1000 }}
                    helperText={`${formData.description.length}/1000 characters`}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                </Grid>

                {/* Tags Section */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 2, color: '#1a237e' }}>
                    Tags
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Add Tags (Press Enter or click Add)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button 
                            onClick={handleAddTag} 
                            size="small"
                            startIcon={<AddIcon />}
                            sx={{ borderRadius: 0 }}
                          >
                            Add
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 0 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {formData.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                        sx={{ borderRadius: 0 }}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Action Buttons */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={handleClear}
                      sx={{ 
                        borderRadius: 0,
                        borderColor: '#666',
                        color: '#666',
                        '&:hover': { borderColor: '#333', bgcolor: 'rgba(0,0,0,0.04)' }
                      }}
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                      disabled={loading}
                      sx={{ 
                        bgcolor: '#1a237e', 
                        borderRadius: 0,
                        px: 4,
                        '&:hover': { bgcolor: '#0d47a1' },
                        '&:disabled': { bgcolor: '#ccc' }
                      }}
                    >
                      {loading ? 'Adding Book...' : 'Add Book'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card sx={{ mt: 3, borderRadius: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#1a237e' }}>
              Important Notes
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Fields marked with * are required
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                ISBN should be in standard format (e.g., 978-0123456789)
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Available copies will be set equal to total copies initially
              </Typography>
              <Typography component="li" variant="body2">
                Book will be immediately available for requests after adding
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 0 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default AddBook;
