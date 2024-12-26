import React, { useState } from 'react';
import {Mail, Lock, Loader2  } from 'lucide-react';
import { useNavigate} from 'react-router-dom';
import { Alert, AlertDescription } from '../ui/alert';
import { loginUser } from '../../services/api';
import AccountTypeBox from './Elements/AccountTypeBox';
import InputField from './Elements/InputField';



const SignInForm = ({ accountType, onAccountTypeChange }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await loginUser({ email, password }, accountType);
      
      if (accountType === 'agent') {
        const agentType = result.data.agent.agent_type;
          if (agentType === 'insurance') {
            navigate('/agent/insurancedash');
          } else if (agentType === 'conservation') {
            navigate('/agent/conservationdash', { 
              state: { 
                user: result.data.agent,
                token: result.data.token
              }
            });
            
          }
      
      } else {
        // Regular users go through verification
        navigate('/auth/verify', { 
          state: { 
            user: result.data.user,
            token: result.data.token
          }
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <AccountTypeBox 
        selectedType={accountType}
        onTypeChange={onAccountTypeChange}
      />
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Addresse Email
          </label>
          <InputField
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrer votre Email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de Passe
          </label>
          <InputField
            icon={Lock}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Entrer votre mot de passe"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Se souvenir de moi
            </label>
          </div>
          <a href="#" className="text-sm text-blue-600 hover:underline">
            Mot de passe oublié?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium 
            hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="animate-spin mr-2" />
              Connexion...
            </div>
          ) : (
            'Se Connecter'
          )}
        </button>

        {accountType !== 'agent' && (
          <p className="text-center text-gray-600">
            Vous n'avez pas un compte?{' '}
            <button 
              type="button"
              onClick={() => navigate('/register')}
              className="text-blue-600 hover:underline focus:outline-none"
            >
              S'inscrire
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default SignInForm;