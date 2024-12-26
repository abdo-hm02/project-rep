import React, { useState, useRef } from 'react';
import { Container, Paper, Typography } from '@mui/material';
import { Loader2 } from 'lucide-react';
import { Check } from '@mui/icons-material'; // Import Check from MUI icons to match
import { Alert, AlertDescription } from '../../ui/alert';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WebcamStep from './Extra/WebcamStep';
import ResultsStep from './Extra/ResultsStep';
import SummaryForm from './Extra/SummaryForm';


const ProgressSteps = ({ currentStep }) => (
  <div className="max-w-2xl mx-auto mb-16">
    <div className="flex justify-between relative">
      {/* Progress Bar */}
      <div className="absolute top-5 left-[15%] right-[15%] h-[2px] bg-gray-200" />
      <motion.div 
        className="absolute top-5 left-[15%] h-[2px] bg-blue-500"
        initial={{ width: '0%' }}
        animate={{ width: `${((currentStep - 1) / 2) * 70}%` }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      />

      {/* Steps */}
      {[
        { step: 1, label: "DOCUMENT" },
        { step: 2, label: "PHOTO" },
        { step: 3, label: "VALIDATION" }
      ].map((item) => (
        <div key={item.step} className="flex flex-col items-center relative z-10">
          <div 
            className={`
              w-11 h-11 rounded-full flex items-center justify-center mb-2
              transition-all duration-300
              ${currentStep === item.step 
                ? 'bg-blue-500 shadow-md' 
                : currentStep > item.step 
                ? 'bg-blue-500' 
                : 'bg-white border-2 border-gray-200'
              }
            `}
          >
            {currentStep > item.step ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span 
                className={`
                  text-sm font-semibold
                  ${currentStep >= item.step ? 'text-white' : 'text-gray-400'}
                `}
              >
                {item.step}
              </span>
            )}
          </div>
          
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              text-xs tracking-wider font-medium
              ${currentStep >= item.step ? 'text-gray-800' : 'text-gray-400'}
            `}
          >
            {item.label}
          </motion.span>
        </div>
      ))}
    </div>
  </div>
);

const IDVerification = ({ frontID, backID, onVerificationComplete, userInfo, onFinalSubmit,isLoginFlow = false }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(2); // Start at 2 for webcam
    const [selfieImage, setSelfieImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [extractedData, setExtractedData] = useState(null);
    const [verificationComplete, setVerificationComplete] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [finalData, setFinalData] = useState(null);


  const handleVerificationSuccess = (extractedData) => {
    setVerificationComplete(true);
    setFinalData(extractedData);
    // Notify parent component
    onVerificationComplete({
      extractedData,
      selfieImage,
      verificationStatus: 'verified'
    });
  };

  const handleFinalSubmit = async (finalFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Combine all the data
      const completeData = {
        ...finalFormData,
        selfieImage,
        password: userInfo.password,
        idFront: frontID,
        idBack: backID,
        verificationStatus: 'verified'
      };

      // Call the parent's submit handler
      await onFinalSubmit(completeData);
    } catch (err) {
      setError('Failed to submit registration. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInfoUpdate = (updatedData) => {
    setFinalData(updatedData);
  };

  const handleSubmit = (finalFormData) => {
    onFinalSubmit(finalFormData); // This will trigger navigation to completion page
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
    } catch (err) {
      setError('Unable to access webcam. Please make sure you have granted permission.');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const image = canvas.toDataURL('image/jpeg');
    setSelfieImage(image);
    stopWebcam();
    setStep(3); // Move to validation step
  };

  const convertBase64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };
  
  const processVerification = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Convert both images to Files
      const backIDFile = convertBase64ToFile(backID, 'back-id.jpg');
      const frontIDFile = convertBase64ToFile(frontID, 'front-id.jpg');
      const selfieFile = convertBase64ToFile(selfieImage, 'selfie.jpg');
      
      // Create FormData with both images
      const faceComparisonData = new FormData();
      faceComparisonData.append('image1', frontIDFile);
      faceComparisonData.append('image2', selfieFile);
  
      // Make face comparison request
      const faceResponse = await fetch('http://127.0.0.1:5000/api/compare-faces', {
        method: 'POST',
        body: faceComparisonData
      });
      
      const faceResult = await faceResponse.json();
      
      if (!faceResult.success || !faceResult.match) {
        throw new Error('Face verification failed. Please try again.');
      }

      if (isLoginFlow) {
        onVerificationComplete();
        return;
      }
  
      // Create FormData for text extraction
      const frontExtractionData = new FormData();
      frontExtractionData.append('image', frontIDFile);
  
      // Make text extraction request simultaneously
      const frontTextResponse = await fetch('http://127.0.0.1:5000/api/extract-text', {
        method: 'POST',
        body: frontExtractionData
      });
  
      const frontTextResult = await frontTextResponse.json();
  
      if (!frontTextResult.success) {
        throw new Error('Failed to extract information from front ID.');
      }

      // Back ID text extraction
      const backExtractionData = new FormData();
      backExtractionData.append('image', backIDFile);

      const backTextResponse = await fetch('http://127.0.0.1:5000/api/extract-text', {
      method: 'POST',
      body: backExtractionData
      });

      const backTextResult = await backTextResponse.json();

      if (!backTextResult.success) {
        throw new Error('Failed to extract information from back ID.');
      }
  
      // Process extracted text into structured data
      const extractedData = processExtractedText(
        frontTextResult.extracted_text,
        backTextResult.extracted_text
      );
      
      if (!extractedData.success) {
        throw new Error(`Verification incomplete. Missing: ${extractedData.missingFields?.join(', ')}`);
      }
  
      setExtractedData(extractedData);
      setStep(3);
  
      // Call the completion handler from props if it exists
      if (onVerificationComplete) {
        onVerificationComplete({
            selfieImage,
            extractedData: extractedData.data,
            verificationStatus: 'verified'
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const processExtractedText = (frontTextArray, backTextArray) => {
  
    const data = {
        first_name: '',
        last_name: '',
        date_of_birth: '',
        place_of_birth: '',
        expiry_date: '',
        card_number: '',
        // New fields for back ID data
        father_name: '',
        mother_name: '',
        address: '',
        civil_status_number: '',
        gender: '',
        verification_status: 'verified'
      };

    
      backTextArray.forEach(item => {
        const text = item.text.trim();
    
        // Extract father's name (after "Fils de")
        if (text.includes('Fils de')) {
          data.father_name = text.split('Fils de').pop().trim();
        }
    
        // Extract mother's name (after "et de")
        if (text.includes('et de')) {
          data.mother_name = text.split('et de').pop().trim();
        }
    
        // Extract address (after "Adresse")
        if (text.includes('Adresse')) {
          data.address = text.split('Adresse').pop().trim();
        }
    
        // Extract civil status number (format: xxx/xxxx)
        if (/^\d{3}\/\d{4}$/.test(text)) {
          data.civil_status_number = text;
        }
    
        // Extract gender (M or F after "Sexe")
        if (text.includes('Sexe')) {
          data.gender = text.replace('Sexe', '').trim();
        }
      });

    // Helper function to validate and format date
    const formatDate = (dateStr) => {
      const [day, month, year] = dateStr.split('.');
      return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    };
  
    // Helper function to check if string is a date in DD.MM.YYYY format
    const isDateFormat = (str) => {
      return /^\d{2}\.\d{2}\.\d{4}$/.test(str);
    };
  
    // Helper function to get year from date string
    const getYear = (dateStr) => {
      return parseInt(dateStr.split('.')[2]);
    };
  
    // Helper function to check if string is an ID number
    const isIDNumber = (str) => {
      return /^[A-Z]{1,2}\d{6}$/.test(str);
    };
  
    // Helper function to check if text is a header
    const isHeader = (text) => {
      const headerKeywords = [
        'ROYAUME',
        'MAROC',
        'CARTE',
        'NATIONALE',
        'IDENTITE',
        "D'IDENTITE",
        'ELECTRONIQUE'
      ];
      return headerKeywords.some(keyword => text.includes(keyword));
    };
  
    // Helper function to check if text is a valid name
    const isValidName = (text) => {
      const cleanText = text.replace(/\s/g, '');
      return /^[A-Z]{2,}$/.test(cleanText) && !isHeader(text);
    };
  
    let dates = [];
    let validNames = [];
  
    // First pass: collect valid names
    frontTextArray.forEach(item => {
      const text = item.text.trim();
      if (isValidName(text)) {
        validNames.push(text);
      }
    });
  
    // Extract names
    if (validNames.length >= 2) {
      [data.first_name, data.last_name] = validNames;
    }
  
    // Second pass: collect other information
    frontTextArray.forEach(item => {
      const text = item.text.trim();
  
      if (isDateFormat(text)) {
        dates.push(text);
      }
  
      if (isIDNumber(text)) {
        data.card_number = text;
      }
  
      if (text.toLowerCase().startsWith('a ') || text.toLowerCase().startsWith('à ')) {
        data.place_of_birth = text.substring(2).toUpperCase();
      }
    });
  
    // Assign dates
    if (dates.length >= 2) {
      const sortedDates = [...dates].sort((a, b) => getYear(a) - getYear(b));
      data.date_of_birth = formatDate(sortedDates[0]);
      data.expiry_date = formatDate(sortedDates[sortedDates.length - 1]);
    }
  
    const missingFields = [];
    if (!data.first_name || data.first_name.length <= 1) missingFields.push('valid first name');
    if (!data.last_name || data.last_name.length <= 1) missingFields.push('valid last name');
    if (!data.date_of_birth) missingFields.push('date of birth');
    if (!data.place_of_birth) missingFields.push('place of birth');
    if (!data.card_number) missingFields.push('ID number');
    if (!data.father_name) missingFields.push('father\'s name');
    if (!data.mother_name) missingFields.push('mother\'s name');
    if (!data.address) missingFields.push('address');
    if (!data.civil_status_number) missingFields.push('civil status number');
    if (!data.gender) missingFields.push('gender');
  
    const isValid = true;
  
    return {
        success: isValid,
        data: {
          name: `${data.first_name} ${data.last_name}`,
          first_name: data.first_name,
          last_name: data.last_name,
          id_number: data.card_number,
          date_of_birth: data.date_of_birth,
          place_of_birth: data.place_of_birth,
          expiry_date: data.expiry_date,
          father_name: data.father_name,
          mother_name: data.mother_name,
          address: data.address,
          civil_status_number: data.civil_status_number,
          gender: data.gender,
          verification_status: data.verification_status
        },
        missingFields: missingFields.length > 0 ? missingFields : undefined
      };
  };

  return (
    <div className="min-h-screen bg-blue-50/50">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ProgressSteps currentStep={verificationComplete ? 3 : 2} />
        
        <Paper 
          elevation={0} 
          sx={{ 
            maxWidth: 900,
            mx: 'auto',
            p: 4,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'grey.200'
          }}
        >
          <Typography 
            variant="h5" 
            align="center" 
            gutterBottom
            sx={{ fontWeight: 600, mb: 1 }}
          >
            {verificationComplete 
              ? "Vérification des informations"
              : step === 2 
                ? "Prenez une photo de votre visage" 
                : "Vérification d'identité"
            }
          </Typography>
          
          {!verificationComplete && (
            <Typography 
              variant="body2"
              align="center" 
              color="textSecondary"
              sx={{ mb: 4 }}
            >
              {step === 2 
                ? "Assurez-vous d'être dans un endroit bien éclairé et regardez directement la caméra"
                : "Vérification de vos informations en cours..."
              }
            </Typography>
          )}
  
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
  
          <AnimatePresence mode="wait">
            {step === 2 && (
              <motion.div
                key="webcam"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                <WebcamStep
                  videoRef={videoRef}
                  onCapture={handleCapture}
                  onRetake={startWebcam}
                />
              </motion.div>
            )}
  
            {step === 3 && !verificationComplete && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                <div className="text-center">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Photo d'identité</p>
                      <img src={frontID} alt="ID Front" className="border rounded-lg" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Selfie</p>
                      <img src={selfieImage} alt="Selfie" className="border rounded-lg" />
                    </div>
                  </div>
                  <button
                    onClick={processVerification}
                    disabled={isProcessing}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center justify-center mx-auto hover:bg-blue-700 transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin mr-2" />
                        Vérification en cours...
                      </>
                    ) : (
                      'Vérifier mon identité'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
  
            {extractedData && !verificationComplete && (
              <motion.div
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="mt-8"
              >
                <ResultsStep 
                  data={extractedData} 
                  onContinue={() => handleVerificationSuccess(extractedData.data)}
                  onRetry={() => {
                    setStep(2);
                    setExtractedData(null);
                    setSelfieImage(null);
                  }}
                />
              </motion.div>
            )}
  
            {verificationComplete && extractedData && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-8"
              >
                <SummaryForm
                  userInfo={userInfo}
                  extractedData={extractedData.data}
                  onUpdateInfo={handleInfoUpdate}
                  onSubmit={handleFinalSubmit}
                  isProcessing={isProcessing}
                />
                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Paper>
      </Container>
    </div>
  );
};

export default IDVerification;