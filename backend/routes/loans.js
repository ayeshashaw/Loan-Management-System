const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const LoanApplication = require('../models/LoanApplication');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads/'),
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Get all loans (admin can see all, users see their own)
router.get('/', auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.user.id }).sort({ applicationDate: -1 });
    res.json(loans);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

// Get pending loan applications
router.get('/my-applications', auth, async (req, res) => {
  try {
    const applications = await Loan.find({ 
      user: req.user.id,
      status: 'pending'
    }).sort({ applicationDate: -1 });

    res.json(applications);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({
      msg: 'Failed to fetch applications',
      error: process.env.NODE_ENV === 'development' ? err.message : null
    });
  }
});



// Submit new loan application
router.post('/submit', [auth, upload.array('documents')], async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ msg: 'User authentication required' });
    }

    const { loanAmount, loanType, loanPurpose, loanTerm } = req.body;
    
    // Enhanced validation for required fields
    const requiredFields = {
      loanAmount: { value: loanAmount, type: 'number', min: 1000 },
      loanType: { value: loanType, type: 'string', options: ['personal', 'business', 'education', 'home'] },
      loanPurpose: { value: loanPurpose, type: 'string', minLength: 10 },
      loanTerm: { value: loanTerm, type: 'number', min: 6, max: 360 }
    };

    const validationErrors = [];
    for (const [field, rules] of Object.entries(requiredFields)) {
      if (!rules.value) {
        validationErrors.push(`${field} is required`);
        continue;
      }

      if (rules.type === 'number') {
        const numValue = Number(rules.value);
        if (isNaN(numValue)) {
          validationErrors.push(`${field} must be a valid number`);
        } else {
          if (rules.min && numValue < rules.min) {
            validationErrors.push(`${field} must be at least ${rules.min}`);
          }
          if (rules.max && numValue > rules.max) {
            validationErrors.push(`${field} must not exceed ${rules.max}`);
          }
        }
      } else if (rules.type === 'string') {
        if (rules.options && !rules.options.includes(rules.value)) {
          validationErrors.push(`${field} must be one of: ${rules.options.join(', ')}`);
        }
        if (rules.minLength && rules.value.length < rules.minLength) {
          validationErrors.push(`${field} must be at least ${rules.minLength} characters`);
        }
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        msg: 'Validation failed',
        errors: validationErrors
      });
    }

    const interestRate = 0.05; // 5% interest rate (can be dynamic based on credit score)
    const monthlyPayment = (Number(loanAmount) * (1 + interestRate)) / Number(loanTerm);

    const loan = new Loan({
      user: req.user.id,
      loanAmount: Number(loanAmount),
      loanType,
      loanPurpose,
      interestRate,
      term: Number(loanTerm),
      monthlyPayment,
      documents: req.files ? req.files.map(file => `/uploads/${file.filename}`) : [],
      status: 'pending',
      applicationDate: new Date(),
      repaymentSchedule: generateRepaymentSchedule(Number(loanAmount), Number(loanTerm), monthlyPayment)
    });

    await loan.save();
    res.json(loan);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

// Get loan by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }
    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    res.json(loan);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});



// Update payment status
router.put('/:id/payment/:paymentId', auth, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    const payment = loan.repaymentSchedule.id(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }

    payment.status = req.body.status;
    if (req.body.status === 'paid') {
      payment.paymentDate = Date.now();
    }

    await loan.save();
    res.json(loan);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

// Helper function to generate repayment schedule
function generateRepaymentSchedule(loanAmount, term, monthlyPayment) {
  const schedule = [];
  let date = new Date();

  for (let i = 0; i < term; i++) {
    date = new Date(date.setMonth(date.getMonth() + 1));
    schedule.push({
      dueDate: new Date(date),
      amount: monthlyPayment,
      status: 'pending'
    });
  }

  return schedule;
}

// ===== MULTI-STEP LOAN APPLICATION ENDPOINTS =====

// Step 1: Save personal information
router.post('/personal-info', auth, async (req, res) => {
  try {
    // Find existing application or create new one
    let application = await LoanApplication.findOne({ 
      user: req.user.id,
      status: 'draft'
    });

    if (!application) {
      application = new LoanApplication({
        user: req.user.id,
        personalInfo: req.body,
        status: 'draft'
      });
    } else {
      application.personalInfo = req.body;
      application.updatedAt = Date.now();
    }

    await application.save();
    res.json(application);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

// Step 2: Save loan details
router.post('/loan-details', auth, async (req, res) => {
  try {
    // Find existing application
    let application = await LoanApplication.findOne({ 
      user: req.user.id,
      status: 'draft'
    });

    if (!application) {
      return res.status(400).json({ msg: 'Please complete personal information first' });
    }

    application.loanDetails = req.body;
    application.updatedAt = Date.now();
    await application.save();
    
    res.json(application);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

// Step 3: Save financial information
router.post('/financial-info', auth, async (req, res) => {
  try {
    // Find existing application
    let application = await LoanApplication.findOne({ 
      user: req.user.id,
      status: 'draft'
    });

    if (!application) {
      return res.status(400).json({ msg: 'Please complete previous steps first' });
    }

    application.financialInfo = req.body;
    application.updatedAt = Date.now();
    await application.save();
    
    res.json(application);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

// Step 4: Save documents
router.post('/documents', [auth, upload.fields([
  { name: 'photoId', maxCount: 1 },
  { name: 'incomeProof', maxCount: 1 }
])], async (req, res) => {
    if (!req.files || (!req.files.photoId && !req.files.incomeProof)) {
      return res.status(400).json({ msg: 'At least one document must be uploaded' });
    }
  try {
    // Find existing application
    let application = await LoanApplication.findOne({ 
      user: req.user.id,
      status: 'draft'
    });

    if (!application) {
      return res.status(400).json({ msg: 'Please complete previous steps first' });
    }

    // Handle file uploads
    const documents = {};
    
    if (req.files) {
      if (req.files.photoId) {
        documents.photoId = req.files.photoId[0].path;
      }
      
      if (req.files.incomeProof) {
        documents.incomeProof = req.files.incomeProof[0].path;
      }
    }
    
    // Handle verification checkboxes
    if (!req.body.idVerification || !req.body.incomeVerification || !req.body.termsAccepted) {
      return res.status(400).json({ msg: 'All verification checks must be completed' });
    }
    documents.idVerification = req.body.idVerification === 'true';
    documents.incomeVerification = req.body.incomeVerification === 'true';
    documents.termsAccepted = req.body.termsAccepted === 'true';

    application.documents = { ...application.documents, ...documents };
    application.updatedAt = Date.now();
    await application.save();
    
    res.json(application);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

// Final step: Submit application
router.post('/submit', auth, async (req, res) => {
  try {
    const { loanAmount, loanType, loanPurpose, loanTerm } = req.body;
    
    if (!loanAmount || !loanType || !loanPurpose || !loanTerm) {
      return res.status(400).json({ 
        msg: 'Missing required fields', 
        missingFields: [
          ...(!loanAmount ? ['loanAmount'] : []),
          ...(!loanType ? ['loanType'] : []),
          ...(!loanPurpose ? ['loanPurpose'] : []),
          ...(!loanTerm ? ['loanTerm'] : [])
        ]
      });
    }

    const application = await LoanApplication.findOneAndUpdate(
      { user: req.user.id, status: 'draft' },
      { 
        status: 'submitted',
        submittedAt: Date.now(),
        loanDetails: { loanType, loanAmount, loanPurpose, loanTerm } 
      },
      { new: true }
    );

    if (!application) {
      return res.status(400).json({ msg: 'No draft application found' });
    }

    // Create a new loan from the application data
    // Validate loan details
    if (!application.loanDetails.loanAmount || 
        !application.loanDetails.loanPurpose ||
        !application.loanDetails.loanTerm) {
      return res.status(400).json({ msg: 'Invalid loan details' });
    }
    if (parseInt(application.loanDetails.loanTerm) <= 0) {
      return res.status(400).json({ msg: 'Loan term must be a positive number' });
    }

    const loan = new Loan({
      user: req.user.id,
      loanAmount: parseFloat(application.loanDetails.loanAmount),
      loanPurpose: application.loanDetails.loanPurpose,
  loanPurpose,
      term: parseInt(application.loanDetails.loanTerm),
      interestRate: 0.05, // Default interest rate
      monthlyPayment: (parseFloat(application.loanDetails.loanAmount) * 1.05) / parseInt(application.loanDetails.loanTerm),
      documents: [
        application.documents.photoId,
        application.documents.incomeProof
      ].filter(Boolean),
      status: 'pending'
    });

    // Generate repayment schedule
    loan.repaymentSchedule = generateRepaymentSchedule(
      application.loanDetails.loanAmount,
      application.loanDetails.loanTerm,
      loan.monthlyPayment
    );

    // Update application status
    application.status = 'submitted';
    application.submittedAt = Date.now();

    // Save both documents
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await application.save({ session });
        await loan.save({ session });
      });
    } finally {
      session.endSession();
    }

    res.json({ 
      message: 'Application submitted successfully',
      loanId: loan._id
    });
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

// Get application status
router.get('/status', auth, async (req, res) => {
  try {
    const applications = await LoanApplication.find({ user: req.user.id })
      .sort({ updatedAt: -1 });
    res.json(applications);
  } catch (err) {
    console.error('Loan Submission Error:', { 
      message: err.message,
      stack: err.stack,
      body: req.body,
      files: req.files,
      user: req.user
    });
    
    let errorMessage = 'Application submission failed';
    if (err.name === 'ValidationError') {
      errorMessage = 'Database validation error';
    } else if (err.code === 'LIMIT_FILE_SIZE') {
      errorMessage = 'File size too large';
    }
    
    res.status(500).json({
      msg: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : null
    });
  }
});

function generateRepaymentSchedule(loanAmount, term, monthlyPayment) {
  const schedule = [];
  const startDate = new Date();
  
  for (let i = 0; i < term; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    
    schedule.push({
      dueDate,
      amount: monthlyPayment,
      status: 'pending',
      paymentDate: null
    });
  }
  return schedule;
}

module.exports = router;