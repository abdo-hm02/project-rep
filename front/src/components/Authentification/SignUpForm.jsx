import React, { useState } from 'react';
import { Phone, Mail, Lock} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InputField from './Elements/InputField';



const SignUpForm = ({ onSubmit }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    });
  
    const handleSignInClick = () => {
      navigate('/auth');
    };
  
    const [errors, setErrors] = useState({});
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };
  
    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.email) {
        newErrors.email = 'Email is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone is required';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms';
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log("Submit handler called");  // Debug log
      console.log("onSubmit prop:", onSubmit); // Debug log
      
      if (validateForm()) {
        if (typeof onSubmit === 'function') {
          onSubmit(formData);
        } else {
          console.error('onSubmit is not a function:', onSubmit);
        }
      }
    };
  
    return (
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Addresse Email
          </label>
          <InputField
            icon={Mail}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrer votre Email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Numéro de téléphone
          </label>
          <InputField
            icon={Phone}
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Entrer votre numéro"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de Passe
          </label>
          <InputField
            icon={Lock}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Entrer votre mot de passe"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
          )}
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le mot de passe
          </label>
          <InputField
            icon={Lock}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmer votre mot de passe"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
          )}
        </div>
  
        <div className="flex items-center">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-600">
            J'accepte {' '}
            <a href="#" className="text-blue-600 hover:underline">
              les Conditions d'Utilisation
            </a>{' '}
            et{' '}
            <a href="#" className="text-blue-600 hover:underline">
              la Politique de Confidentialité
            </a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-sm text-red-500">{errors.acceptTerms}</p>
        )}
  
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium 
            hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2"
        >
          Créer un compte
        </button>
  
        <p className="text-center text-gray-600">
          Vous avez déjà un compte?{' '}
          <button 
            type="button"
            onClick={handleSignInClick}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Se connecter
          </button>
        </p>
      </form>
    );
  };

  export default SignUpForm;