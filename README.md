# NSTI College Management System

A comprehensive college management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring a professional navy blue theme and role-based access control.

## 🎯 Features

### User Roles & Permissions

#### 👨‍💼 **Admin**
- Complete system oversight
- User management (all roles)
- Library and store management
- System analytics and reports
- Full CRUD operations on all modules

#### 📚 **Librarian**
- Complete library management (CRUD operations on books)
- Book request approval and management
- Issue and return books
- View student database (read-only)
- Track overdue books and fines

#### 🏪 **Store Manager**
- Complete inventory management (CRUD operations)
- Manage cleaning and stationary categories
- Approve/reject store requests
- Track stock levels and low inventory alerts
- Fulfill approved requests

#### 👨‍🏫 **Training Officer (TO)**
- Student management (CRUD operations)
- Request books from library
- Request items from store
- Student enrollment and profile management

#### 👨‍🎓 **Teacher**
- Request books from library
- Request items from store
- View available resources
- Track personal requests

#### 🎓 **Student**
- Request books from library
- View available books
- Track personal book requests and due dates
- View fines and payment status

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Toastify** - Notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finalpro
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nsti_college_db
   JWT_SECRET=nsti_college_management_jwt_secret_key_2024
   JWT_EXPIRE=30d
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Seed Demo Data**
   ```bash
   node scripts/seedData.js
   ```

7. **Start the Application**
   ```bash
   # Development mode (runs both backend and frontend)
   npm run dev
   
   # Or start separately
   # Backend only
   npm run server
   
   # Frontend only (in another terminal)
   npm run client
   ```

8. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nsti.edu | admin123 |
| Librarian | librarian@nsti.edu | lib123 |
| Store Manager | store@nsti.edu | store123 |
| Training Officer | to@nsti.edu | to123456 |
| Teacher | teacher@nsti.edu | teacher123 |
| Student | student@nsti.edu | student123 |

## 📱 Application Features

### 🎨 **Professional UI/UX**
- Navy blue theme with modern design
- Responsive layout for all devices
- Intuitive navigation and user experience
- Professional dashboard for each role
- Interactive charts and data visualization

### 📚 **Library Management**
- **Book Catalog**: Complete book information with ISBN, author, category
- **Request System**: Students, teachers, and TO can request books
- **Approval Workflow**: Librarian approves → Issues → Tracks returns
- **Fine Management**: Automatic calculation for overdue books
- **Search & Filter**: Advanced search by title, author, category

### 🏪 **Store Management**
- **Inventory Categories**: Cleaning supplies and stationary items
- **Stock Management**: Track quantities, minimum stock levels
- **Request System**: TO, Admin, and Teachers can request items
- **Approval Process**: Store manager approves and fulfills requests
- **Low Stock Alerts**: Automatic notifications for reordering

### 👥 **User Management**
- **Role-based Access**: Different permissions for each role
- **Student Management**: TO can manage student profiles
- **Profile Management**: Users can update their information
- **Authentication**: Secure JWT-based authentication

### 📊 **Dashboard Analytics**
- **Admin Dashboard**: System-wide statistics and alerts
- **Role-specific Dashboards**: Tailored information for each user type
- **Visual Charts**: Bar charts, pie charts for data representation
- **Recent Activity**: Track recent actions and requests

## 🗂️ Project Structure

```
finalpro/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
├── models/                 # MongoDB models
├── routes/                 # Express routes
├── middleware/             # Custom middleware
├── scripts/                # Utility scripts
└── server.js              # Main server file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Library
- `GET /api/library/books` - Get all books
- `POST /api/library/books` - Add new book (Librarian)
- `POST /api/library/request` - Request a book
- `GET /api/library/requests` - Get book requests
- `PUT /api/library/requests/:id/approve` - Approve request

### Store
- `GET /api/store/items` - Get store items
- `POST /api/store/items` - Add new item (Store Manager)
- `POST /api/store/request` - Request store item
- `GET /api/store/requests` - Get store requests
- `PUT /api/store/requests/:id/approve` - Approve request

### Users
- `GET /api/users` - Get users (role-based)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🎯 Key Highlights

### 🔒 **Security Features**
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization

### 📱 **Responsive Design**
- Mobile-first approach
- Professional navy blue theme
- Consistent UI across all devices
- Accessibility compliant

### ⚡ **Performance**
- Optimized database queries
- Efficient state management
- Lazy loading components
- Caching strategies

### 🔄 **Real-time Features**
- Live dashboard updates
- Instant notifications
- Real-time stock tracking
- Activity feeds

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build
cd ..

# Start production server
npm start
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**NSTI Development Team**
- Professional college management solution
- Built with modern web technologies
- Designed for scalability and maintainability

---

## 🎉 Presentation Ready

This system is designed to impress directors and stakeholders with:
- **Professional appearance** with navy blue theme
- **Comprehensive functionality** covering all college operations
- **Role-based security** ensuring proper access control
- **Modern technology stack** using industry standards
- **Scalable architecture** for future enhancements
- **User-friendly interface** requiring minimal training

Perfect for demonstrating a complete college management solution! 🏆
