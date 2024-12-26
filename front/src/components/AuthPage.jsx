import React, { useState } from 'react';
import {useLocation } from 'react-router-dom';
import LeftSide from './Authentification/LeftSide';
import SignInForm from './Authentification/SignInForm';
import SignUpForm from './Authentification/SignUpForm';


const AuthPage = ({ initialStep = 'signin', onRegisterSubmit }) => {
    const location = useLocation();
    const [accountType, setAccountType] = useState('personnel');
    const [isSignUp, setIsSignUp] = useState(
      initialStep === 'signup' || location.pathname === '/register'
    );
  
    return (
      <div className="flex h-screen">
        <LeftSide />

        <div className="w-full md:w-3/5 p-8 flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
              {isSignUp ? "S'inscrire" : 'Connexion'}
            </h2>
  
            {isSignUp ? (
              <SignUpForm 
                onToggleForm={() => setIsSignUp(false)} 
                onSubmit={onRegisterSubmit}
              />
            ) : (
              <SignInForm 
                onToggleForm={() => setIsSignUp(true)}
                accountType={accountType}
                onAccountTypeChange={setAccountType}
              />
            )}
          </div>
        </div>
      </div>
    );
  };
  
  
  export default AuthPage;