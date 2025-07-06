import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LibraryBooks from './LibraryBooks';
import BookRequests from './BookRequests';
import AddBook from './AddBook';
import BooksList from './BooksList';
import StudentsData from './StudentsData';
import { useAuth } from '../../contexts/AuthContext';

const LibraryRoutes = () => {
  const { user } = useAuth();
  const isLibrarian = user?.role === 'librarian' || user?.role === 'admin';

  return (
    <Routes>
      {/* Default route - Books for all users */}
      <Route index element={<LibraryBooks />} />
      <Route path="books" element={<LibraryBooks />} />
      
      {/* Book requests - all users can view their requests */}
      <Route path="requests" element={<BookRequests />} />
      
      {/* Librarian-only routes */}
      {isLibrarian && (
        <>
          <Route path="add-book" element={<AddBook />} />
          <Route path="manage-books" element={<BooksList />} />
          <Route path="students" element={<StudentsData />} />
        </>
      )}
      
      {/* Fallback to books */}
      <Route path="*" element={<LibraryBooks />} />
    </Routes>
  );
};

export default LibraryRoutes;
