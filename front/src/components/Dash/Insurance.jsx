import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Plus,
  RefreshCcw,
  AlertTriangle,
  ArrowRight,
  Car,
  Calendar,
  CheckCircle2,
   MapPin,
  Clock,
  FileText,
  Activity,
  ChevronRight,
  Loader2,
  X,
  Users,
  CircleDollarSign,
  Route,
  Download,
  FileDown,
  Camera,
  User2,
  Upload
} from 'lucide-react';
import {Label} from "../ui/label"
import { ScrollArea } from "../ui/scroll-area";
import { addYears, differenceInDays, isPast, format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
} from "../ui/dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";


import Header from './Elements/Header';
import Sidebar from './Elements/Sidebar';

const ActionCard = ({ icon: Icon, title, description, onClick, variant = "default" }) => (
  <Card 
    className={`cursor-pointer transition-all duration-300 border hover:border-blue-600 hover:shadow-md
      ${variant === "danger" ? 'hover:border-red-600' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className={`p-2 rounded-lg w-fit mb-3
        ${variant === "danger" ? 'bg-red-50' : 'bg-blue-50'}`}>
        <Icon className={`h-5 w-5 ${variant === "danger" ? 'text-red-600' : 'text-blue-600'}`} />
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


const getExpirationInfo = (createdAt) => {
  const startDate = new Date(createdAt);
  const expirationDate = addYears(startDate, 1);
  const daysRemaining = differenceInDays(expirationDate, new Date());
  const isExpired = isPast(expirationDate);

  return {
    expirationDate,
    daysRemaining,
    isExpired
  };
};

const API_URL = 'http://localhost:6500/api/insurance';

const ClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRepairModal, setActiveRepairModal] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchClaims = async () => {
    try {
      const response = await fetch(`http://localhost:6500/api/claims/user/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      const data = await response.json();
      setClaims(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user.id]);

  const getStatusInfo = (status) => {
    const configs = {
      'pending': {
        label: 'Nouveau',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      },
      'validated': {
        label: 'Validé',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle2
      },
      'completed': {
        label: 'Terminé',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2
      },
      'closed': {
        label: 'Clôturé',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: X
      }
    };
    return configs[status] || configs['pending'];
  };

  const RepairDocumentsModal = ({ claimId, isOpen, onClose }) => {
    const [repairPhoto, setRepairPhoto] = useState(null);
    const [repairBill, setRepairBill] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const handleSubmit = async () => {
      if (!repairPhoto || !repairBill) {
        alert("Veuillez ajouter tous les documents requis");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('repairPhoto', repairPhoto);
        formData.append('repairBill', repairBill);

        const response = await fetch(`http://localhost:6500/api/claims/${claimId}/repair-documents`, {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          await fetchClaims();
          onClose();
        }
      } catch (error) {
        console.error('Error uploading repair documents:', error);
      } finally {
        setUploading(false);
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents de réparation
            </DialogTitle>
            <DialogDescription>
              Ajoutez les photos du véhicule réparé et la facture
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Photo upload section */}
            <div className="space-y-2">
              <Label>Photo du véhicule réparé</Label>
              <Card 
                className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center
                  ${repairPhoto ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-400'}`}
                onClick={() => document.getElementById('repair-photo').click()}
              >
                <input
                  id="repair-photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setRepairPhoto(e.target.files[0])}
                />
                {repairPhoto ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600">Photo sélectionnée</span>
                  </div>
                ) : (
                  <>
                    <Camera className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Cliquez pour ajouter une photo
                    </p>
                  </>
                )}
              </Card>
            </div>

            {/* Bill upload section */}
            <div className="space-y-2">
              <Label>Facture de réparation</Label>
              <Card 
                className={`cursor-pointer border-2 border-dashed rounded-lg p-6 text-center
                  ${repairBill ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-blue-400'}`}
                onClick={() => document.getElementById('repair-bill').click()}
              >
                <input
                  id="repair-bill"
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => setRepairBill(e.target.files[0])}
                />
                {repairBill ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600">Facture sélectionnée</span>
                  </div>
                ) : (
                  <>
                    <FileText className="h-8 w-8 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Cliquez pour ajouter la facture
                    </p>
                  </>
                )}
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!repairPhoto || !repairBill || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Envoyer les documents'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur est survenue lors du chargement des déclarations.
        </AlertDescription>
      </Alert>
    );
  }

  if (claims.length === 0) {
    return (
      <Alert>
        <AlertTitle>Aucune déclaration</AlertTitle>
        <AlertDescription>
          Vous n'avez pas encore de déclaration de sinistre.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => {
        const statusInfo = getStatusInfo(claim.status);
        const StatusIcon = statusInfo.icon;

        return (
          <Card 
            key={claim.id}
            className="w-full bg-white border-none shadow hover:shadow-md transition-all duration-300"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium">
                      Sinistre #{claim.id}
                    </h3>
                    <Badge className={`${statusInfo.color} border text-xs flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {claim.location}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(claim.date), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {claim.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {claim.status === 'validated' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveRepairModal(claim.id)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Documents de réparation
                    </Button>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {claim.status === 'validated' ? 
                          "Votre déclaration a été validée. Veuillez ajouter les documents de réparation." :
                          statusInfo.label}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Repair Documents Modal */}
      {activeRepairModal && (
        <RepairDocumentsModal
          claimId={activeRepairModal}
          isOpen={true}
          onClose={() => setActiveRepairModal(null)}
        />
      )}
    </div>
  );
};




const InsuranceCard = ({ insurance }) => {
  const [showDetails, setShowDetails] = useState(false);

  const [downloadingAttestation, setDownloadingAttestation] = useState(false);

  const handleAttestationDownload = async () => {
    setDownloadingAttestation(true);
    try {
      if (insurance.attestation_mongo_id) {
        // Use the MongoDB document serving endpoint
        window.open(
          `${API_URL}/documents/serve/${insurance.attestation_mongo_id}`, 
          '_blank'
        );
      }
    } catch (error) {
      console.error('Error downloading attestation:', error);
    } finally {
      setDownloadingAttestation(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'En attente',
          icon: Clock
        };
      case 'approved':  // Add this case
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Active',
          icon: Shield
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rejetée',
          icon: X
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-700 border-gray-200',
          label: 'Inconnu',
          icon: AlertCircle
        };
    }
  };

  const formatPlanType = (planType) => {
    const planTypes = {
      'basic': 'Formule Basic',
      'premium': 'Formule Premium',
      'exclusive': 'Formule Exclusive'
    };
    return planTypes[planType] || planType;
  };

  const getUsageLabel = (usage) => {
    const usageTypes = {
      'personnel': 'Usage Personnel',
      'professionnel': 'Usage Professionnel',
      'mixte': 'Usage Mixte'
    };
    return usageTypes[usage] || usage;
  };

  const getParkingLabel = (parking) => {
    const parkingTypes = {
      'garage': 'Garage Privé',
      'parking': 'Parking Surveillé',
      'rue': 'Voie Publique'
    };
    return parkingTypes[parking] || parking;
  };

  const statusInfo = getStatusInfo(insurance.status);
  const StatusIcon = statusInfo.icon;

  return (
    <>
      <Card className="w-full bg-white border-none shadow hover:shadow-md transition-all duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Car className="h-5 w-5 text-white" />
              <h3 className="font-medium text-base text-white">
                {insurance.marque} {insurance.modele}
              </h3>
            </div>
            <Badge className={`${statusInfo.color} border text-xs flex items-center gap-1`}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Numéro de police</p>
              <p className="font-medium">{insurance.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Immatriculation</p>
              <p className="font-medium">{insurance.immatriculation}</p>
            </div>
            <div>
              <p className="text-gray-500">Type de couverture</p>
              <p className="font-medium">{formatPlanType(insurance.plan_type)}</p>
            </div>
            <div>
              <p className="text-gray-500">Prix annuel</p>
              <p className="font-medium">{insurance.annual_price} DH</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-sm"
              onClick={() => setShowDetails(true)}
            >
              <FileText className="mr-2 h-4 w-4" /> Voir les détails
            </Button>
            
            <TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <span>
      <Button
        variant="outline"
        size="sm"
        className="text-sm"
        disabled={insurance.status !== 'approved' || !insurance.attestation_mongo_id || downloadingAttestation}
        onClick={handleAttestationDownload}
      >
        {downloadingAttestation ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
      </Button>
      </span>
              </TooltipTrigger>
              <TooltipContent>
                {insurance.status === 'approved' && insurance.attestation_path
                  ? "Télécharger l'attestation d'assurance"
                  : "L'attestation sera disponible une fois l'assurance activée"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {insurance.status === 'approved' && (
  <div className="flex-1">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Renouveler
              </div>
              {(() => {
                const { daysRemaining, isExpired } = getExpirationInfo(insurance.created_at);
                
                // Add progress bar
                const progress = Math.max(0, Math.min(100, (daysRemaining / 365) * 100));
                
                return (
                  <>
                    {/* Progress bar background */}
                    <div 
                      className="absolute bottom-0 left-0 h-1 w-full bg-gray-100"
                    />
                    {/* Progress bar indicator */}
                    {/* <div 
                      className={`absolute bottom-0 left-0 h-1 transition-all duration-500
                        ${daysRemaining <= 30 
                          ? 'bg-red-500' 
                          : daysRemaining <= 90 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                      style={{ width: `${progress}%` }}
                    /> */}
                  </>
                );
              })()}
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="w-64 p-3">
          {(() => {
            const { expirationDate, daysRemaining, isExpired } = getExpirationInfo(insurance.created_at);
            
            if (isExpired) {
              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <p className="font-medium">Assurance expirée</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    Votre assurance a expiré le {format(expirationDate, 'dd MMMM yyyy')}
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 
                  ${daysRemaining <= 30 
                    ? 'text-red-600' 
                    : daysRemaining <= 90 
                      ? 'text-yellow-600' 
                      : 'text-green-600'
                  }`}>
                  <Clock className="h-4 w-4" />
                  <p className="font-medium">
                    {daysRemaining > 0 ? `Expire dans ${daysRemaining} jours` : 'Expire aujourd\'hui'}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  Date d'expiration: {format(expirationDate, 'dd MMMM yyyy')}
                </p>
                {daysRemaining <= 90 && (
                  <p className="text-sm mt-2 text-gray-600">
                    {daysRemaining <= 30 
                      ? 'Renouvellement urgent recommandé'
                      : 'Pensez à renouveler votre assurance'}
                  </p>
                )}
              </div>
            );
          })()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
)}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Car className="h-5 w-5" />
              Détails de l'assurance
            </DialogTitle>
            <DialogDescription>
              {insurance.marque} {insurance.modele}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Numéro de police</p>
                <p className="mt-1">{insurance.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge className={`${statusInfo.color} border text-xs mt-1 flex w-fit items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Car className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Informations véhicule</p>
                  <p className="text-sm text-gray-600">
                    {insurance.marque} {insurance.modele} - {insurance.immatriculation}
                  </p>
                  <p className="text-sm text-gray-600">{insurance.places} places</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Couverture</p>
                  <p className="text-sm text-gray-600">{formatPlanType(insurance.plan_type)}</p>
                  <p className="text-sm text-gray-600">{insurance.annual_price} DH/an</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Route className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Usage</p>
                  <p className="text-sm text-gray-600">{getUsageLabel(insurance.usage_type)}</p>
                  <p className="text-sm text-gray-600">{insurance.kilometrage} km/an</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium">Stationnement</p>
                  <p className="text-sm text-gray-600">{getParkingLabel(insurance.parking_type)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Fermer</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};


const InsuranceList = () => {
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        const response = await fetch(`${API_URL}/user/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch insurances');
        const data = await response.json();
        setInsurances(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsurances();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur est survenue lors du chargement des assurances. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  if (insurances.length === 0) {
    return (
      <Alert>
        <AlertTitle>Aucune assurance</AlertTitle>
        <AlertDescription>
          Vous n'avez pas encore d'assurance active. 
          <Button
            variant="link"
            className="p-0 ml-2 text-blue-600"
            onClick={() => navigate('/insurance/new')}
          >
            Souscrire à une assurance
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 justify-items-start"> {/* Added justify-items-start */}
    {insurances.map((insurance) => (
      <div key={insurance.id} className="w-[360px]"> {/* Removed justify-self-center */}
        <InsuranceCard insurance={insurance} />
      </div>
    ))}
  </div>
  );
};

const Insurance = () => {
  const [activeItem, setActiveItem] = React.useState('insurance');
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  const handleActionClick = (action) => {
    switch(action) {
      case 'new':
        navigate('/insurance/new');
        break;
      case 'claim':
        navigate('/insurance/claim');
        break;
      case 'renew':
        navigate('/insurance/renew');
        break;
      default:
        break;
    }
  };

  const activeInsurance = {
    vehicle: {
      model: "BMW Serie 3",
      plateNumber: "223 TU 456",
      year: "2022"
    },
    policyNumber: "POL-2024-89267",
    coverage: "Tous Risques",
    status: "active",
    expiryDate: "15/12/2024"
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
                <h1 className="text-2xl font-bold text-gray-900">Assurance Automobile</h1>
                <p className="text-sm text-gray-500 mt-1">Gérez votre assurance auto en toute simplicité</p>
              </div>

              {/* Main Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionCard
                  icon={Plus}
                  title="Nouvelle Assurance"
                  description="Souscrivez à une nouvelle assurance automobile en quelques étapes"
                  onClick={() => handleActionClick('new')}
                />
                <ActionCard
                  icon={AlertTriangle}
                  title="Déclarer un sinistre"
                  description="Signalez un accident ou incident et suivez votre déclaration"
                  onClick={() => handleActionClick('claim')}
                  variant="danger"
                />
                <ActionCard
                  icon={RefreshCcw}
                  title="Renouveler une assurance"
                  description="Prolongez la validité de votre assurance existante"
                  onClick={() => handleActionClick('renew')}
                />
              </div>

              {/* Active Insurances Section */}
              <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Vos Assurances Actives</h2>
                  <p className="text-sm text-gray-500">Consultez et gérez vos polices d'assurance en cours</p>
                </div>
              </div>
              <div className="flex"> {/* Removed justify-center */}
                <div className="max-w-[1200px] w-full">
                  <InsuranceList />
                </div>
              </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Vos Déclarations</h2>
                    <p className="text-sm text-gray-500">Suivez l'état de vos déclarations de sinistre</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="max-w-[850px] w-full">
                    <ClaimsList />
                  </div>
                </div>
              </div>

            

              {/* Coverage Details */}
              <Card className="border-none shadow">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Nos Garanties</CardTitle>
                  <CardDescription className="text-sm">Une protection complète pour votre véhicule</CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Accordion type="single" collapsible className="text-sm">
                    {[
                      {
                        title: "Responsabilité Civile",
                        content: "Couvre les dommages causés aux tiers lors d'un accident"
                      },
                      {
                        title: "Dommages Tous Accidents",
                        content: "Protection complète de votre véhicule, peu importe la cause"
                      },
                      {
                        title: "Vol et Incendie",
                        content: "Remboursement en cas de vol ou de dommages par le feu"
                      },
                      {
                        title: "Assistance 24/7",
                        content: "Service de dépannage et assistance disponible jour et nuit"
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

export default Insurance;