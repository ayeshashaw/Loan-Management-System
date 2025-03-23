import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div className="profile-container">
      <div className="loading">Loading...</div>
    </div>;
  }

  if (error) {
    return <div className="profile-container">
      <div className="error">{error}</div>
    </div>;
  }

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <div className="profile-card">
        <div className="profile-header">
          <h2>{user?.name}</h2>
          <span className="user-role">{user?.role}</span>
        </div>
        <div className="profile-details">
          <div className="detail-row">
            <span className="label">Email</span>
            <span className="value">{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="label">Member Since</span>
            <span className="value">
              {new Date(user?.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;