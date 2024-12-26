import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Book,
  Search,
  FileText,
  Map,
  ChevronRight,
  Loader2,
  MapPin,
  FileCheck,
  Clock,
  AlertTriangle,
  Building2,
  ScrollText,
  Plus,
  Home,
  LibrarySquare,
  History,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';



import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card";

import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

import Header from './Elements/Header';
import Sidebar from './Elements/Sidebar';

const ActionCard = ({ icon: Icon, title, description, onClick, variant = "default" }) => (
  <Card 
    className={`cursor-pointer transition-all duration-300 border hover:border-blue-600 hover:shadow-md
      ${variant === "warning" ? 'hover:border-yellow-600' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className={`p-2 rounded-lg w-fit mb-3
        ${variant === "warning" ? 'bg-yellow-50' : 'bg-blue-50'}`}>
        <Icon className={`h-5 w-5 ${variant === "warning" ? 'text-yellow-600' : 'text-blue-600'}`} />
      </div>
      <h3 className="font-medium text-base text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 line-clamp-2">{description}</p>
      <div className="mt-3 flex items-center text-sm font-medium text-blue-600">
        <span>Commencer</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </div>
    </CardContent>
  </Card>
);

const getStatusBadge = (status) => {
    const configs = {
      pending: {
        label: 'En attente',
        variant: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      completed: {
        label: 'Traitée',
        variant: 'bg-green-100 text-green-800 border-green-200'
      },
      rejected: {
        label: 'Rejetée',
        variant: 'bg-red-100 text-red-800 border-red-200'
      }
    };
    return configs[status] || { label: status, variant: 'bg-gray-100' };
  };


const Conservation = () => {
  const [activeItem, setActiveItem] = useState('conservation');
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const [propertyRegistrations, setPropertyRegistrations] = useState([]);
    const [loadingRegistrations, setLoadingRegistrations] = useState(true);

    // Add this useEffect
    useEffect(() => {
    fetchUserRegistrations();
    }, []);

    const fetchUserRegistrations = async () => {
    try {
        setLoadingRegistrations(true);
        const response = await fetch(`http://localhost:6500/api/property/user/${user.id}`);
        const data = await response.json();
        setPropertyRegistrations(data);
    } catch (error) {
        console.error('Error fetching registrations:', error);
    } finally {
        setLoadingRegistrations(false);
    }
    };

  useEffect(() => {
    fetchUserConsultations();
  }, []);

  const fetchUserConsultations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:6500/api/title-consultations/user/${user.id}`);
      const data = await response.json();
      setConsultations(data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    switch(action) {
      case 'search':
        navigate('/conservation/search');
        break;
      case 'register':
        navigate('/conservation/register');
        break;
      case 'history':
        navigate('/conservation/history');
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex w-72 border-r bg-white">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} className="w-full" />
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <ScrollArea className="flex-1">
          <main className="p-4">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Conservation Foncière</h1>
                <p className="text-sm text-gray-500 mt-1">Gérez vos biens immobiliers et consultez les titres fonciers</p>
              </div>

              {/* Main Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionCard
                  icon={Search}
                  title="Consulter un titre foncier"
                  description="Recherchez et consultez les informations d'un titre foncier existant"
                  onClick={() => handleActionClick('search')}
                />
                <ActionCard
                  icon={Plus}
                  title="Immatriculer un bien"
                  description="Lancez la procédure d'immatriculation pour un nouveau bien immobilier"
                  onClick={() => handleActionClick('register')}
                  variant="warning"
                />
                <ActionCard
                  icon={History}
                  title="Historique des demandes"
                  description="Suivez vos demandes d'immatriculation et vos consultations"
                  onClick={() => handleActionClick('history')}
                />
              </div>

              {/* Services Overview */}
              <Card className="border-none shadow">
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Vos Demandes de Consultation</CardTitle>
                      <CardDescription>Suivez l'état de vos demandes de consultation des titres</CardDescription>
                    </div>
                    <Button
                      onClick={() => handleActionClick('search')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle Demande
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : consultations.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune demande</h3>
                      <p className="text-gray-500">Vous n'avez pas encore effectué de demande de consultation</p>
                      <Button
                        onClick={() => handleActionClick('search')}
                        className="mt-4"
                        variant="outline"
                      >
                        Faire une demande
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {consultations.map((consultation) => (
                        <Card
                          key={consultation.id}
                          className="hover:bg-gray-50 transition-colors cursor-pointer border"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">
                                      Titre N°{consultation.title_number}
                                    </h3>
                                    <Badge className={getStatusBadge(consultation.status).variant}>
                                      {getStatusBadge(consultation.status).label}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Conservation: {consultation.conservation_fonciere}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Type: {consultation.property_type}
                                  </p>
                                </div>
                              </div>
                              
                            </div>
                            {consultation.agent_response && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-700">{consultation.agent_response}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Registrations Section */}
                <Card className="border-none shadow">
                <CardHeader className="p-6">
                    <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Vos Demandes d'Immatriculation</CardTitle>
                        <CardDescription>
                        Suivez l'état de vos demandes d'immatriculation de biens
                        </CardDescription>
                    </div>
                    <Button
                        onClick={() => handleActionClick('register')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouvelle Demande
                    </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    {loadingRegistrations ? (
                    <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                    ) : propertyRegistrations.length === 0 ? (
                    <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                        Aucune demande d'immatriculation
                        </h3>
                        <p className="text-gray-500">
                        Vous n'avez pas encore soumis de demande d'immatriculation
                        </p>
                        <Button
                        onClick={() => handleActionClick('register')}
                        className="mt-4"
                        variant="outline"
                        >
                        Immatriculer un bien
                        </Button>
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {propertyRegistrations.map((registration) => (
                        <Card
                            key={registration.id}
                            className="hover:bg-gray-50 transition-colors border"
                        >
                            <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Home className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">
                                        {registration.property_type}
                                    </h3>
                                    <Badge className={getStatusBadge(registration.status).variant}>
                                        {getStatusBadge(registration.status).label}
                                    </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                    {registration.property_address}
                                    </p>
                                    {registration.title_number && (
                                    <p className="text-sm text-gray-500">
                                        Titre N°{registration.title_number}
                                    </p>
                                    )}
                                </div>
                                </div>
                                {registration.status === 'completed' && (
                                <a
                                    href={`http://localhost:6500/api/property/documents/serve/${registration.final_document_mongo_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <FileCheck className="h-4 w-4" />
                                    Certificat d'Immatriculation
                                </a>
                                )}
                            </div>
                            {registration.agent_response && (
                                <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Réponse de l'agent:</span>{' '}
                                    {registration.agent_response}
                                </p>
                                </div>
                            )}
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    )}
                </CardContent>
                </Card>

              {/* Information Section */}
              <Card className="border-none shadow">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Informations Importantes</CardTitle>
                  <CardDescription className="text-sm">Guide et procédures pour la conservation foncière</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Accordion type="single" collapsible className="text-sm">
                    {[
                      {
                        title: "Procédure d'immatriculation",
                        content: "L'immatriculation se fait en plusieurs étapes: dépôt de la demande, bornage, publication, et établissement du titre foncier"
                      },
                      {
                        title: "Documents requis",
                        content: "Les documents nécessaires incluent : pièce d'identité, acte de propriété, plan topographique, et attestation administrative"
                      },
                      {
                        title: "Délais de traitement",
                        content: "Le délai moyen de traitement varie selon la complexité du dossier, généralement entre 3 et 6 mois"
                      },
                      {
                        title: "Frais et taxes",
                        content: "Les frais comprennent les droits d'immatriculation, frais de bornage, et taxes de publication"
                      }
                    ].map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="py-2">{item.title}</AccordionTrigger>
                        <AccordionContent className="text-gray-600">{item.content}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Conservation;



