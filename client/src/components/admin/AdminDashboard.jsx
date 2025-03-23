import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Admin Dashboard
          </Typography>
          <Typography variant="body1">
            Admin management interface for user accounts, loan applications, and system settings.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboard;