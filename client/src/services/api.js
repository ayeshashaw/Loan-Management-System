import axios from 'axios';

const API_BASE_URL = '/api';

// Save personal information
export const savePersonalInfo = async (personalInfo) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/loans/personal-info`, personalInfo, {

    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Save loan details
export const saveLoanDetails = async (loanDetails) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/loans/loan-details`, loanDetails, {

    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Save financial information
export const saveFinancialInfo = async (financialInfo) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/loans/financial-info`, financialInfo, {

    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Save documents
export const saveDocuments = async (documents) => {
  try {
    const formData = new FormData();
    
    if (documents.photoId) {
      formData.append('photoId', documents.photoId);
    }
    if (documents.incomeProof) {
      formData.append('incomeProof', documents.incomeProof);
    }
    
    formData.append('idVerification', documents.idVerification);
    formData.append('incomeVerification', documents.incomeVerification);
    formData.append('termsAccepted', documents.termsAccepted);

    const response = await axios.post(`${API_BASE_URL}/loans/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Submit final application
export const submitApplication = async (applicationData) => {
  try {
    // Validate required fields before submission
    const requiredFields = ['loanAmount', 'loanType', 'loanPurpose', 'loanTerm'];
    const missingFields = requiredFields.filter(field => !applicationData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const response = await axios.post(`${API_BASE_URL}/loans/submit`, {
      loanAmount: applicationData.loanAmount,
      loanType: applicationData.loanType,
      loanPurpose: applicationData.loanPurpose,
      loanTerm: applicationData.loanTerm
    }, {

    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};