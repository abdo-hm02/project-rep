import React, { useEffect } from 'react';
import { Camera, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const WebcamStep = ({ videoRef, onCapture, onRetake }) => {
  useEffect(() => {
    onRetake(); // Start webcam when component mounts
    return () => {
      // Cleanup webcam when component unmounts
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="mx-auto w-full max-w-lg"
        />
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent">
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCapture}
              className="bg-white text-gray-800 px-6 py-2 rounded-lg flex items-center space-x-2 
                hover:bg-gray-100 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo</span>
            </button>
            <button
              onClick={onRetake}
              className="bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center space-x-2 
                hover:bg-gray-700 transition-colors"
            >
              <RefreshCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WebcamStep;