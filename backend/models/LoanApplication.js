const mongoose = require('mongoose');

const LoanApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Personal Info
  personalInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  // Loan Details
  loanDetails: {
    loanType: String,
    loanAmount: Number,
    loanTerm: Number,
    loanPurpose: String
  },
  // Financial Info
  financialInfo: {
    employmentStatus: String,
    employerName: String,
    monthlyIncome: Number,
    otherIncome: Number,
    creditScoreRange: String
  },
  // Documents
  documents: {
    photoId: String,
    incomeProof: String,
    idVerification: Boolean,
    incomeVerification: Boolean,
    termsAccepted: Boolean
  },
  // Application Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
    default: 'draft'
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date
});

// Update the timestamp before saving
LoanApplicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('LoanApplication', LoanApplicationSchema);