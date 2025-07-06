# Admin Components

This directory contains comprehensive admin panel components for the NSTI College Management System.

## Components

### 1. UserManagement.js
- Complete user management with CRUD operations
- Role-based user statistics
- Advanced search and filtering
- User status management
- Bulk operations support

### 2. LibraryManagement.js
- Comprehensive library management
- Book inventory with CRUD operations
- Request approval workflow
- Issued books tracking
- Overdue book management
- Category-wise organization

### 3. StoreManagement.js
- Complete store inventory management
- Item CRUD operations with stock tracking
- Request approval and fulfillment
- Low stock alerts
- Category-wise organization
- Supplier management

### 4. Analytics.js
- Comprehensive system analytics
- Interactive charts and graphs
- User activity trends
- Most requested books/items
- System usage statistics
- Exportable reports

### 5. SystemSettings.js
- System configuration management
- Security settings
- Notification preferences
- Backup and maintenance tools
- System health monitoring

## Features

- **Professional UI**: Navy blue theme with modern Material-UI components
- **Real-time Data**: Live updates and refresh capabilities
- **Responsive Design**: Works on all device sizes
- **Role-based Access**: Admin-only access with proper authentication
- **Data Visualization**: Charts and graphs for better insights
- **Export Functionality**: Export data and reports
- **Search & Filter**: Advanced search and filtering options
- **Pagination**: Efficient data loading with pagination
- **Error Handling**: Comprehensive error handling and user feedback

## Usage

These components are automatically loaded for admin users through the dashboard routing system. Access is restricted to users with admin role only.

## API Integration

All components integrate with the backend API routes:
- `/api/users/*` - User management
- `/api/library/*` - Library operations
- `/api/store/*` - Store operations
- `/api/analytics/*` - Analytics data
- `/api/admin/*` - System settings and admin operations
