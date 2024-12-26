import React, { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  FileCheck,
  Book,
  Loader2,
  CheckCircle2,
  Clock,
  CircleDollarSign
} from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { ScrollArea } from "../../ui/scroll-area";
import Header from '../Elements/Header';
import Sidebar from '../Elements/Sidebar';



  const ConfirmationStep = ({ data }) => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Récapitulatif de la demande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Conservation Foncière</span>
              <span className="font-medium">{data.conservation_fonciere}</span>
            </div>
  
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">N° du titre</span>
              <span className="font-medium">{data.title_number}</span>
            </div>
  
            {data.title_index && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Indice</span>
                <span className="font-medium">{data.title_index}</span>
              </div>
            )}
  
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Type de bien</span>
              <span className="font-medium">{data.property_type}</span>
            </div>
  
            {data.property_address && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Adresse</span>
                <span className="font-medium">{data.property_address}</span>
              </div>
            )}
  
            <div className="flex items-center gap-2 mt-4 p-4 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Traitement de la demande</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Votre demande sera traitée par un agent dans les plus brefs délais. 
                  Vous serez notifié par email dès qu'une réponse sera disponible.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  const ConsulterTitre = () => {
    const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('conservation');

  // Use uncontrolled inputs with refs
  const titleNumberRef = useRef(null);
  const titleIndexRef = useRef(null);
  const specialIndexRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    conservation_fonciere: '',
    title_number: '',
    title_index: '',
    special_index: '',
    property_type: '',
    property_address: '',
    purpose_of_consultation: ''
  });
      const steps = [
        { id: 1, title: 'Information Titre', icon: Book },
        { id: 2, title: 'Détails Propriété', icon: Building2 },
        { id: 3, title: 'Confirmation', icon: CheckCircle2 }
      ];
    
      const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
      };
    
      const renderStep1 = () => (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Conservation Foncière</Label>
            <Select 
              defaultValue={formData.conservation_fonciere} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, conservation_fonciere: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une conservation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AL HOCEIMA">AL HOCEIMA</SelectItem>
                <SelectItem value="TETOUAN">TETOUAN</SelectItem>
                <SelectItem value="TANGER">TANGER</SelectItem>
              </SelectContent>
            </Select>
          </div>
    
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>N° du titre</Label>
              <Input
                ref={titleNumberRef}
                placeholder="06/12345"
                type="text"
                defaultValue={formData.title_number}
                onBlur={(e) => setFormData(prev => ({ ...prev, title_number: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Indice</Label>
              <Input
                ref={titleIndexRef}
                type="text"
                defaultValue={formData.title_index}
                onBlur={(e) => setFormData(prev => ({ ...prev, title_index: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Indice spécial</Label>
              <Input
                ref={specialIndexRef}
                type="text"
                defaultValue={formData.special_index}
                onBlur={(e) => setFormData(prev => ({ ...prev, special_index: e.target.value }))}
              />
            </div>
          </div>
        </div>
      );
    
      const renderStep2 = () => (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Type de bien</Label>
            <Select 
              defaultValue={formData.property_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de bien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENTIAL">Résidentiel</SelectItem>
                <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                <SelectItem value="AGRICULTURAL">Agricole</SelectItem>
                <SelectItem value="INDUSTRIAL">Industriel</SelectItem>
              </SelectContent>
            </Select>
          </div>
    
          <div className="space-y-2">
            <Label>Adresse du bien</Label>
            <Textarea
              defaultValue={formData.property_address}
              onBlur={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
              placeholder="Adresse complète du bien"
              rows={3}
            />
          </div>
    
          <div className="space-y-2">
            <Label>Motif de la consultation</Label>
            <Textarea
              defaultValue={formData.purpose_of_consultation}
              onBlur={(e) => setFormData(prev => ({ ...prev, purpose_of_consultation: e.target.value }))}
              placeholder="Précisez le motif de votre demande de consultation"
              rows={4}
            />
          </div>
        </div>
      );
  
    const isStepValid = () => {
      switch (currentStep) {
        case 1:
          return formData.conservation_fonciere && formData.title_number;
        case 2:
          return formData.property_type && formData.property_address && formData.purpose_of_consultation;
        case 3:
          return true;
        default:
          return false;
      }
    };
  
    const handleSubmit = async () => {
      setIsSubmitting(true);
      try {
        const response = await fetch('http://localhost:6500/api/title-consultations/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            user_id: JSON.parse(localStorage.getItem('user')).id
          })
        });
  
        if (response.ok) {
          navigate('/conservation');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsSubmitting(false);
      }
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
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200
                  ${currentStep > step.id ? "bg-blue-600" : 
                    currentStep === step.id ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <step.icon className={`h-5 w-5 ${
                  currentStep >= step.id ? "text-white" : "text-gray-500"
                }`} />
              </div>
              <span className={`mt-2 text-sm font-medium ${
                currentStep >= step.id ? "text-blue-600" : "text-gray-500"
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  
    const StepComponent = () => {
        switch (currentStep) {
          case 1:
            return renderStep1();
          case 2:
            return renderStep2();
          case 3:
            return <ConfirmationStep data={formData} />;
          default:
            return null;
        }
      };
  
    return (
      <div className="flex h-screen bg-gray-50">
        <aside className="hidden md:flex w-72 border-r bg-white">
          <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
        </aside>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header user={user}/>
          
          <ScrollArea className="flex-1">
            <main className="p-4">
              <div className="max-w-[1400px] mx-auto">
                <div className="mb-6">
                  <Button
                    variant="ghost"
                    className="mb-4"
                    onClick={() => navigate('/conservation')}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Consultation de Titre Foncier
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Complétez les informations pour consulter un titre foncier
                  </p>
                </div>
  
                <div className="flex gap-6">
                  <div className="flex-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                      <Progress currentStep={currentStep} />
  
                      <div className="mt-8">
                        <StepComponent />
                      </div>
  
                      <div className="flex justify-between pt-6 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(prev => prev - 1)}
                          disabled={currentStep === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Retour
                        </Button>
  
                        <Button
                          onClick={() => {
                            if (currentStep === steps.length) {
                              handleSubmit();
                            } else {
                              setCurrentStep(prev => prev + 1);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={isSubmitting || !isStepValid()}
                        >
                          {currentStep === steps.length ? (
                            isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Traitement...
                              </>
                            ) : (
                              <>
                                Soumettre la demande
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
  
                  <div className="w-80 shrink-0">
                    <Card className="border-none shadow-sm sticky top-4">
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg">Récapitulatif</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-3 text-sm">
                          {formData.conservation_fonciere && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">Conservation</span>
                              <span className="font-medium">{formData.conservation_fonciere}</span>
                            </div>
                          )}
                          {formData.title_number && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">N° du titre</span>
                              <span className="font-medium">{formData.title_number}</span>
                            </div>
                          )}
                          {formData.property_type && (
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-500">Type de bien</span>
                              <span className="font-medium">{formData.property_type}</span>
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
  
  export default ConsulterTitre;