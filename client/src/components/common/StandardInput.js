import React from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// Standard input field sizes
const STANDARD_FIELD_PROPS = {
  fullWidth: true,
  variant: 'outlined',
  size: 'medium',
  sx: {
    minHeight: '56px', // Standard height for all inputs
    '& .MuiOutlinedInput-root': {
      height: '56px',
    },
    '& .MuiInputLabel-root': {
      fontSize: '1rem',
    },
    '& .MuiOutlinedInput-input': {
      fontSize: '1rem',
      padding: '16px 14px',
    }
  }
};

// Standard TextField component
export const StandardTextField = ({ 
  label, 
  value, 
  onChange, 
  name, 
  type = 'text', 
  required = false, 
  multiline = false, 
  rows = 1,
  placeholder = '',
  error = false,
  helperText = '',
  disabled = false,
  ...props 
}) => {
  return (
    <TextField
      {...STANDARD_FIELD_PROPS}
      label={label}
      value={value}
      onChange={onChange}
      name={name}
      type={type}
      required={required}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      disabled={disabled}
      sx={{
        ...STANDARD_FIELD_PROPS.sx,
        ...(multiline && {
          '& .MuiOutlinedInput-root': {
            height: 'auto',
            minHeight: '56px',
          }
        })
      }}
      {...props}
    />
  );
};

// Standard Select component
export const StandardSelect = ({ 
  label, 
  value, 
  onChange, 
  name, 
  options = [], 
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  ...props 
}) => {
  return (
    <FormControl 
      {...STANDARD_FIELD_PROPS}
      error={error}
      disabled={disabled}
    >
      <InputLabel 
        required={required}
        sx={{ fontSize: '1rem' }}
      >
        {label}
      </InputLabel>
      <Select
        value={value}
        onChange={onChange}
        name={name}
        label={label}
        sx={{
          height: '56px',
          fontSize: '1rem',
          '& .MuiSelect-select': {
            padding: '16px 14px',
          }
        }}
        {...props}
      >
        {options.map((option) => (
          <MenuItem 
            key={typeof option === 'string' ? option : option.value} 
            value={typeof option === 'string' ? option : option.value}
            sx={{ fontSize: '1rem' }}
          >
            {typeof option === 'string' ? option : option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <div style={{ fontSize: '0.75rem', color: error ? '#d32f2f' : '#666', marginTop: '3px', marginLeft: '14px' }}>
          {helperText}
        </div>
      )}
    </FormControl>
  );
};

// Standard Number Input
export const StandardNumberField = ({ 
  label, 
  value, 
  onChange, 
  name, 
  min = 0, 
  max, 
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  ...props 
}) => {
  return (
    <StandardTextField
      label={label}
      value={value}
      onChange={onChange}
      name={name}
      type="number"
      required={required}
      error={error}
      helperText={helperText}
      disabled={disabled}
      inputProps={{ min, max }}
      {...props}
    />
  );
};

// Standard Date Input
export const StandardDateField = ({ 
  label, 
  value, 
  onChange, 
  name, 
  required = false,
  error = false,
  helperText = '',
  disabled = false,
  ...props 
}) => {
  return (
    <StandardTextField
      label={label}
      value={value}
      onChange={onChange}
      name={name}
      type="date"
      required={required}
      error={error}
      helperText={helperText}
      disabled={disabled}
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  );
};

export default {
  StandardTextField,
  StandardSelect,
  StandardNumberField,
  StandardDateField
};
