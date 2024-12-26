import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CircleDollarSign,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Shield,
  Plus,
  RefreshCcw,
  AlertTriangle,
  ArrowRight,
  Car,
  Clock,
  FileText,
  Activity,
  CheckCircle2,
  Upload,
  FileCheck,
  Star,
  CheckSquare,
  Loader2,
  X,
} from 'lucide-react';
  
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Calendar } from "../../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { ScrollArea } from "../../ui/scroll-area";
import Header from '../Elements/Header';
import Sidebar from '../Elements/Sidebar';

const API_URL = 'http://localhost:6500/api';

// API service functions
const insuranceService = {
  
  async uploadDocument(file, userId, documentType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('documentType', documentType);
  
    try {
      const response = await fetch(`${API_URL}/insurance/upload`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Upload failed');
      }
  
      const data = await response.json();
      // Make sure these property names match what your backend returns
      return {
        id: data.id,
        mongoId: data.mongoId,
        fileName: data.file_name,
        filePath: data.file_path,
        documentType: data.document_type
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },


  async createInsurance(insuranceData) {
    try {
      // Log the data being sent
      console.log('Creating insurance with data:', insuranceData);
  
      const response = await fetch(`${API_URL}/insurance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...insuranceData,
          // Ensure MongoDB IDs are explicitly included
          licenseMongoId: insuranceData.licenseMongoId,
          registrationMongoId: insuranceData.registrationMongoId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Insurance creation failed');
      }
      
      const data = await response.json();
      console.log('Insurance creation response:', data);
      return data;
    } catch (error) {
      console.error('Insurance creation error:', error);
      throw error;
    }
  },

  async getDocumentUrl(mongoId) {
    return `${API_URL}/insurance/documents/serve/${mongoId}`;
  },
      
  async createCheckoutSession(insuranceData) {
    try {
      const response = await fetch(`${API_URL}/insurance/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(insuranceData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Checkout creation failed');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }

};

const calculateInsurancePlans = (carValue) => {
  const multipliers = {
    basic: 0.03,
    premium: 0.045,
    exclusive: 0.06
  };

  const minimumPrices = {
    basic: 1500,
    premium: 2500,
    exclusive: 3500
  };

  const calculatePrice = (multiplier, minimumPrice) => {
    const calculatedPrice = Math.round(carValue * multiplier);
    return Math.max(calculatedPrice, minimumPrice);
  };

  return [
    {
      id: 'basic',
      name: 'Formule Basic',
      price: calculatePrice(multipliers.basic, minimumPrices.basic),
      description: 'Protection essentielle pour votre véhicule',
      features: [
        'Responsabilité civile',
        'Assistance de base',
        'Protection du conducteur'
      ]
    },
    {
      id: 'premium',
      name: 'Formule Premium',
      price: calculatePrice(multipliers.premium, minimumPrices.premium),
      description: 'Protection complète avec garanties étendues',
      features: [
        'Tous les avantages Basic',
        'Bris de glace',
        'Vol et incendie',
        'Assistance premium'
      ]
    },
    {
      id: 'exclusive',
      name: 'Formule Exclusive',
      price: calculatePrice(multipliers.exclusive, minimumPrices.exclusive),
      description: 'La protection la plus complète disponible',
      features: [
        'Tous les avantages Premium',
        'Véhicule de remplacement',
        'Catastrophes naturelles',
        'Protection tous risques'
      ]
    }
  ];
};

const steps = [
  { id: 1, title: 'Documents', icon: FileCheck },
  { id: 2, title: 'Véhicule', icon: Car },
  { id: 3, title: 'Usage', icon: Shield },
  { id: 4, title: 'Options', icon: Plus },
  { id: 5, title: 'Formule', icon: CheckCircle2 },
  { id: 6, title: 'Paiement', icon: CircleDollarSign },
];

const DocumentSelector = ({ title, description, documents, selectedDoc, onSelect, documentType }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    setIsUploading(true);
    try {
      let ocrData = null;
      // First handle OCR if it's a registration document
      if (documentType === 'registration') {
        const formData = new FormData();
        formData.append('image', file);
  
        // Call OCR endpoint
        const ocrResponse = await fetch('http://127.0.0.1:5000/api/extract-text', {
          method: 'POST',
          body: formData
        });
  
        if (ocrResponse.ok) {
          const ocrResult = await ocrResponse.json();
          if (ocrResult.success) {
            ocrData = {
              marque: ocrResult.extracted_text.Marque || '',
              modele: ocrResult.extracted_text.Modele,
              immatriculation: ocrResult.extracted_text['Numero d\'immatriculation'] || ''
            };
            console.log('OCR Data:', ocrData);
          }
        }
      }
  
      // Proceed with document upload
      const uploadedDoc = await insuranceService.uploadDocument(file, user.id, documentType);
      console.log('Server response:', uploadedDoc);
  
      const docInfo = {
        id: uploadedDoc.id,
        mongoId: uploadedDoc.mongoId,
        file_name: uploadedDoc.fileName,
        file_path: uploadedDoc.filePath,
        document_type: documentType,
        ocrData // Include OCR data in the document info
      };
  
      console.log('Document info to be set:', docInfo);
      onSelect(docInfo);
  
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  
    return (
      <Card className="border-none shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            <Card 
              className={cn(
                "border-2 border-dashed transition-colors cursor-pointer",
                isUploading 
                  ? "border-blue-400 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-400"
              )}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-2 bg-blue-50 rounded-full">
                    {isUploading ? (
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {isUploading 
                      ? 'Téléchargement en cours...'
                      : 'Glissez-déposez ou cliquez pour télécharger'
                    }
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    disabled={isUploading}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isUploading) fileInputRef.current?.click();
                    }}
                  >
                    {isUploading ? 'Téléchargement...' : 'Parcourir'}
                  </Button>
                </div>
              </CardContent>
            </Card>
  
            {/* Show selected file or saved documents */}
            {selectedDoc && (
            <div className="bg-blue-50 rounded-lg p-3 mt-4">
                <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <FileCheck className="h-4 w-4 text-green-500 mr-2" />
                    <span className="text-sm font-medium">Document sélectionné</span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(null)}
                    className="h-8 px-2 hover:bg-blue-100"
                >
                    <X className="h-4 w-4" />
                </Button>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                {selectedDoc.file_name}
                </div>
            </div>
            )}

            
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const DocumentsStep = ({ data, setData }) => {

    const handleDocumentSelect = (docType) => (docInfo) => {
      console.log('Document Info received:', docInfo);
    
      if (docType === 'registration' && docInfo?.ocrData) {
        // Update the form data with OCR data
        setData(prevData => ({
          ...prevData,
          selectedRegistration: docInfo,
          marque: docInfo.ocrData.marque,
          modele: docInfo.ocrData.modele,
          immatriculation: docInfo.ocrData.immatriculation
        }));
      } else {
        // Handle license document or documents without OCR data
        setData(prevData => ({
          ...prevData,
          [docType === 'license' ? 'selectedLicense' : 'selectedRegistration']: docInfo
        }));
      }
    };
  
    return (
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-3" />
            <div>
              <h4 className="font-medium text-amber-800">Documents requis</h4>
              <p className="text-sm text-amber-700 mt-1">
                Pour souscrire à une assurance, nous avons besoin de votre permis de conduire 
                et de la carte grise du véhicule à assurer.
              </p>
            </div>
          </div>
        </div>
  
        <DocumentSelector
        title="Permis de conduire"
        description="Sélectionnez votre permis de conduire valide"
        documents={[]}
        selectedDoc={data.selectedLicense}
        onSelect={handleDocumentSelect('license')}
        documentType="license"
      />

      <DocumentSelector
        title="Carte grise"
        description="Sélectionnez la carte grise du véhicule à assurer"
        documents={[]}
        selectedDoc={data.selectedRegistration}
        onSelect={handleDocumentSelect('registration')}
        documentType="registration"
      />
  
  {(data.selectedLicense || data.selectedRegistration) && (
  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
    <h4 className="font-medium text-sm mb-2">Documents sélectionnés</h4>
    <div className="space-y-2">
      {data.selectedLicense && (
        <div className="flex items-center text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
          <span>Permis de conduire : {data.selectedLicense.file_name}</span>  {/* Changed from fileName */}
        </div>
      )}
      {data.selectedRegistration && (
        <div className="flex items-center text-sm">
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
          <span>Carte grise : {data.selectedRegistration.file_name}</span>  {/* Changed from fileName */}
        </div>
      )}
    </div>
  </div>
)}
      </div>
    );
  };
  
  const Progress = ({ currentStep }) => (
    <div className="relative">
      <div className="absolute top-5 w-full">
        <div className="h-0.5 bg-gray-200 relative">
          <div 
            className="absolute h-0.5 bg-blue-600 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200",
                currentStep > step.id ? "bg-blue-600" : 
                currentStep === step.id ? "bg-blue-600" : "bg-gray-200"
              )}
            >
              <step.icon className={cn(
                "h-5 w-5",
                currentStep >= step.id ? "text-white" : "text-gray-500"
              )} />
            </div>
            <span className={cn(
              "mt-2 text-sm font-medium",
              currentStep >= step.id ? "text-blue-600" : "text-gray-500"
            )}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );


  const VehicleStep = ({ data, setData }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
        <Label htmlFor="marque">Marque</Label>
          <Select 
            value={data.marque || ''} 
            onValueChange={(value) => setData({ ...data, marque: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la marque" />
            </SelectTrigger>
            <SelectContent>
              {data.marque && (
                <SelectItem value={data.marque.toUpperCase()}>
                  {data.marque.toUpperCase()}
                </SelectItem>
              )}
              <SelectItem value="peugeot">Peugeot</SelectItem>
            <SelectItem value="citroen">Citroën</SelectItem>
            <SelectItem value="bmw">BMW</SelectItem>
            <SelectItem value="mercedes">Mercedes</SelectItem>
            <SelectItem value="audi">Audi</SelectItem>
            <SelectItem value="volkswagen">Volkswagen</SelectItem>
            <SelectItem value="toyota">Toyota</SelectItem>
            <SelectItem value="honda">Honda</SelectItem>
            <SelectItem value="hyundai">Hyundai</SelectItem>
            <SelectItem value="nissan">Nissan</SelectItem>
            <SelectItem value="ford">Ford</SelectItem>
            <SelectItem value="chevrolet">Chevrolet</SelectItem>
            <SelectItem value="kia">Kia</SelectItem>
            <SelectItem value="volvo">Volvo</SelectItem>
            <SelectItem value="mazda">Mazda</SelectItem>
            <SelectItem value="subaru">Subaru</SelectItem>
            <SelectItem value="tesla">Tesla</SelectItem>
            <SelectItem value="fiat">Fiat</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
        <Label htmlFor="modele">Modèle</Label>
          <Input 
            id="modele"
            placeholder="Ex: modele"
            value={data.modele || ''}
            onChange={(e) => setData({ ...data, modele: e.target.value })}
            className={data.modele ? "border-blue-200 bg-blue-50" : ""}
          />
          {data.modele && (
            <p className="text-xs text-blue-600">Détecté par OCR</p>
          )}
        </div>
      </div>
  
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date de mise en circulation</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !data.dateCirculation && "text-muted-foreground"
                )}
              >
                {data.dateCirculation ? (
                  format(data.dateCirculation, 'dd/MM/yyyy')
                ) : (
                  <span>Sélectionnez une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={data.dateCirculation}
                onSelect={(date) => setData({ ...data, dateCirculation: date })}
                initialFocus
                disabled={(date) => date > new Date() || date < new Date('1950-01-01')}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
       <Label htmlFor="immatriculation">Immatriculation</Label>
          <Input 
            id="immatriculation"
            placeholder="Ex: AB-123-CD"
            value={data.immatriculation || ''}
            onChange={(e) => setData({ ...data, immatriculation: e.target.value })}
            className={data.immatriculation ? "border-blue-200 bg-blue-50" : ""}
          />
          {data.immatriculation && (
            <p className="text-xs text-blue-600">Détecté par OCR</p>
          )}
          </div>
      </div>
  
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="places">Nombre de places</Label>
          <Select value={data.places} onValueChange={(value) => setData({ ...data, places: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez" />
            </SelectTrigger>
            <SelectContent>
              {[2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="valeurNeuf">Valeur à neuf (DH)</Label>
          <Input 
            id="valeurNeuf"
            type="number"
            placeholder="Ex: 200000"
            value={data.valeurNeuf}
            onChange={(e) => setData({ ...data, valeurNeuf: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
  
  const UsageStep = ({ data, setData }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Type d'usage</Label>
        <Select value={data.usage} onValueChange={(value) => setData({ ...data, usage: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez l'usage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personnel">Usage personnel</SelectItem>
            <SelectItem value="professionnel">Usage professionnel</SelectItem>
            <SelectItem value="mixte">Usage mixte</SelectItem>
          </SelectContent>
        </Select>
      </div>
  
      <div className="space-y-2">
        <Label>Kilométrage annuel estimé</Label>
        <Select value={data.kilometrage} onValueChange={(value) => setData({ ...data, kilometrage: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le kilométrage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5000">Moins de 5 000 km</SelectItem>
            <SelectItem value="10000">5 000 - 10 000 km</SelectItem>
            <SelectItem value="15000">10 000 - 15 000 km</SelectItem>
            <SelectItem value="20000">15 000 - 20 000 km</SelectItem>
            <SelectItem value="25000">Plus de 20 000 km</SelectItem>
          </SelectContent>
        </Select>
      </div>
  
      <div className="space-y-2">
        <Label>Lieu de stationnement habituel</Label>
        <Select value={data.parking} onValueChange={(value) => setData({ ...data, parking: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le type de stationnement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="garage">Garage privé</SelectItem>
            <SelectItem value="parking">Parking surveillé</SelectItem>
            <SelectItem value="rue">Voie publique</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
  
  const OptionsStep = ({ data, setData }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            id: 'brisGlace',
            title: 'Bris de Glace',
            description: 'Couverture des dommages aux vitres',
            price: '+150 DH'
          },
          {
            id: 'assistanceRoute',
            title: 'Assistance Route',
            description: 'Dépannage 24/7 et véhicule de remplacement',
            price: '+200 DH'
          },
          {
            id: 'volIncendie',
            title: 'Vol et Incendie',
            description: 'Protection contre le vol et l\'incendie',
            price: '+300 DH'
          },
          {
            id: 'catastropheNaturelle',
            title: 'Catastrophes Naturelles',
            description: 'Couverture des dégâts naturels',
            price: '+250 DH'
          }
        ].map((option) => (
          <Card 
            key={option.id}
            className={cn(
              "cursor-pointer transition-all",
              data.options?.includes(option.id) 
                ? "border-blue-600 bg-blue-50"
                : "hover:border-gray-400"
            )}
            onClick={() => {
              const newOptions = data.options?.includes(option.id)
                ? data.options.filter(id => id !== option.id)
                : [...(data.options || []), option.id];
              setData({ ...data, options: newOptions });
            }}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-base flex justify-between items-center">
                {option.title}
                <span className="text-sm font-normal text-gray-600">{option.price}</span>
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );

  
  const PlanCard = ({ plan, isSelected, onSelect }) => (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        isSelected ? "border-2 border-blue-600 shadow-lg" : "hover:border-gray-300"
      )}
      onClick={() => onSelect(plan.id)}
    >
      {isSelected && (
        <div className="absolute top-0 right-0">
          <div className="bg-blue-600 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
            Sélectionné
          </div>
        </div>
      )}
      
      {plan.id === 'premium' && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-center py-1 text-sm font-medium">
          Recommandé
        </div>
      )}
  
      <CardHeader className={cn(
        "p-6 border-b transition-colors",
        plan.id === 'premium' ? "bg-blue-50" : ""
      )}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
            <CardDescription className="text-sm">{plan.description}</CardDescription>
          </div>
          {plan.id === 'premium' && (
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold text-blue-600">{plan.price} DH</span>
          <span className="text-gray-500 text-sm ml-2">/ an</span>
        </div>
      </CardHeader>
  
      <CardContent className="p-6">
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
  
      <CardFooter className="p-6 pt-0">
        <Button 
          variant={isSelected ? "default" : "outline"} 
          className="w-full"
          onClick={() => onSelect(plan.id)}
        >
          {isSelected ? "Formule sélectionnée" : "Choisir cette formule"}
        </Button>
      </CardFooter>
    </Card>
  );
  
  const FormuleStep = ({ data, setData }) => {
    const plans = calculateInsurancePlans(Number(data.valeurNeuf) || 0);
  
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={data.planId === plan.id}
              onSelect={(planId) => setData({ ...data, planId })}
            />
          ))}
        </div>
      </div>
    );
  };

  const PaymentStep = ({ data }) => {
    // Calculate amounts
    const selectedPlan = calculateInsurancePlans(Number(data.valeurNeuf))
      .find(plan => plan.id === data.planId);
      
    const optionsPrices = {
      brisGlace: 150,
      assistanceRoute: 200,
      volIncendie: 300,
      catastropheNaturelle: 250
    };
  
    const optionsTotal = data.options?.reduce((sum, option) => 
      sum + (optionsPrices[option] || 0), 0) || 0;
  
    const totalAmount = selectedPlan?.price + optionsTotal;
  
    const optionNames = {
      brisGlace: 'Bris de Glace',
      assistanceRoute: 'Assistance Route',
      volIncendie: 'Vol et Incendie',
      catastropheNaturelle: 'Catastrophes Naturelles'
    };
  
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleDollarSign className="h-5 w-5 text-blue-600" />
              Récapitulatif du paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Base Plan */}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">
                  Formule {selectedPlan?.name}
                </span>
                <span className="font-medium">{selectedPlan?.price} DH</span>
              </div>
  
              {/* Options */}
              {data.options?.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">Options sélectionnées:</div>
                  {data.options.map(option => (
                    <div key={option} className="flex justify-between items-center py-1">
                      <span className="text-gray-600">{optionNames[option]}</span>
                      <span className="font-medium">+{optionsPrices[option]} DH</span>
                    </div>
                  ))}
                </div>
              )}
  
              {/* Total */}
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <span className="font-medium text-lg">Total à payer</span>
                <span className="font-bold text-xl text-blue-600">{totalAmount} DH</span>
              </div>
  
              {/* Payment Security Notice */}
              <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-blue-700">
                  Le paiement sera traité de manière sécurisée via Stripe
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };


  const NewInsurance = () => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('insurance');
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
      selectedLicense: null,  // Changed from empty string to null
      selectedRegistration: null, 
      marque: '',
      modele: '',
      dateCirculation: null,
      immatriculation: '',
      places: '',
      valeurNeuf: '',
      usage: '',
      kilometrage: '',
      parking: '',
      options: [],
      planId: ''
    });
  const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  setIsUploading(true);
  try {
    const uploadedDoc = await insuranceService.uploadDocument(file, user.id, documentType);
    console.log('Server response:', uploadedDoc);

    // Create document info matching your DB column names exactly
    const docInfo = {
      id: uploadedDoc.id,
      file_name: uploadedDoc.file_name,
      file_path: uploadedDoc.file_path,
      document_type: uploadedDoc.document_type
    };

    console.log('Document info to be set:', docInfo);
    onSelect(docInfo);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (error) {
    console.error('Upload error:', error);
  } finally {
    setIsUploading(false);
  }
};

const isStepValid = () => {
  switch (currentStep) {
    case 1: // Documents
      console.log('Checking documents:', {
        license: formData.selectedLicense,
        registration: formData.selectedRegistration
      });
      return Boolean(
        formData.selectedLicense?.file_name && 
        formData.selectedRegistration?.file_name
      );
    case 2: // Vehicle
      return Boolean(
        formData.marque &&
        formData.modele &&
        formData.dateCirculation &&
        formData.immatriculation &&
        formData.places &&
        formData.valeurNeuf
      );
    case 3: // Usage
      return Boolean(
        formData.usage &&
        formData.kilometrage &&
        formData.parking
      );
    case 4: // Options
      return true; // Options are optional
    case 5: // Plan
      return Boolean(formData.planId);
    case 6: // Payment
      return true; // Payment step is always valid since it's just a summary
    default:
      return false;
  }
};

    
  
    const handleNext = () => {
      if (isStepValid()) {
        setCurrentStep(prev => prev + 1);
      } else {
        alert('Veuillez remplir tous les champs obligatoires avant de continuer.');
      }
    };
  
    const handleBack = () => {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      }
    };
  
    const handleSubmit = async () => {
      if (!isStepValid()) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
      }
    
      try {
        setIsSubmitting(true);
        const user = JSON.parse(localStorage.getItem('user'));
    
        console.log('Selected License:', formData.selectedLicense);
        console.log('Selected Registration:', formData.selectedRegistration);
    
        const selectedPlan = calculateInsurancePlans(Number(formData.valeurNeuf))
          .find(plan => plan.id === formData.planId);
    
        const optionsPrices = {
          brisGlace: 150,
          assistanceRoute: 200,
          volIncendie: 300,
          catastropheNaturelle: 250
        };
    
        const optionsTotal = formData.options?.reduce((sum, option) => 
          sum + (optionsPrices[option] || 0), 0) || 0;
    
        const totalAmount = selectedPlan.price + optionsTotal;
    
        // Create the insurance data object with the correct structure
        const insuranceData = {
          userId: user.id,
          // Document IDs from PostgreSQL
          licenseDocId: formData.selectedLicense?.id,
          registrationDocId: formData.selectedRegistration?.id,
          // MongoDB IDs - make sure to use the correct property names
          licenseMongoId: formData.selectedLicense?.mongoId || formData.selectedLicense?.mongoid,
          registrationMongoId: formData.selectedRegistration?.mongoId || formData.selectedRegistration?.mongoid,
          marque: formData.marque,
          modele: formData.modele,
          dateCirculation: formData.dateCirculation.toISOString(),
          immatriculation: formData.immatriculation,
          places: parseInt(formData.places),
          valeurNeuf: parseFloat(formData.valeurNeuf),
          usageType: formData.usage,
          kilometrage: formData.kilometrage,
          parkingType: formData.parking,
          options: formData.options,
          planType: formData.planId,
          annualPrice: totalAmount
        };
    
        console.log('Insurance Data being sent:', insuranceData);
    
        const createdInsurance = await insuranceService.createInsurance(insuranceData);
        console.log('Created Insurance:', createdInsurance);
    
        const checkoutSession = await insuranceService.createCheckoutSession({
          ...insuranceData,
          insuranceId: createdInsurance.id
        });
    
        window.location.href = checkoutSession.url;
          
      } catch (error) {
        console.error('Submission error:', error);
        alert('Erreur lors de la création de l\'assurance. Veuillez réessayer.');
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const CurrentStepComponent = [
      DocumentsStep,
      VehicleStep,
      UsageStep,
      OptionsStep,
      FormuleStep,
      PaymentStep
    ][currentStep - 1];
  
    return (
      <div className="flex h-screen bg-gray-50">
        <aside className="hidden md:flex w-72 border-r bg-white">
          <Sidebar activeItem={activeItem} setActiveItem={setActiveItem}  />
        </aside>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={JSON.parse(localStorage.getItem('user')) || {}} />
          
          <ScrollArea className="flex-1">
            <main className="p-4">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Nouvelle Assurance Auto</h1>
                  <p className="text-sm text-gray-500 mt-1">Complétez les informations pour votre nouvelle assurance</p>
                </div>
  
                <div className="flex gap-6">
                  {/* Main Form Section */}
                  <div className="flex-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                      <Progress currentStep={currentStep} />
  
                      <div className="mt-8">
                        <CurrentStepComponent 
                          data={formData}
                          setData={setFormData}
                        />
                      </div>
  
                      <div className="flex justify-between pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={handleBack}
                          disabled={currentStep === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Retour
                        </Button>
  
                        <Button
                          onClick={async () => {
                            if (currentStep === steps.length) {
                              await handleSubmit();
                            } else {
                              handleNext();
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={isSubmitting || !isStepValid()}
                        >
                          {currentStep === steps.length ? (
                            isSubmitting ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Traitement...
                              </div>
                            ) : (
                              <>
                                Souscrire
                                <CheckCircle2 className="ml-2 h-4 w-4" />
                              </>
                            )
                          ) : (
                            <>
                              Suivant
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
  
                  {/* Summary Panel */}
                  <div className="w-80 shrink-0">
                    <Card className="border-none shadow-sm sticky top-4">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Récapitulatif</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-3 text-sm">
                        {formData.selectedLicense && (
                                <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-500">Permis</span>
                                <span className="font-medium">{formData.selectedLicense.file_name}</span>
                                </div>
                            )}
                            {formData.selectedRegistration && (
                                <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-500">Carte grise</span>
                                <span className="font-medium">{formData.selectedRegistration.file_name}</span>
                                </div>
                            )}
                            {formData.marque && formData.modele && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">Véhicule</span>
                              <span className="font-medium">{`${formData.marque} ${formData.modele}`}</span>
                            </div>
                          )}
                          {formData.dateCirculation && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">Mise en circulation</span>
                              <span className="font-medium">
                                {format(formData.dateCirculation, 'dd/MM/yyyy')}
                              </span>
                            </div>
                          )}
                          {formData.valeurNeuf && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">Valeur à neuf</span>
                              <span className="font-medium">
                                {formData.valeurNeuf} DH
                              </span>
                            </div>
                          )}
                          {formData.usage && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">Usage</span>
                              <span className="font-medium">{formData.usage}</span>
                            </div>
                          )}
                          {formData.options?.length > 0 && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">Options</span>
                              <span className="font-medium">{formData.options.length} sélectionnée(s)</span>
                            </div>
                          )}
                          {formData.planId && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">Formule</span>
                              <span className="font-medium text-blue-600">
                                {formData.planId === 'basic' ? 'Basic' : 
                                 formData.planId === 'premium' ? 'Premium' : 'Exclusive'}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>
    );
  };
  
  export default NewInsurance;