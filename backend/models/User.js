const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin']
  },

  personalInfo: {
    dateOfBirth: Date,
    address: String,
    phoneNumber: String,
    ssn: String
  },
  financialInfo: {
    employmentStatus: String,
    monthlyIncome: Number,
    creditScore: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);