import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/home/Home';
import { createTheme } from '@mui/material';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserDashboard from './components/user/UserDashboard';
import ProtectedRoute from './ProtectedRoute';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import LoanApplication from './components/loan/LoanApplication';
import LoanStatus from './components/loan/LoanStatus';
import LoanHistory from './components/loan/LoanHistory';
import Profile from './components/user/Profile';
import Dashboard from './components/user/Dashboard';
import { ToastContainer } from 'react-toastify';



function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/apply" element={
          <ProtectedRoute>
            <LoanApplication />
          </ProtectedRoute>
        } />
        <Route path="/admin/Admindashboard" element={
          <ProtectedRoute adminRequired>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
