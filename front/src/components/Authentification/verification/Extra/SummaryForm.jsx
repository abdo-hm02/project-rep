
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { 
  Edit2, 
  Check, 
  X, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  FileText,
  Users,
  Home
} from 'lucide-react';
import { registerUser } from '../../../../services/api';
import { Alert, AlertDescription } from '../../../ui/alert';

const InputField = ({ label, value, icon: Icon, isEditing, onChange }) => (
  <div className="relative">
    <label className="text-sm font-medium text-gray-700 mb-1 block">
      {label}
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      {isEditing ? (
        <input
          type="text"
          value={value || ''}
          onChange={onChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      ) : (
        <div className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50">
          {value || 'N/A'}
        </div>
      )}
    </div>
  </div>
);

const SummaryForm = ({ 
  userInfo, 
  extractedData, 
  onUpdateInfo, 
  onSubmit,
  isProcessing 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...userInfo, ...extractedData });
  const [error, setError] = useState(null);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...userInfo, ...extractedData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ ...userInfo, ...extractedData });
    setError(null);
  };

  const handleSave = () => {
    // Validation before saving
    const requiredFields = [
      'email', 
      'phone', 
      'first_name',
      'last_name',
      'date_of_birth',
      'place_of_birth',
      'id_number',
      'father_name',
      'mother_name',
      'address',
      'civil_status_number',
      'gender'
    ];

    const missingFields = requiredFields.filter(field => !editedData[field]);

    if (missingFields.length > 0) {
      setError(`Veuillez remplir tous les champs obligatoires : ${missingFields.join(', ')}`);
      return;
    }

    setIsEditing(false);
    onUpdateInfo(editedData);
  };

  const handleSubmit = async () => {
    try {
      console.log('userInfo received:', userInfo);
      // Format data for backend
      const userData = {
        firstName: editedData.first_name,
        lastName: editedData.last_name,
        email: editedData.email,
        phoneNumber: editedData.phone,
        password: userInfo.password,
        birthDate: editedData.date_of_birth,
        idExpirationDate: editedData.expiry_date,
        birthPlace: editedData.place_of_birth,
        cardNumber: editedData.id_number,
        fatherFullName: editedData.father_name,
        motherFullName: editedData.mother_name,
        address: editedData.address,
        gender: editedData.gender,
        civilStatusNumber: editedData.civil_status_number
      };

      if (!userData.password) {
        throw new Error('Le mot de passe est requis');
      }

      // Send to backend
      const result = await registerUser(userData);
      
      // Call the onSubmit prop to handle success
      onSubmit(result);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Résumé des Informations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Veuillez vérifier que toutes les informations sont correctes avant de continuer
          </p>
        </div>
        {!isEditing ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEdit}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 
              hover:text-blue-700 focus:outline-none"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </motion.button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 
                hover:text-gray-700 focus:outline-none"
            >
              <X className="w-4 h-4 mr-1" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-2 text-sm font-medium text-green-600 
                hover:text-green-700 focus:outline-none"
            >
              <Check className="w-4 h-4 mr-1" />
              Enregistrer
            </button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Sections */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Account Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations du Compte
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Email"
              value={editedData.email}
              icon={Mail}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                email: e.target.value
              })}
            />
            <InputField
              label="Téléphone"
              value={editedData.phone}
              icon={Phone}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                phone: e.target.value
              })}
            />
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations Personnelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Prénom"
              value={editedData.first_name}
              icon={User}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                first_name: e.target.value
              })}
            />
            <InputField
              label="Nom"
              value={editedData.last_name}
              icon={User}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                last_name: e.target.value
              })}
            />
            <InputField
              label="Date de Naissance"
              value={editedData.date_of_birth}
              icon={Calendar}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                date_of_birth: e.target.value
              })}
            />
            <InputField
              label="Lieu de Naissance"
              value={editedData.place_of_birth}
              icon={MapPin}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                place_of_birth: e.target.value
              })}
            />
            <InputField
              label="Numéro CIN"
              value={editedData.id_number}
              icon={CreditCard}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                id_number: e.target.value
              })}
            />
            <InputField
              label="Sexe"
              value={editedData.gender}
              icon={User}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                gender: e.target.value
              })}
            />
          </div>
        </div>

        {/* Family Information */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations Familiales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Nom du Père"
              value={editedData.father_name}
              icon={Users}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                father_name: e.target.value
              })}
            />
            <InputField
              label="Nom de la Mère"
              value={editedData.mother_name}
              icon={Users}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                mother_name: e.target.value
              })}
            />
          </div>
        </div>

        {/* Additional Information */}
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations Complémentaires
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              label="Adresse"
              value={editedData.address}
              icon={Home}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                address: e.target.value
              })}
            />
            <InputField
              label="N° État Civil"
              value={editedData.civil_status_number}
              icon={FileText}
              isEditing={isEditing}
              onChange={(e) => setEditedData({
                ...editedData,
                civil_status_number: e.target.value
              })}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isProcessing}
          className={`
            flex items-center justify-center px-8 py-3 rounded-lg font-medium
            transition-colors duration-200
            ${isProcessing 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
            }
            text-white
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Finalisation en cours...
            </>
          ) : (
            'Confirmer et terminer inscription'
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default SummaryForm;
