import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LoanHistory.css";

const LoanHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLoanHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/loans/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch loan history");
        setLoading(false);
      }
    };

    fetchLoanHistory();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (history.length === 0) {
    return (
      <div className="no-history">
        No loan history available
      </div>
    );
  }

  return (
    <div className="loan-history-container">
      <h1>Loan History</h1>
      <div className="history-list">
        {history.map((loan) => (
          <div key={loan._id} className="history-item">
            <div className="history-header">
              <h2>Loan #{loan.loanId}</h2>
              <span className={`status-badge status-${loan.status.toLowerCase()}`}>
                {loan.status}
              </span>
            </div>
            <div className="history-details">
              <div className="detail-row">
                <span className="label">Amount</span>
                <span className="value">${loan.amount.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="label">Application Date</span>
                <span className="value">
                  {new Date(loan.applicationDate).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Purpose</span>
                <span className="value">{loan.purpose}</span>
              </div>
              <div className="detail-row">
                <span className="label">Term</span>
                <span className="value">{loan.term} months</span>
              </div>
              {loan.approvalDate && (
                <div className="detail-row">
                  <span className="label">Approval Date</span>
                  <span className="value">
                    {new Date(loan.approvalDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            {loan.comments && (
              <div className="comments-section">
                <h3>Comments</h3>
                <p>{loan.comments}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoanHistory;