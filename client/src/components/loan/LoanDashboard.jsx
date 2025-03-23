import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Container,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  LinearProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';

const LoanDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/loans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoans(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch loans');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success'
    };
    return colors[status] || 'default';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDocument(null);
  };

  if (loading) return <Box sx={{ textAlign: 'center', mt: 4 }}>Loading...</Box>;
  if (error) return <Box sx={{ textAlign: 'center', mt: 4, color: 'error.main' }}>{error}</Box>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              Loan Dashboard
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your Loan Applications
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Application Date</TableCell>
                      <TableCell>Loan Amount</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Term</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Documents</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loans.map((loan) => (
                      <TableRow key={loan._id}>
                        <TableCell>{formatDate(loan.applicationDate)}</TableCell>
                        <TableCell>{formatCurrency(loan.loanAmount)}</TableCell>
                        <TableCell>{loan.loanPurpose}</TableCell>
                        <TableCell>{loan.term} months</TableCell>
                        <TableCell>
                          <Chip
                            label={loan.status.toUpperCase()}
                            color={getStatusColor(loan.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {loan.documents && loan.documents.map((doc, index) => (
                            <Button
                              key={index}
                              variant="text"
                              size="small"
                              onClick={() => handleDocumentClick(doc)}
                            >
                              Document {index + 1}
                            </Button>
                          ))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          {selectedDocument && (
            <iframe
              src={selectedDocument}
              style={{ width: '100%', height: '500px', border: 'none' }}
              title="Document Preview"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LoanDashboard;