const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loanAmount: {
    type: Number,
    required: true
  },
  loanPurpose: {
    type: String,
    required: true
  },
  interestRate: {
    type: Number,
    required: true
  },
  term: {
    type: Number,
    required: true,
    comment: 'Loan term in months'
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'active', 'closed'],
    default: 'pending'
  },
  monthlyPayment: {
    type: Number,
    required: true
  },
  documents: [{
    type: String,
    required: true
  }],
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  repaymentSchedule: [{
    dueDate: Date,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    },
    paymentDate: Date
  }],
  notes: [{
    content: String,
    date: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
});

module.exports = mongoose.model('Loan', LoanSchema);