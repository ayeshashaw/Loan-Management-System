import { useState, useEffect } from 'react';
import axios from 'axios';

// Token management functions
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Auth hook for user state management
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setUser(response.data);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return { user, loading };
};

export default useAuth;
