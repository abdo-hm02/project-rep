import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { motion } from 'framer-motion';


const ResultsStep = ({ data, onContinue, onRetry }) => {
    const isVerified = data.data.verification_status === 'verified';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-center mb-6">
          {isVerified ? (
            <div className="flex items-center text-green-600">
              <CheckCircle2 className="w-8 h-8 mr-2" />
              <span className="text-xl font-medium">Vérification réussie</span>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Vérification incomplète. Champs manquants: {data.missingFields?.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>
  
        <div className="flex justify-center space-x-4">
          {isVerified ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continuer
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Réessayer
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  };
  
  export default ResultsStep;