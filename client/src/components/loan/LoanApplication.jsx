import React, { useState } from 'react';
import './LoanApplicationForm.css';
import { 
  savePersonalInfo, 
  saveLoanDetails, 
  saveFinancialInfo, 
  saveDocuments, 
  submitApplication 
} from '../../services/api';

const LoanApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info (step 1)
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    // Loan Details (step 2)
    loanDetails: {
      loanType: '',
      loanAmount: '',
      loanTerm: '',
      loanPurpose: ''
    },
    // Financial Info (step 3)
    financialInfo: {
      employmentStatus: '',
      employerName: '',
      monthlyIncome: '',
      otherIncome: '',
      creditScoreRange: ''
    },
    // Documents (step 4)
    documents: {
      photoId: null,
      incomeProof: null,
      idVerification: false,
      incomeVerification: false,
      termsAccepted: false
    }
  });

  const handleInputChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    });
  };

  const handleCheckboxChange = (section, field) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: !formData[section][field]
      }
    });
  };

  const handleFileUpload = (field, file) => {
    if (field === 'photoId') {
      handleInputChange('documents', 'photoId', file);
    } else if (field === 'incomeProof') {
      handleInputChange('documents', 'incomeProof', file);
    }
  };

  const nextStep = async () => {
    try {
      // Save data based on current step
      if (currentStep === 1) {
        await savePersonalInfo(formData.personalInfo);
      } else if (currentStep === 2) {
        await saveLoanDetails(formData.loanDetails);
      } else if (currentStep === 3) {
        await saveFinancialInfo(formData.financialInfo);
      }
      
      // If everything is successful, proceed to next step
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error(`Error saving form data for step ${currentStep}:`, error);
      alert('There was an error saving your information. Please try again.');
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const requiredFields = {
        loanAmount: formData.loanDetails.loanAmount,
        loanType: formData.loanDetails.loanType,
        loanPurpose: formData.loanDetails.loanPurpose,
        loanTerm: formData.loanDetails.loanTerm
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([_, value]) => !value)
        .map(([field]) => field);

      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // First save documents
      await saveDocuments(formData.documents);
      
      // Then submit the final application
      const response = await submitApplication({
        loanAmount: formData.loanDetails.loanAmount,
        loanType: formData.loanDetails.loanType,
        loanPurpose: formData.loanDetails.loanPurpose,
        loanTerm: formData.loanDetails.loanTerm
      });

      
      alert('Application submitted successfully!');
      console.log('Application response:', response);
      // Redirect to confirmation or dashboard page
      // window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    }
  };

  // Render each step of the form based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderLoanDetails();
      case 3:
        return renderFinancialInfo();
      case 4:
        return renderDocuments();
      default:
        return renderPersonalInfo();
    }
  };

  const renderPersonalInfo = () => {
    return (
      <div className="form-container">
        <h2>Personal Information</h2>
        <p>Your basic information</p>
        
        <div className="form-group">
          <label>First Name</label>
          <input 
            type="text" 
            value={formData.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Last Name</label>
          <input 
            type="text" 
            value={formData.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={formData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Phone</label>
          <input 
            type="tel" 
            value={formData.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Address</label>
          <input 
            type="text" 
            value={formData.personalInfo.address}
            onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input 
              type="text" 
              value={formData.personalInfo.city}
              onChange={(e) => handleInputChange('personalInfo', 'city', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>State</label>
            <input 
              type="text" 
              value={formData.personalInfo.state}
              onChange={(e) => handleInputChange('personalInfo', 'state', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Zip Code</label>
            <input 
              type="text" 
              value={formData.personalInfo.zipCode}
              onChange={(e) => handleInputChange('personalInfo', 'zipCode', e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="form-buttons">
          <button className="next-btn" onClick={nextStep}>Next</button>
        </div>
      </div>
    );
  };

  const renderLoanDetails = () => {
    return (
      <div className="form-container">
        <h2>Loan Details</h2>
        <p>Tell us about the loan you're applying for</p>
        
        <div className="form-group">
          <label>Loan Type</label>
          <select
            value={formData.loanDetails.loanType}
            onChange={(e) => handleInputChange('loanDetails', 'loanType', e.target.value)}
            required
          >
            <option value="">Select loan type</option>
            <option value="personal">Personal Loan</option>
            <option value="auto">Auto Loan</option>
            <option value="mortgage">Mortgage</option>
            <option value="business">Business Loan</option>
            <option value="student">Student Loan</option>
          </select>
          <p className="help-text">Choose the type of loan you're applying for.</p>
        </div>
        
        <div className="form-group">
          <label>Loan Amount ($)</label>
          <input 
            type="number" 
            value={formData.loanDetails.loanAmount}
            onChange={(e) => handleInputChange('loanDetails', 'loanAmount', e.target.value)}
            placeholder="10000"
            required
          />
          <p className="help-text">Enter the amount you wish to borrow in USD.</p>
        </div>
        
        <div className="form-group">
          <label>Loan Term</label>
          <select
            value={formData.loanDetails.loanTerm}
            onChange={(e) => handleInputChange('loanDetails', 'loanTerm', e.target.value)}
            required
          >
            <option value="">Select loan term</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
            <option value="48">48 months</option>
            <option value="60">60 months</option>
          </select>
          <p className="help-text">Select the time period for loan repayment.</p>
        </div>
        
        <div className="form-group">
          <label>Loan Purpose</label>
          <textarea 
            value={formData.loanDetails.loanPurpose}
            onChange={(e) => handleInputChange('loanDetails', 'loanPurpose', e.target.value)}
            placeholder="Briefly describe what you'll use the loan for"
            required
          />
          <p className="help-text">Please provide details about how you plan to use this loan.</p>
        </div>
        
        <div className="form-buttons">
          <button className="back-btn" onClick={prevStep}>Back</button>
          <button className="next-btn" onClick={nextStep}>Next</button>
        </div>
      </div>
    );
  };

  const renderFinancialInfo = () => {
    return (
      <div className="form-container">
        <h2>Financial Information</h2>
        <p>Tell us about your income and financial status</p>
        
        <div className="form-group">
          <label>Employment Status</label>
          <select
            value={formData.financialInfo.employmentStatus}
            onChange={(e) => handleInputChange('financialInfo', 'employmentStatus', e.target.value)}
            required
          >
            <option value="">Select employment status</option>
            <option value="fullTime">Full-Time</option>
            <option value="partTime">Part-Time</option>
            <option value="selfEmployed">Self-Employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
            <option value="student">Student</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Employer Name</label>
          <input 
            type="text" 
            value={formData.financialInfo.employerName}
            onChange={(e) => handleInputChange('financialInfo', 'employerName', e.target.value)}
            placeholder="Company Inc."
            required
          />
          <p className="help-text">Enter your current employer's name.</p>
        </div>
        
        <div className="form-group">
          <label>Monthly Income ($)</label>
          <input 
            type="number" 
            value={formData.financialInfo.monthlyIncome}
            onChange={(e) => handleInputChange('financialInfo', 'monthlyIncome', e.target.value)}
            placeholder="5000"
            required
          />
          <p className="help-text">Enter your gross monthly income before taxes.</p>
        </div>
        
        <div className="form-group">
          <label>Other Income ($) (Optional)</label>
          <input 
            type="number" 
            value={formData.financialInfo.otherIncome}
            onChange={(e) => handleInputChange('financialInfo', 'otherIncome', e.target.value)}
            placeholder="1000"
          />
          <p className="help-text">Include any additional income sources (investments, rental, etc.).</p>
        </div>
        
        <div className="form-group">
          <label>Credit Score Range</label>
          <select
            value={formData.financialInfo.creditScoreRange}
            onChange={(e) => handleInputChange('financialInfo', 'creditScoreRange', e.target.value)}
            required
          >
            <option value="">Select credit score range</option>
            <option value="excellent">Excellent (750+)</option>
            <option value="good">Good (700-749)</option>
            <option value="fair">Fair (650-699)</option>
            <option value="poor">Poor (600-649)</option>
            <option value="bad">Bad (below 600)</option>
            <option value="unknown">I don't know</option>
          </select>
          <p className="help-text">Select the range that best matches your credit score.</p>
        </div>
        
        <div className="form-buttons">
          <button className="back-btn" onClick={prevStep}>Back</button>
          <button className="next-btn" onClick={nextStep}>Next</button>
        </div>
      </div>
    );
  };

  const renderDocuments = () => {
    return (
      <div className="form-container">
        <h2>Documents & Verification</h2>
        <p>Upload required documents and review your application</p>
        
        <div className="documents-section">
          <h3>Required Documents</h3>
          
          <div className="document-upload">
            <div className="document-type">
              <h4>Photo ID</h4>
              <div className="upload-area">
                <div className="upload-icon">
                  <i className="fas fa-upload"></i>
                </div>
                <p>Upload Driver's License, Passport, or State ID</p>
                <input
                  type="file"
                  id="photoId"
                  onChange={(e) => handleFileUpload('photoId', e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <label htmlFor="photoId" className="upload-btn">
                  Select File
                </label>
                {formData.documents.photoId && (
                  <p className="file-selected">
                    {formData.documents.photoId.name}
                  </p>
                )}
              </div>
            </div>
            
            <div className="document-type">
              <h4>Proof of Income</h4>
              <div className="upload-area">
                <div className="upload-icon">
                  <i className="fas fa-upload"></i>
                </div>
                <p>Upload pay stubs, W-2, or tax returns</p>
                <input
                  type="file"
                  id="incomeProof"
                  onChange={(e) => handleFileUpload('incomeProof', e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <label htmlFor="incomeProof" className="upload-btn">
                  Select File
                </label>
                {formData.documents.incomeProof && (
                  <p className="file-selected">
                    {formData.documents.incomeProof.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="verification-section">
            <div className="verification-item">
              <input 
                type="checkbox" 
                id="idVerification"
                checked={formData.documents.idVerification}
                onChange={() => handleCheckboxChange('documents', 'idVerification')}
              />
              <label htmlFor="idVerification">
                I confirm that I have uploaded a valid form of identification.
              </label>
            </div>
            
            <div className="verification-item">
              <input 
                type="checkbox" 
                id="incomeVerification"
                checked={formData.documents.incomeVerification}
                onChange={() => handleCheckboxChange('documents', 'incomeVerification')}
              />
              <label htmlFor="incomeVerification">
                I confirm that I have uploaded proof of income documents.
              </label>
            </div>
          </div>
        </div>
        
        <div className="terms-section">
          <h3>Terms & Conditions</h3>
          <div className="terms-content">
            <p>By submitting this application, you agree to the following terms and conditions:</p>
            <ul>
              <li>You authorize us to obtain credit reports and verify the information provided.</li>
              <li>You certify that all information provided is true and complete.</li>
              <li>You understand that providing false information constitutes fraud.</li>
              <li>You agree to the interest rates and repayment terms as outlined in the loan agreement.</li>
            </ul>
          </div>
          
          <div className="verification-item">
            <input 
              type="checkbox" 
              id="termsAccepted"
              checked={formData.documents.termsAccepted}
              onChange={() => handleCheckboxChange('documents', 'termsAccepted')}
              required
            />
            <label htmlFor="termsAccepted">
              I have read and agree to the terms and conditions.
            </label>
          </div>
        </div>
        
        <div className="form-buttons">
          <button className="back-btn" onClick={prevStep}>Back</button>
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={!formData.documents.termsAccepted}
          >
            Submit Application
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="loan-application">
      <header className="app-header">
        <h1>Loan Application</h1>
        <p>Please fill out the application form below</p>
      </header>
      
      <div className="progress-bar">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">
            <span>{currentStep > 1 ? '✓' : '1'}</span>
          </div>
          <div className="step-label">
            <span>Personal Info</span>
            <p>Your basic information</p>
          </div>
        </div>
        
        <div className="progress-connector"></div>
        
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">
            <span>{currentStep > 2 ? '✓' : '2'}</span>
          </div>
          <div className="step-label">
            <span>Loan Details</span>
            <p>Loan type and amount</p>
          </div>
        </div>
        
        <div className="progress-connector"></div>
        
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">
            <span>{currentStep > 3 ? '✓' : '3'}</span>
          </div>
          <div className="step-label">
            <span>Financial Info</span>
            <p>Employment and income</p>
          </div>
        </div>
        
        <div className="progress-connector"></div>
        
        <div className={`progress-step ${currentStep >= 4 ? 'active' : ''}`}>
          <div className="step-number">
            <span>4</span>
          </div>
          <div className="step-label">
            <span>Documents</span>
            <p>Upload and verify</p>
          </div>
        </div>
      </div>
      
      <div className="form-wrapper">
        {renderStep()}
      </div>
    </div>
  );
};

export default LoanApplicationForm;