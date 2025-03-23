import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoanStatus.css';

const LoanStatus = () => {
  const [loanApplications, setLoanApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoanApplications = async () => {
      try {
        const response = await axios.get('/api/loans/status', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setLoanApplications(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch loan applications');
        setLoading(false);
      }
    };

    fetchLoanApplications();
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'pending':
        return 'status-pending';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="loan-status-container">
      <h1>Loan Application Status</h1>
      <div className="loan-applications-list">
        {loanApplications.length === 0 ? (
          <div className="no-applications">No loan applications found</div>
        ) : (
          loanApplications.map((application) => (
            <div key={application._id} className="loan-application-card">
              <div className="application-header">
                <h2>Loan ID: {application._id}</h2>
                <span className={`status-badge ${getStatusClass(application.status)}`}>
                  {application.status}
                </span>
              </div>
              <div className="application-details">
                <div className="detail-row">
                  <span className="label">Amount Requested:</span>
                  <span className="value">${application.amount}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Purpose:</span>
                  <span className="value">{application.purpose}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Application Date:</span>
                  <span className="value">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {application.status === 'approved' && (
                  <div className="detail-row">
                    <span className="label">Approved Amount:</span>
                    <span className="value">${application.approvedAmount}</span>
                  </div>
                )}
                {application.comments && (
                  <div className="comments-section">
                    <h3>Comments</h3>
                    <p>{application.comments}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoanStatus;