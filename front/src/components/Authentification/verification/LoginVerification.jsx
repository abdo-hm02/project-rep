import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IdCardUpload from './IdCardUpload';
import IDVerification from './IDVerification';

const LoginVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = location.state || {};
  const [step, setStep] = useState('upload'); // 'upload' or 'verify'
  const [idImages, setIdImages] = useState({
    front: null,
    back: null
  });

  if (!user || !token) {
    navigate('/auth');
    return null;
  }

  const handleIdUploadComplete = (files) => {
    setIdImages({
      front: files.front,
      back: files.back
    });
    setStep('verify');
  };

  const handleVerificationComplete = () => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    navigate('/DashUser');
  };

  return step === 'upload' ? (
    <IdCardUpload
      onUploadComplete={handleIdUploadComplete}
      initialFiles={idImages}
    />
  ) : (
    <IDVerification
      isLoginFlow={true}
      frontID={idImages.front}
      backID={idImages.back}
      userInfo={user}
      onVerificationComplete={handleVerificationComplete}
    />
  );
};

export default LoginVerification;