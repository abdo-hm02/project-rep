import React from 'react';
import { UserIcon, Building2} from 'lucide-react';
import AccountTypeButton from './AccountTypeButton';


const AccountTypeBox = ({ selectedType, onTypeChange }) => (
    <div className="flex gap-4 mb-8">
      <AccountTypeButton
        type="personnel"
        selected={selectedType === 'personnel'}
        icon={UserIcon}
        onClick={() => onTypeChange('personnel')}
      />
      <AccountTypeButton
        type="agent"
        selected={selectedType === 'agent'}
        icon={Building2}
        onClick={() => onTypeChange('agent')}
      />
    </div>
  );

  export default AccountTypeBox;