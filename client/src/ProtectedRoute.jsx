import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminRequired && userRole !== 'admin') {
    return <Navigate to="/admin/Admindashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;