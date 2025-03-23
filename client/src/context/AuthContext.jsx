import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/auth/validate', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        // Extract role from the response data structure
        const role = response.data.user?.role || response.data.role;
        setUserRole(role);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token validation error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setUserRole(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (token, decodedToken) => {
    try {
      localStorage.setItem('token', token);
      const userRole = decodedToken.user?.role || 'user';
      setUserRole(userRole);
      setIsAuthenticated(true);
      
      // Update axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to complete login process');
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      setUserRole(null);
      setIsAuthenticated(false);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to complete logout process');
    }
  };

  return (
    <AuthContext.Provider value={{ userRole, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};