import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AuthPage from '../AuthPage';

import IdCardUpload from './Verification/IdCardUpload';
import IDVerification from './verification/IDVerification';
import CompletionPage from './verification/CompletionPage';

const RegistrationFlow = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const [registrationData, setRegistrationData] = useState({

    email: '',
    phone: '',
    password: '',
    acceptTerms: false,
   
    idCardFront: null,
    idCardBack: null,
    selfieImage: null,
    verificationResult: null,
    extractedInfo: null,
   
    // Track completion of each step
    steps: {
      personalInfo: false,
      idUpload: false,
      faceVerification: false,
      infoConfirmed: false
    }
  });

  // Handle initial form submission
  const handleSignUpSubmit = (formData) => {
    setRegistrationData(prevData => ({
      ...prevData,
      ...formData,
      steps: {
        ...prevData.steps,
        personalInfo: true
      }
    }));
    navigate('/register/id-upload', { replace: true });
  };

  // Handle ID card uploads
  const handleIdCardUpload = (files) => {
    setRegistrationData(prevData => ({
      ...prevData,
      idCardFront: files.front,
      idCardBack: files.back,
      steps: {
        ...prevData.steps,
        idUpload: true
      }
    }));
    navigate('/register/verify', { replace: true });
  };

  // Handle initial verification success
  const handleVerificationComplete = (verificationResult) => {
    setRegistrationData(prevData => ({
      ...prevData,
      verificationResult,
      extractedInfo: verificationResult.extractedData,
      steps: {
        ...prevData.steps,
        faceVerification: true
      }
    }));
    // Note: We don't navigate here anymore, the summary form will be shown in the IDVerification component
  };

  // Handle final form submission after user confirms information
  const handleFinalSubmit = async (finalData) => {
    try {
      // Here you would typically make an API call to create the user account
      // with all the collected and verified data
      console.log('Submitting final data:', finalData);

      // Update registration data one last time
      setRegistrationData(prevData => ({
        ...prevData,
        ...finalData,
        steps: {
          ...prevData.steps,
          infoConfirmed: true
        }
      }));

      // Now navigate to completion page
      navigate('/register/complete', { replace: true });
    } catch (error) {
      console.error('Error submitting final data:', error);
    }
  };

  // Protect routes
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (currentPath === '/register/id-upload' && !registrationData.steps.personalInfo) {
      navigate('/register', { replace: true });
    }
    
    if (currentPath === '/register/verify' && !registrationData.steps.idUpload) {
      navigate('/register/id-upload', { replace: true });
    }

    if (currentPath === '/register/complete' && !registrationData.steps.infoConfirmed) {
      navigate('/register/verify', { replace: true });
    }
  }, [location, registrationData.steps, navigate]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <AuthPage
            initialStep="signup"
            onRegisterSubmit={handleSignUpSubmit}
          />
        }
      />
      <Route
        path="/id-upload"
        element={
          <IdCardUpload
            onUploadComplete={handleIdCardUpload}
            initialFiles={{
              front: registrationData.idCardFront,
              back: registrationData.idCardBack
            }}
          />
        }
      />
      <Route
        path="/verify"
        element={
          <IDVerification
            frontID={registrationData.idCardFront}
            backID={registrationData.idCardBack}
            userInfo={{
              email: registrationData.email,
              phone: registrationData.phone,
              password: registrationData.password
            }}
            onVerificationComplete={handleVerificationComplete}
            onFinalSubmit={handleFinalSubmit}
          />
        }
      />
      
      <Route
        path="/complete"
        element={<CompletionPage />}
      />
    </Routes>
  );
};

export default RegistrationFlow;