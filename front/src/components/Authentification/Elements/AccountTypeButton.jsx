import React from 'react';
import { Check } from 'lucide-react';


const AccountTypeButton = ({ type, selected, icon: Icon, onClick }) => (
  <button
    className={`flex-1 p-6 rounded-lg border-2 transition-all duration-200 relative hover:shadow-md
      ${selected ? 'border-blue-600 ' : 'border-gray-200 hover:border-gray-300'}`}
    onClick={onClick}
  >
    <div className="flex flex-col items-center">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors
        ${selected ? 'bg-blue-100' : 'bg-gray-100'}`}>
        <Icon className={`w-8 h-8 ${selected ? 'text-blue-600' : 'text-gray-600'}`} />
      </div>
      <span className={`text-lg font-medium ${selected ? 'text-blue-600' : 'text-gray-900'}`}>
        Compte {type}
      </span>
    </div>
    {selected && (
      <div className="absolute top-3 right-3 animate-fadeIn">
        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      </div>
    )}
  </button>
);

export default AccountTypeButton;