import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Welcome to Your Dashboard</h1>
          <p>Manage your loans and profile</p>
        </div>
        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >

          </button>
        </div>
      </div>
      <div className="profile-section">
        <div className="section-header">
          <h2>Profile Information</h2>
        </div>
        <div className="profile-fields">
          {/* Profile fields will be added here */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;