import React, { useState, useEffect } from 'react';
import './RepaymentCalendar.css';

const RepaymentCalendar = () => {
  // State for calendar dates and selected date
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  
  // Mock payment data
  useEffect(() => {
    // Simulating API fetch for payment data
    const fetchPaymentData = () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();
      
      // Mock data structure for payment schedule
      const paymentData = [
        {
          date: new Date(currentYear, currentMonth, 20),
          amount: 325.28,
          status: 'due',
          type: 'Personal Loan',
          loanId: 'LA-2023-1205',
          remainingBalance: 8754.32
        },
        {
          date: new Date(currentYear, currentMonth, 25),
          amount: 1850.75,
          status: 'upcoming',
          type: 'Home Loan',
          loanId: 'LA-2023-0935',
          remainingBalance: 285430.65
        },
        {
          date: new Date(currentYear, currentMonth - 1, 20),
          amount: 325.28,
          status: 'paid',
          paidDate: new Date(currentYear, currentMonth - 1, 20),
          type: 'Personal Loan',
          loanId: 'LA-2023-1205',
          remainingBalance: 9079.60
        },
        {
          date: new Date(currentYear, currentMonth - 2, 18),
          amount: 325.28,
          status: 'paid',
          paidDate: new Date(currentYear, currentMonth - 2, 18),
          type: 'Personal Loan',
          loanId: 'LA-2023-1205',
          remainingBalance: 9404.88
        }
      ];
      
      setPayments(paymentData);
      
      // Show notification for payments due today
      const dueTodayPayments = paymentData.filter(payment => {
        const paymentDate = new Date(payment.date);
        return payment.status === 'due' && 
               paymentDate.getDate() === today.getDate() &&
               paymentDate.getMonth() === today.getMonth() &&
               paymentDate.getFullYear() === today.getFullYear();
      });
      
      if (dueTodayPayments.length > 0) {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 10000); // Hide after 10 seconds
      }
    };
    
    fetchPaymentData();
  }, []);
  
  // Helper to get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  
  // Get day of week for first day of month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };
  
  // Generate calendar days array
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Create blank cells for days before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', empty: true });
    }
    
    // Fill in days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      
      // Find payments for this day
      const dayPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate.getDate() === day && 
               paymentDate.getMonth() === currentMonth.getMonth() &&
               paymentDate.getFullYear() === currentMonth.getFullYear();
      });
      
      days.push({
        day,
        date,
        payments: dayPayments,
        hasPayments: dayPayments.length > 0,
        status: dayPayments.length > 0 ? dayPayments[0].status : null
      });
    }
    
    return days;
  };
  
  // Handle month navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
  };
  
  // Handle date selection
  const handleDateClick = (day) => {
    if (day.date) {
      setSelectedDate(day);
    }
  };
  
  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'due':
        return 'status-due';
      case 'overdue':
        return 'status-overdue';
      case 'upcoming':
        return 'status-upcoming';
      default:
        return '';
    }
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Get month and year display
  const monthYearDisplay = () => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(currentMonth);
  };
  
  // Calendar UI
  return (
    <div className="repayment-calendar-container">
      {showNotification && (
        <div className="payment-notification">
          <div className="notification-icon">
            <i className="fa fa-bell"></i>
          </div>
          <div className="notification-content">
            <h4>Payment Due Today!</h4>
            <p>You have a payment of {formatCurrency(325.28)} due today for Personal Loan.</p>
          </div>
          <button className="btn-primary-small">Pay Now</button>
          <button className="btn-icon" onClick={() => setShowNotification(false)}>
            <i className="fa fa-times"></i>
          </button>
        </div>
      )}

      <div className="calendar-header">
        <h2>Repayment Schedule</h2>
        <div className="calendar-controls">
          <button className="btn-icon" onClick={handlePreviousMonth}>
            <i className="fa fa-chevron-left"></i>
          </button>
          <h3>{monthYearDisplay()}</h3>
          <button className="btn-icon" onClick={handleNextMonth}>
            <i className="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-days">
          <div className="calendar-weekday">Sun</div>
          <div className="calendar-weekday">Mon</div>
          <div className="calendar-weekday">Tue</div>
          <div className="calendar-weekday">Wed</div>
          <div className="calendar-weekday">Thu</div>
          <div className="calendar-weekday">Fri</div>
          <div className="calendar-weekday">Sat</div>
          
          {generateCalendarDays().map((day, index) => (
            <div 
              key={index} 
              className={`calendar-day ${day.empty ? 'empty-day' : ''} ${day.hasPayments ? getStatusClass(day.status) : ''} ${selectedDate && selectedDate.day === day.day ? 'selected-day' : ''}`}
              onClick={() => !day.empty && handleDateClick(day)}
            >
              <div className="day-number">{day.day}</div>
              {day.hasPayments && (
                <div className="payment-indicator">
                  {day.status === 'due' && <span className="indicator-icon">!</span>}
                  {day.status === 'paid' && <span className="indicator-icon">✓</span>}
                  {day.status === 'upcoming' && <span className="indicator-icon">○</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="payment-details">
        {selectedDate && selectedDate.hasPayments ? (
          selectedDate.payments.map((payment, index) => (
            <div key={index} className={`payment-detail-card ${getStatusClass(payment.status)}`}>
              <div className="payment-header">
                <h3>{payment.type} Payment</h3>
                <span className={`status-badge ${getStatusClass(payment.status)}`}>
                  {payment.status === 'paid' ? 'Paid' : payment.status === 'due' ? 'Due Today' : payment.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                </span>
              </div>
              
              <div className="payment-info">
                <div className="payment-info-item">
                  <span className="info-label">Amount:</span>
                  <span className="info-value">{formatCurrency(payment.amount)}</span>
                </div>
                <div className="payment-info-item">
                  <span className="info-label">Date:</span>
                  <span className="info-value">{formatDate(payment.date)}</span>
                </div>
                {payment.status === 'paid' && (
                  <div className="payment-info-item">
                    <span className="info-label">Paid On:</span>
                    <span className="info-value">{formatDate(payment.paidDate)}</span>
                  </div>
                )}
                <div className="payment-info-item">
                  <span className="info-label">Loan ID:</span>
                  <span className="info-value">{payment.loanId}</span>
                </div>
                <div className="payment-info-item">
                  <span className="info-label">Remaining Balance:</span>
                  <span className="info-value">{formatCurrency(payment.remainingBalance)}</span>
                </div>
              </div>
              
              <div className="payment-actions">
                {(payment.status === 'due' || payment.status === 'upcoming') && (
                  <>
                    <button className="btn-primary">Make Payment</button>
                    <button className="btn-secondary">Request Extension</button>
                  </>
                )}
                {payment.status === 'paid' && (
                  <button className="btn-secondary">View Receipt</button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-payment-selected">
            <div className="empty-state-icon">
              <i className="fa fa-calendar"></i>
            </div>
            <h3>No Payment Selected</h3>
            <p>Select a date with a scheduled payment from the calendar to view its details</p>
          </div>
        )}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-indicator status-paid"></span>
          <span>Paid</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator status-due"></span>
          <span>Due Today</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator status-overdue"></span>
          <span>Overdue</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator status-upcoming"></span>
          <span>Upcoming</span>
        </div>
      </div>
    </div>
  );
};

export default RepaymentCalendar;