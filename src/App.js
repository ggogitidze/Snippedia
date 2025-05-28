import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MainFeed from './pages/MainFeed';
import SnippetDetail from './pages/SnippetDetail';
import ProfilePage from './pages/ProfilePage';
import SubmitPage from './pages/SubmitPage';

// API URL configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

function App() {
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      window.location.replace('/feed');
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/feed" element={<MainFeed />} />
        <Route path="/snippet/:id" element={<SnippetDetail />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/submit" element={<SubmitPage />} />
      </Routes>
    </Router>
  );
}

export default App; 