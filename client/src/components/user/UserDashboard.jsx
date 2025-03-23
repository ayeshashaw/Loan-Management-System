import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RepaymentCalendar from './RepaymentCalendar';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loans, setLoans] = useState([]);
  const [payments, setPayments] = useState({
    upcoming: [],
    recent: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    personalInfo: {
      phoneNumber: '',
      address: '',
      dateOfBirth: ''
    },
    financialInfo: {
      employmentStatus: '',
      monthlyIncome: '',
      creditScore: ''
    }
  });
  const [isEditing, setIsEditing] = useState(false);

  // Check authentication and redirect if not authenticated
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch user data, loans, and payments data
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([
          fetchUserData(),
          fetchLoans(),
          fetchPayments()
        ]);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch user profile data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get('/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Set user data with registration details
      setUserData({
        name: response.data.name || '',
        email: response.data.email || '',
        personalInfo: {
          phoneNumber: response.data.personalInfo?.phoneNumber || '',
          address: response.data.personalInfo?.address || '',
          dateOfBirth: response.data.personalInfo?.dateOfBirth || ''
        },
        financialInfo: {
          employmentStatus: response.data.financialInfo?.employmentStatus || '',
          monthlyIncome: response.data.financialInfo?.monthlyIncome || '',
          creditScore: response.data.financialInfo?.creditScore || ''
        }
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to load user data');
        throw error;
      }
    }
  };

  // Fetch loan applications
  const fetchLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get('/api/loans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setLoans(response.data);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast.error(error.response?.data?.message || 'Failed to load loan applications');
      throw error;
    }
  };

  // Fetch payment data
  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // This endpoint doesn't appear to be implemented in the current code
      // For now, we'll use placeholder data
      // When the API is ready, uncomment and use this code:
      /*
      const response = await axios.get('/api/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setPayments({
        upcoming: response.data.upcoming || [],
        recent: response.data.recent || []
      });
      */
      
      // Placeholder data - replace with API call when available
      setPayments({
        upcoming: [
          { id: 1, loanType: 'Home Loan', dueDate: 'June 15, 2023', amount: 1250.00 }
        ],
        recent: [
          { id: 1, loanType: 'Personal Loan', paidDate: 'May 15, 2023', amount: 450.00, status: 'Completed' }
        ]
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment data');
      throw error;
    }
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      setError(null);
      
      // Validate required fields
      if (!userData.name || !userData.personalInfo?.phoneNumber || !userData.personalInfo?.address) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate phone number format
      const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}$/;
      if (!phoneRegex.test(userData.personalInfo.phoneNumber)) {
        toast.error('Please enter a valid phone number');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.put('/api/users/me', userData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setIsEditing(false);
      toast.success('Profile updated successfully');
      
      // Refresh user data
      await fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (loanId, documentIndex, file) => {
    try {
      if (!file) return;

      const formData = new FormData();
      formData.append('document', file);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.put(`/api/loans/${loanId}/documents/${documentIndex}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      toast.success('Document updated successfully');
      
      // Refresh loans data
      await fetchLoans();
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    }
  };

  // Get color for status chip
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'under_review':
        return 'info';
      case 'rejected':
        return 'error';
      case 'active':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (loading || authLoading) {
    return (
      <div className="loading-container">
        <CircularProgress />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="lendwise-app">
      {/* Header/Navigation */}
      <header className="header">
        <div className="container header-container">
          <div className="logo-container">
            <div className="logo">L</div>
            <h1 className="logo-text">LendWise</h1>
          </div>
          <div className="header-buttons">
            <Button 
              variant="contained"
              onClick={handleLogout}
              sx={{ 
                backgroundColor: 'error.main',
                '&:hover': { backgroundColor: 'error.dark' },
                fontWeight: 'bold',
                marginRight: 4,
                boxShadow: 2,
                borderRadius: 5,
              }}
              className="logout-btn"
            >
              Logout
            </Button>
            <button 
              className="apply-button" 
              onClick={() => navigate('/apply')}
            >
              Apply Now
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Dashboard</h1>
            <p>Monitor your loan applications and manage your payments</p>
          </div>
          <div className="header-actions">
  
            
            <button className="btn-primary" onClick={() => navigate('/apply')}>
              New Application
            </button>
          </div>
        </div>

        <div className="dashboard-tabs">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            My Applications
          </button>
          <button
            className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button
            className={`tab-btn ${activeTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setActiveTab('calendar')}
          >
            Payment Calendar
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="dashboard-overview">
            <div className="profile-section">
              <div className="section-header">
                <h2>Personal Information</h2>
                <button 
                  className="btn-primary-small" 
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>
              <div className="profile-group">
                <div className="profile-fields">
                  <div className="form-group">
                    <label>Full Name <span className="required">*</span></label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.name || ''}
                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                        placeholder="Enter your full name"
                        required
                      />
                    ) : (
                      <p>{userData.name || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <p>{userData.email || 'Not provided'}</p>
                  </div>
                  <div className="form-group">
                    <label>Phone Number <span className="required">*</span></label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={userData.personalInfo?.phoneNumber || ''}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            personalInfo: { ...userData.personalInfo, phoneNumber: e.target.value }
                          })
                        }
                        placeholder="Enter your phone number"
                        pattern="[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4}"
                        required
                      />
                    ) : (
                      <p>{userData.personalInfo?.phoneNumber || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Address <span className="required">*</span></label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={userData.personalInfo?.address || ''}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            personalInfo: { ...userData.personalInfo, address: e.target.value }
                          })
                        }
                        placeholder="Enter your address"
                        required
                      />
                    ) : (
                      <p>{userData.personalInfo?.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="section-header">
                <h2>Financial Information</h2>
              </div>
              <div className="profile-group">
                <div className="profile-fields">
                  <div className="form-group">
                    <label>Employment Status</label>
                    {isEditing ? (
                      <select
                        value={userData.financialInfo?.employmentStatus || ''}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            financialInfo: { ...userData.financialInfo, employmentStatus: e.target.value }
                          })
                        }
                      >
                        <option value="">Select status</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Unemployed">Unemployed</option>
                        <option value="Retired">Retired</option>
                      </select>
                    ) : (
                      <p>{userData.financialInfo?.employmentStatus || 'Not provided'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Monthly Income</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={userData.financialInfo?.monthlyIncome || ''}
                        onChange={(e) =>
                          setUserData({
                            ...userData,
                            financialInfo: { ...userData.financialInfo, monthlyIncome: e.target.value }
                          })
                        }
                        placeholder="Enter your monthly income"
                      />
                    ) : (
                      <p>{userData.financialInfo?.monthlyIncome ? `$${userData.financialInfo.monthlyIncome}` : 'Not provided'}</p>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Credit Score</label>
                    <p>{userData.financialInfo?.creditScore || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            

              <div className="overview-card">
                <div className="card-header">
                  <h2>Application Status</h2>
                </div>
                <div className="card-content">
                  <div className="icon-summary">
                    <div className="icon-circle light-blue">
                      <i className="fa fa-file"></i>
                    </div>
                    <div className="summary-text">
                      {loans.length > 0 ? (
                        <>
                          <h3>{loans.filter(loan => loan.status.toLowerCase() !== 'closed').length} active</h3>
                          <p>{loans[0].loanPurpose}: {loans[0].status.replace('_', ' ')}</p>
                        </>
                      ) : (
                        <>
                          <h3>No applications</h3>
                          <p>Apply for a loan to get started</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <button 
                    className="btn-link"
                    onClick={() => loans.length > 0 ? setActiveTab('applications') : navigate('/apply')}
                  >
                    {loans.length > 0 ? 'Check Status ' : 'Apply Now '}
                    <i className="fa fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
          
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <div className="section-header">
              <h2>Loan Applications</h2>
              <p>Track the status of your loan applications</p>
            </div>
            <TableContainer component={Paper} sx={{ mt: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Application Date</TableCell>
                    <TableCell>Loan Amount</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Term</TableCell>
                    <TableCell>Interest Rate</TableCell>
                    <TableCell>Monthly Payment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loans.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No loan applications found. <Link to="/apply">Apply for a loan</Link>
                      </TableCell>
                    </TableRow>
                  ) : (
                    loans.map((loan) => (
                      <TableRow key={loan._id} hover>
                        <TableCell>{new Date(loan.applicationDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR'
                          }).format(loan.loanAmount)}
                        </TableCell>
                        <TableCell>{loan.loanPurpose}</TableCell>
                        <TableCell>{loan.term} months</TableCell>
                        <TableCell>{(loan.interestRate * 100).toFixed(2)}%</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR'
                          }).format(loan.monthlyPayment)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={loan.status.replace('_', ' ').toUpperCase()}
                            color={getStatusColor(loan.status)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <button 
                            className="btn-link"
                            onClick={() => navigate(`/loans/${loan._id}`)}
                          >
                            View Details
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        {activeTab === 'calendar' && (
          <RepaymentCalendar loans={loans} />
        )}

        {activeTab === 'payments' && (
          <div className="payments-container">
            <div className="section-header">
              <h2>Payment History</h2>
              <button 
                className="btn-primary"
                disabled={payments.upcoming.length === 0}
                onClick={() => {
                  if (payments.upcoming.length > 0) {
                    // Handle payment logic
                    toast.info('Payment feature coming soon');
                  }
                }}
              >
                Make a Payment
              </button>
            </div>

            <div className="payments-section">
              <div className="upcoming-payments">
                <h3>Upcoming Payments</h3>
                <p>Scheduled loan payments due soon</p>

                {payments.upcoming.length === 0 ? (
                  <div className="empty-state">
                    <p>No upcoming payments scheduled</p>
                  </div>
                ) : (
                  payments.upcoming.map((payment) => (
                    <div key={payment.id} className="payment-item">
                      <div className="payment-icon">
                        <div className="icon-circle orange">
                          <i className="fa fa-calendar"></i>
                        </div>
                      </div>
                      <div className="payment-details">
                        <h4>{payment.loanType}</h4>
                        <p>Due: {payment.dueDate}</p>
                      </div>
                      <div className="payment-amount">
                        <h3>${payment.amount.toFixed(2)}</h3>
                      </div>
                      <button 
                        className="btn-primary-small"
                        onClick={() => toast.info('Payment feature coming soon')}
                      >
                        Pay Now
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="recent-payments">
                <h3>Recent Payments</h3>
                <p>Your payment history for the last 90 days</p>

                {payments.recent.length === 0 ? (
                  <div className="empty-state">
                    <p>No recent payment history</p>
                  </div>
                ) : (
                  payments.recent.map((payment) => (
                    <div key={payment.id} className="payment-item">
                      <div className="payment-icon">
                        <div className="icon-circle green">
                          <i className="fa fa-check"></i>
                        </div>
                      </div>
                      <div className="payment-details">
                        <h4>{payment.loanType}</h4>
                        <p>Paid: {payment.paidDate}</p>
                      </div>
                      <div className="payment-amount">
                        <h3>${payment.amount.toFixed(2)}</h3>
                      </div>
                      <span className="status-badge status-completed">
                        {payment.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="documents-container">
            <div className="section-header">
              <h2>Document Center</h2>
            </div>

            {loans.length === 0 ? (
              <div className="empty-state">
                <p>No loan applications found. <Link to="/apply">Apply for a loan</Link> to upload documents.</p>
              </div>
            ) : (
              <div className="documents-grid">
                {loans.map((loan) => (
                  <div key={loan._id} className="document-section">
                    <h3>Loan Application Documents - {loan.loanPurpose}</h3>
                    <p>Application Date: {new Date(loan.applicationDate).toLocaleDateString()}</p>
                    <p>Status: {loan.status.replace('_', ' ')}</p>

                    {!loan.documents || loan.documents.length === 0 ? (
                      <p>No documents uploaded for this loan application</p>
                    ) : (
                      loan.documents.map((doc, index) => (
                        <div key={index} className="document-item">
                          <div className="document-icon">
                            <i className="fa fa-file-alt"></i>
                          </div>
                          <div className="document-details">
                            <h4>Document {index + 1}</h4>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              style={{ display: 'none' }}
                              id={`document-upload-${loan._id}-${index}`}
                              onChange={(e) => handleDocumentUpload(loan._id, index, e.target.files[0])}
                            />
                          </div>
                          <div className="document-actions">
                            <button
                              className="btn-icon"
                              onClick={() => {
                                if (doc) {
                                  window.open(doc, '_blank');
                                } else {
                                  toast.error('Document not available');
                                }
                              }}
                            >
                              <i className="fa fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => {
                                if (doc) {
                                  const link = document.createElement('a');
                                  link.href = doc;
                                  link.download = `document-${index + 1}`;
                                  link.click();
                                } else {
                                  toast.error('Document not available for download');
                                }
                              }}
                            >
                              <i className="fa fa-download"></i>
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => document.getElementById(`document-upload-${loan._id}-${index}`).click()}
                            >
                              <i className="fa fa-upload"></i>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;