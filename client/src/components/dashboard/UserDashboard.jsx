import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const navigate = useNavigate();

  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [navigate, isAuthenticated, loading]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to Your Dashboard
          </Typography>
          <Typography variant="body1" paragraph>
            Here you can manage your loan applications and account settings.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserDashboard;