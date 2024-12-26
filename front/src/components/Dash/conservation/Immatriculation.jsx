import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  MapPin,
  Upload,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User2,
  FileCheck,
  X,
  Loader2,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import Header from '../Elements/Header';
import Sidebar from '../Elements/Sidebar';

const DocumentUploader = ({ title, description, onFileSelect, file, icon: Icon }) => (
  <div className="space-y-4">
    <Label>{title}</Label>
    {!file ? (
      <div 
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                   hover:border-blue-400 transition-colors"
        onClick={() => document.getElementById(`upload-${title}`).click()}
      >
        <input
          id={`upload-${title}`}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => onFileSelect(e.target.files[0])}
        />
        <Icon className="h-8 w-8 mx-auto text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400">Format: PDF, JPG, PNG</p>
      </div>
    ) : (
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <Icon className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-sm">{file.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFileSelect(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )}
  </div>
);

const Immatriculation = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('conservation');

  const [formData, setFormData] = useState({
    propertyType: '',
    propertyAddress: '',
    propertySize: '',
    propertyUsage: '',
    titleDeed: null,
    identityDoc: null,
    propertyPlan: null,
    locationCert: null,
    taxCert: null
  });

  const steps = [
    {
      title: "Informations du bien",
      description: "Détails de la propriété",
      component: (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Informations du bien immobilier</CardTitle>
            <CardDescription>
              Renseignez les informations de base sur le bien à immatriculer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Type de bien</Label>
              <Select 
                value={formData.propertyType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type de bien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terrain">Terrain nu</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="commercial">Local commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Adresse du bien</Label>
              <Input
                placeholder="Adresse complète"
                value={formData.propertyAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyAddress: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Superficie (m²)</Label>
              <Input
                type="number"
                placeholder="Surface en m²"
                value={formData.propertySize}
                onChange={(e) => setFormData(prev => ({ ...prev, propertySize: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Usage prévu</Label>
              <Select
                value={formData.propertyUsage}
                onValueChange={(value) => setFormData(prev => ({ ...prev, propertyUsage: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez l'usage prévu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Résidentiel</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="agricultural">Agricole</SelectItem>
                  <SelectItem value="industrial">Industriel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )
    },
    {
      title: "Documents personnels",
      description: "Pièce d'identité et attestation",
      component: (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Documents personnels</CardTitle>
            <CardDescription>
              Ajoutez les documents d'identification requis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DocumentUploader
              title="Pièce d'identité"
              description="CIN ou passeport"
              file={formData.identityDoc}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, identityDoc: file }))}
              icon={User2}
            />
            <DocumentUploader
              title="Titre de propriété"
              description="Acte de propriété ou contrat"
              file={formData.titleDeed}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, titleDeed: file }))}
              icon={FileText}
            />
          </CardContent>
        </Card>
      )
    },
    {
      title: "Documents techniques",
      description: "Plans et certificats",
      component: (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Documents techniques</CardTitle>
            <CardDescription>
              Ajoutez les documents techniques requis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DocumentUploader
              title="Plan topographique"
              description="Plan établi par un géomètre agréé"
              file={formData.propertyPlan}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, propertyPlan: file }))}
              icon={MapPin}
            />
            <DocumentUploader
              title="Certificat de localisation"
              description="Délivré par l'autorité locale"
              file={formData.locationCert}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, locationCert: file }))}
              icon={Building}
            />
            <DocumentUploader
              title="Attestation fiscale"
              description="Attestation des impôts"
              file={formData.taxCert}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, taxCert: file }))}
              icon={FileCheck}
            />
          </CardContent>
        </Card>
      )
    }
  ];

  const isStepValid = () => {
    switch (activeStep) {
      case 1:
        return formData.propertyType && 
               formData.propertyAddress && 
               formData.propertySize && 
               formData.propertyUsage;
      case 2:
        return !!formData.identityDoc && !!formData.titleDeed;
      case 3:
        return !!formData.propertyPlan && 
               !!formData.locationCert && 
               !!formData.taxCert;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitFormData = new FormData();
      
      // Add basic info
      submitFormData.append('propertyType', formData.propertyType);
      submitFormData.append('propertyAddress', formData.propertyAddress);
      submitFormData.append('propertySize', formData.propertySize);
      submitFormData.append('propertyUsage', formData.propertyUsage);
  
      // Add documents
      submitFormData.append('identityDoc', formData.identityDoc);
      submitFormData.append('titleDeed', formData.titleDeed);
      submitFormData.append('propertyPlan', formData.propertyPlan);
      submitFormData.append('locationCert', formData.locationCert);
      submitFormData.append('taxCert', formData.taxCert);
  
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      submitFormData.append('userId', user.id);
  
      const response = await fetch('http://localhost:6500/api/property/register', {
        method: 'POST',
        body: submitFormData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
        }
      });
  
      if (response.ok) {
        navigate('/conservation');
      } else {
        throw new Error('Failed to submit registration');
      }
    } catch (error) {
      console.error('Error submitting registration:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex w-72 border-r bg-white">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => navigate('/conservation')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour aux propriétés
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Immatriculation d'un bien immobilier
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Suivez les étapes pour immatriculer votre bien
              </p>
            </div>

            {/* Progress Steps */}
            <div className="relative mb-8">
              <div className="absolute top-5 w-full">
                <div className="h-0.5 bg-gray-200 relative">
                  <div 
                    className="absolute h-0.5 bg-blue-600 transition-all duration-500"
                    style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 
                        ${activeStep > index + 1 ? "bg-blue-600" : 
                          activeStep === index + 1 ? "bg-blue-600" : "bg-gray-200"}`}
                    >
                      <span className={`text-sm font-medium
                        ${activeStep >= index + 1 ? "text-white" : "text-gray-500"}`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className={`text-sm font-medium text-center
                        ${activeStep >= index + 1 ? "text-blue-600" : "text-gray-500"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 text-center">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="mb-8">
              {steps[activeStep - 1].component}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setActiveStep(prev => prev - 1)}
                disabled={activeStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </Button>

              {activeStep === steps.length ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      Soumettre la demande
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
                   ) : (
            <Button
            onClick={() => setActiveStep(prev => prev + 1)}
            disabled={!isStepValid()}
            className="bg-blue-600 hover:bg-blue-700"
            >
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
            )}
            </div>

            {/* Warning Message for Required Fields */}
                {!isStepValid() && (
                    <Alert className="mt-6" variant="warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Champs requis</AlertTitle>
                    <AlertDescription>
                    Veuillez remplir tous les champs obligatoires avant de continuer.
                    </AlertDescription>
                    </Alert>
                    )}
                </div>
                </main>
                </div>
            </div>
            );
            };

export default Immatriculation;