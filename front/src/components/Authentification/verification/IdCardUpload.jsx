import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import {
  Typography,
  Paper,
  Button,
  Container
} from '@mui/material';


import { UploadFile, Check, ArrowForward } from '@mui/icons-material';


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

const UploadBox = ({ side, file, onFileSelect }) => {
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type.startsWith('image/')) {
      onFileSelect(droppedFile);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex-1"
    >
      <div className="text-sm font-medium text-gray-700 mb-2">
        {side === 'front' ? 'Recto de la carte' : 'Verso de la carte'}
      </div>
      
      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative h-56 rounded-lg border-2 border-dashed border-gray-200 
            hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 
            cursor-pointer flex items-center justify-center bg-white"
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFileSelect(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="text-center">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3"
            >
              <UploadFile className="text-blue-500" sx={{ fontSize: 24 }} />
            </motion.div>
            <p className="text-sm text-gray-600 mb-1">
              Glissez et déposez votre image ici
            </p>
            <p className="text-sm text-blue-500 font-medium">
              ou cliquez pour parcourir
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-56 rounded-lg overflow-hidden group"
        >
          <img 
            src={URL.createObjectURL(file)} 
            alt={`${side} of ID`} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
            transition-opacity flex items-center justify-center">
            <Button
              variant="contained"
              size="small"
              onClick={() => onFileSelect(null)}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              Changer
            </Button>
          </div>
          <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full 
            flex items-center justify-center">
            <Check className="text-white" sx={{ fontSize: 16 }} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const IdCardUpload = ({ onUploadComplete = () => {}, initialFiles = {} }) => {
  const navigate = useNavigate();
  const [frontFile, setFrontFile] = useState(initialFiles?.front || null);
  const [backFile, setBackFile] = useState(initialFiles?.back || null);

  const handleContinue = () => {
    if (frontFile && backFile) {
      // Convert files to base64 before sending them up
      const convertToBase64 = (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      };

      // Convert both files and send them to parent
      Promise.all([
        convertToBase64(frontFile),
        convertToBase64(backFile)
      ]).then(([frontBase64, backBase64]) => {
        onUploadComplete({
          front: frontBase64,
          back: backBase64
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ProgressSteps currentStep={1} />
        
        <Paper 
          elevation={0} 
          sx={{ 
            maxWidth: 800,
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
            Téléchargez votre carte d'identité
          </Typography>
          <Typography 
            variant="body2"
            align="center" 
            color="textSecondary"
            sx={{ mb: 4 }}
          >
            Pour vérifier votre identité, nous avons besoin d'une photo des deux côtés de votre carte
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <UploadBox
              side="front"
              file={frontFile}
              onFileSelect={setFrontFile}
            />
            <UploadBox
              side="back"
              file={backFile}
              onFileSelect={setBackFile}
            />
          </div>

          <div className="flex justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                disabled={!frontFile || !backFile}
                endIcon={<ArrowForward />}
                onClick={handleContinue}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem'
                }}
              >
                Continuer
              </Button>
            </motion.div>
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default IdCardUpload;
