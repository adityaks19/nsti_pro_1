import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

import DashboardLayout from '../components/common/DashboardLayout';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import LibrarianDashboard from '../components/dashboards/LibrarianDashboard';
import StoreDashboard from '../components/dashboards/StoreDashboard';
import TODashboard from '../components/dashboards/TODashboard';
import TeacherDashboard from '../components/dashboards/TeacherDashboard';
import StudentDashboard from '../components/dashboards/StudentDashboard';

// Library Components
import LibraryBooks from '../components/library/LibraryBooks';
import BookRequests from '../components/library/BookRequests';
import BooksList from '../components/library/BooksList';
import AddBook from '../components/library/AddBook';
import StudentsData from '../components/library/StudentsData';

// Store Components
import StoreInventory from '../components/store/StoreInventory';
import StoreRequests from '../components/store/StoreRequests';
import StoreAddItem from '../components/store/StoreAddItem';

// Teacher Components
import TeacherLibrary from '../components/teacher/TeacherLibrary';
import TeacherStore from '../components/teacher/TeacherStore';
import MyStudents from '../components/teacher/MyStudents';
import TeacherLeaveApplications from '../components/teacher/TeacherLeaveApplications';

// TO Components
import TOLeaveApplications from '../components/to/TOLeaveApplications';
import TOLibrary from '../components/to/TOLibrary';
import TOStore from '../components/to/TOStore';
import TOStudentManagement from '../components/TOStudentManagement';
import TOLeaveManagement from '../components/TOLeaveManagement';
import TOStudentManagementWrapper from '../components/to/TOStudentManagementWrapper';

// Student Components
import StudentLibrary from '../components/student/StudentLibrary';
import StudentLeaveApplication from '../components/student/StudentLeaveApplication';

// User Management
import UserManagement from '../components/users/UserManagement';
import Profile from '../components/Profile';

// Admin Components
import AdminUserManagement from '../components/admin/UserManagement';
import AdminLibraryManagement from '../components/admin/LibraryManagement';
import AdminStoreManagement from '../components/admin/StoreManagement';
import Analytics from '../components/admin/Analytics';
import SystemSettings from '../components/admin/SystemSettings';

const Dashboard = () => {
  const { user } = useAuth();

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'librarian':
        return <LibrarianDashboard />;
      case 'store':
        return <StoreDashboard />;
      case 'to':
        return <TODashboard />;
      case 'teacher':
        return <TeacherDashboard />;
      case 'student':
        return <StudentDashboard />;
      default:
        return <div>Dashboard not available for your role</div>;
    }
  };

  const getDashboardTitle = () => {
    switch (user?.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'librarian':
        return 'Library Management';
      case 'store':
        return 'Store Management';
      case 'to':
        return 'Training Officer Dashboard';
      case 'teacher':
        return 'Teacher Dashboard';
      case 'student':
        return 'Student Dashboard';
      default:
        return 'NSTI College';
    }
  };

  return (
    <DashboardLayout title={getDashboardTitle()}>
      <Routes>
        <Route path="/" element={getDashboardComponent()} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Librarian Routes */}
        <Route path="/librarian/dashboard" element={<LibrarianDashboard />} />
        <Route path="/librarian/books" element={<BooksList />} />
        <Route path="/librarian/add-book" element={<AddBook />} />
        <Route path="/librarian/requests" element={<BookRequests />} />
        <Route path="/librarian/students" element={<StudentsData />} />
        
        {/* Library Routes - For all users */}
        <Route path="/library/books" element={<LibraryBooks />} />
        <Route path="/library/requests" element={<BookRequests />} />
        <Route path="/library/add-book" element={<AddBook />} />
        <Route path="/library/manage-books" element={<BooksList />} />
        <Route path="/library/students" element={<StudentsData />} />
        
        {/* Store Routes */}
        <Route path="/store/inventory" element={<StoreInventory />} />
        <Route path="/store/requests" element={<StoreRequests />} />
        <Route path="/store/add-item" element={<StoreAddItem />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/library" element={<TeacherLibrary />} />
        <Route path="/teacher/store" element={<TeacherStore />} />
        <Route path="/my-students" element={<MyStudents />} />
        <Route path="/teacher/leave-applications" element={<TeacherLeaveApplications />} />
        
        {/* TO Routes */}
        <Route path="/to/leave-applications" element={<TOLeaveApplications />} />
        <Route path="/to/library" element={<TOLibrary />} />
        <Route path="/to/store" element={<TOStore />} />
        <Route path="/to/students" element={<TOStudentManagementWrapper />} />
        <Route path="/to/leave-management" element={<TOLeaveManagement />} />
        
        {/* Additional TO Routes for proper navigation */}
        <Route path="/leave-applications" element={<TOLeaveApplications />} />
        <Route path="/users" element={<TOStudentManagementWrapper />} />
        
        {/* Student Routes */}
        <Route path="/student/library" element={<StudentLibrary />} />
        <Route path="/student/leave-application" element={<StudentLeaveApplication />} />
        
        {/* User Management Routes */}
        {(user?.role === 'admin' || user?.role === 'to') && (
          <Route path="/users" element={<UserManagement />} />
        )}
        
        {/* Admin Routes */}
        {user?.role === 'admin' && (
          <>
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/library" element={<AdminLibraryManagement />} />
            <Route path="/admin/store" element={<AdminStoreManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
          </>
        )}
      </Routes>
    </DashboardLayout>
  );
};

export default Dashboard;
