import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import SingleItemDetailPage from './components/SingleItemDetailPage'; 
import PostAdPage from './components/PostAdPage'; 
import './App.css';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading App...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/item/:id" element={<SingleItemDetailPage />} /> 
        <Route path="/post-ad" element={<PostAdPage />} /> 
      </Route>
      
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;