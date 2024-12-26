import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Camera,
  Upload,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User2,
  FileCheck,
  X,
  Loader2,
  Shield
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
import { Textarea } from "../../ui/textarea";
import { Calendar as CalendarComponent } from "../../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../ui/alert";

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

const ClaimForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userInsurances, setUserInsurances] = useState([]);
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('insurance');
  

  const [formData, setFormData] = useState({
    selectedInsurance: null,
    // User documents
    userLicense: null,
    userInsurance: null,
    // Other party documents
    otherLicense: null,
    otherInsurance: null,
    // Incident details
    date: new Date(),
    time: '',
    location: '',
    description: '',
    damagePhotos: [],
    constat: null
  });

  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const response = await fetch(`http://localhost:6500/api/insurance/user/${user.id}`);
        const data = await response.json();
        setUserInsurances(data.filter(insurance => insurance.status === 'approved'));
      } catch (error) {
        console.error('Error fetching insurances:', error);
      }
    };

    fetchInsurances();
  }, []);

  const steps = [
    {
      title: "Sélection de l'assurance",
      description: "Choisissez l'assurance concernée",
      component: (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Sélectionnez votre assurance</CardTitle>
            <CardDescription>
              Choisissez l'assurance concernée par la déclaration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userInsurances.map((insurance) => (
              <div
                key={insurance.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer
                  ${formData.selectedInsurance?.id === insurance.id 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setFormData(prev => ({ ...prev, selectedInsurance: insurance }))}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {insurance.marque} {insurance.modele}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {insurance.immatriculation} • Police N°{insurance.id}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )
    },
    {
      title: "Vos documents",
      description: "Permis et assurance",
      component: (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Vos documents</CardTitle>
            <CardDescription>
              Ajoutez votre permis de conduire et attestation d'assurance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DocumentUploader
              title="Permis de conduire"
              description="Ajoutez votre permis de conduire"
              file={formData.userLicense}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, userLicense: file }))}
              icon={FileCheck}
            />
            <DocumentUploader
              title="Attestation d'assurance"
              description="Ajoutez votre attestation d'assurance"
              file={formData.userInsurance}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, userInsurance: file }))}
              icon={Shield}
            />
          </CardContent>
        </Card>
      )
    },
    {
      title: "Documents tiers",
      description: "Documents de l'autre partie",
      component: (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Documents du tiers</CardTitle>
            <CardDescription>
              Ajoutez le permis et l'attestation d'assurance de l'autre partie
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <DocumentUploader
              title="Permis du tiers"
              description="Ajoutez le permis de conduire de l'autre partie"
              file={formData.otherLicense}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, otherLicense: file }))}
              icon={FileCheck}
            />
            <DocumentUploader
              title="Assurance du tiers"
              description="Ajoutez l'attestation d'assurance de l'autre partie"
              file={formData.otherInsurance}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, otherInsurance: file }))}
              icon={Shield}
            />
          </CardContent>
        </Card>
      )
    },
    {
      title: "Détails de l'incident",
      description: "Photos et informations",
      component: (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Détails de l'incident</CardTitle>
            <CardDescription>
              Renseignez les informations sur l'incident
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Date de l'incident</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(formData.date, 'dd MMMM yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Lieu de l'incident</Label>
              <Input
                placeholder="Adresse ou description du lieu"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description de l'incident</Label>
              <Textarea
                placeholder="Décrivez les circonstances de l'incident..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <DocumentUploader
              title="Constat amiable"
              description="Ajoutez le constat amiable signé"
              file={formData.constat}
              onFileSelect={(file) => setFormData(prev => ({ ...prev, constat: file }))}
              icon={FileText}
            />

            <div className="space-y-4">
              <Label>Photos des dégâts</Label>
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => document.getElementById('damage-upload').click()}
              >
                <input
                  id="damage-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const newPhotos = Array.from(e.target.files);
                    setFormData(prev => ({
                      ...prev,
                      damagePhotos: [...prev.damagePhotos, ...newPhotos]
                    }));
                  }}
                />
                <Camera className="h-8 w-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Cliquez pour ajouter des photos
                </p>
                <p className="text-xs text-gray-400">
                  Format: JPG, PNG • Max 10 Mo par photo
                </p>
              </div>

              {formData.damagePhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  {formData.damagePhotos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border"
                    >
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({
                            ...prev,
                            damagePhotos: prev.damagePhotos.filter((_, i) => i !== index)
                          }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  const isStepValid = () => {
    switch (activeStep) {
      case 1:
        return !!formData.selectedInsurance;
      case 2:
        return !!formData.userLicense && !!formData.userInsurance;
      case 3:
        return !!formData.otherLicense && !!formData.otherInsurance;
      case 4:
        return formData.location && 
               formData.description && 
               formData.damagePhotos.length > 0 && 
               !!formData.constat;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const submitFormData = new FormData();
      
      // Add basic info
      submitFormData.append('insuranceId', formData.selectedInsurance.id);
      submitFormData.append('date', format(formData.date, 'yyyy-MM-dd'));
      submitFormData.append('location', formData.location);
      submitFormData.append('description', formData.description);

      // Add documents
      submitFormData.append('userLicense', formData.userLicense);
      submitFormData.append('userInsurance', formData.userInsurance);
      submitFormData.append('otherLicense', formData.otherLicense);
      submitFormData.append('otherInsurance', formData.otherInsurance);
      submitFormData.append('constat', formData.constat);

      // Add damage photos
      formData.damagePhotos.forEach((photo) => {
        submitFormData.append('damagePhotos', photo);
      });

      const response = await fetch('http://localhost:6500/api/claims/create', {
        method: 'POST',
        body: submitFormData
      });

      if (response.ok) {
        navigate('/claims');
      } else {
        throw new Error('Failed to submit claim');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
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
                onClick={() => navigate('/insurance')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour aux assurances
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Déclarer un sinistre</h1>
              <p className="text-sm text-gray-500 mt-1">
                Suivez les étapes pour déclarer votre sinistre
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
                      <p className={`text-sm font-medium
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

            {/* Warning Message for Required Fields */}
            {!isStepValid() && (
              <Alert className="mb-6" variant="warning">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Champs requis</AlertTitle>
                <AlertDescription>
                  Veuillez remplir tous les champs obligatoires avant de continuer.
                </AlertDescription>
              </Alert>
            )}

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
                      Soumettre la déclaration
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClaimForm;
                