import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const CompletionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-50/50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Inscription Réussie!</h1>
        <p className="text-gray-600 mb-6">
          Votre compte a été créé avec succès.
        </p>

        <button
          onClick={() => navigate('/auth')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Aller à la page de connexion
        </button>
      </div>
    </div>
  );
};

export default CompletionPage;