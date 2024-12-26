import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Clock,
  Shield,
  AlertTriangle,
  ChevronLeft,
  RefreshCcw,
  Calendar,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format, addYears, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from "../../../lib/utils";

import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import { ScrollArea } from "../../ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";

import Header from '../Elements/Header';
import Sidebar from '../Elements/Sidebar';

const RenewalCard = ({ insurance }) => {
  const startDate = new Date(insurance.created_at);
  const expirationDate = addYears(startDate, 1);
  const daysRemaining = differenceInDays(expirationDate, new Date());
  
  const getExpirationStatus = () => {
    if (daysRemaining <= 0) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Expirée',
        icon: AlertTriangle,
        description: 'Assurance expirée'
      };
    } else if (daysRemaining <= 30) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Expiration proche',
        icon: Clock,
        description: `Expire dans ${daysRemaining} jours`
      };
    } else {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Active',
        icon: Shield,
        description: `Expire dans ${daysRemaining} jours`
      };
    }
  };

  const status = getExpirationStatus();
  const StatusIcon = status.icon;
  
  return (
    <Card className="w-full bg-white border-none shadow hover:shadow-md transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Car className="h-5 w-5 text-white" />
            <h3 className="font-medium text-base text-white">
              {insurance.marque} {insurance.modele}
            </h3>
          </div>
          <Badge className={`${status.color} border text-xs flex items-center gap-1`}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Numéro de police</p>
              <p className="font-medium">{insurance.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Immatriculation</p>
              <p className="font-medium">{insurance.immatriculation}</p>
            </div>
          </div>

          {/* Expiration Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  Expire le {format(expirationDate, 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
              <span className="font-medium">
                {Math.max(0, Math.min(100, ((365 - daysRemaining) / 365) * 100)).toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full
                  ${daysRemaining <= 30 
                    ? 'bg-red-500' 
                    : daysRemaining <= 90 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                style={{ width: `${Math.max(0, Math.min(100, ((365 - daysRemaining) / 365) * 100))}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {daysRemaining <= 30 ? (
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {/* handle renewal */}}
              >
                <RefreshCcw className="h-4 w-4 mr-2" />
                Renouveler maintenant
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        variant="outline" 
                        className="w-full text-gray-500"
                        disabled
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Renouvellement disponible dans {daysRemaining - 30} jours
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Le renouvellement sera disponible 30 jours avant l'expiration</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RenewInsurance = () => {
  const [activeItem, setActiveItem] = useState('insurance');
  const [loading, setLoading] = useState(true);
  const [insurances, setInsurances] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchInsurances = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:6500/api/insurance/user/${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch insurances');
        const data = await response.json();
        // Filter only approved/active insurances
        setInsurances(data.filter(insurance => insurance.status === 'approved'));
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsurances();
  }, [user.id]);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex w-72 border-r bg-white">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <ScrollArea className="flex-1">
          <main className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Renouvellement d'assurance</h1>
                  <p className="text-sm text-gray-500 mt-1">Gérez vos renouvellements d'assurance</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/insurance')}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>

              {/* Info Banner */}
              <Card className="border-none bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg h-fit">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-900">Politique de renouvellement</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Le renouvellement de votre assurance est possible dans les 30 jours précédant sa date d'expiration.
                        Nous vous enverrons un rappel par email lorsque votre assurance sera éligible au renouvellement.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : insurances.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Aucune assurance active</AlertTitle>
                  <AlertDescription>
                    Vous n'avez pas d'assurance active éligible au renouvellement.
                  </AlertDescription>
                </Alert>
              ) : (
                insurances.map((insurance) => {
                  const startDate = new Date(insurance.created_at);
                  const expirationDate = addYears(startDate, 1);
                  const daysRemaining = differenceInDays(expirationDate, new Date());
                  const progress = Math.max(0, Math.min(100, ((365 - daysRemaining) / 365) * 100));

                  return (
                    <Card 
                      key={insurance.id}
                      className={cn(
                        "border shadow-sm transition-all duration-300",
                        daysRemaining <= 30 && "border-yellow-200 bg-yellow-50/50"
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4 items-center">
                              <div className="p-3 bg-blue-100 rounded-lg">
                                <Car className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {insurance.marque} {insurance.modele}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Police N°{insurance.id} • {insurance.immatriculation}
                                </p>
                              </div>
                            </div>
                            {daysRemaining <= 30 ? (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                Éligible au renouvellement
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                Active
                              </Badge>
                            )}
                          </div>

                          {/* Expiration Info */}
                          <div className="bg-white rounded-lg p-4 border">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Expire le {format(expirationDate, 'dd MMMM yyyy', { locale: fr })}
                                </span>
                              </div>
                              <span className="text-sm font-medium">
                                {daysRemaining} jours restants
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full transition-all duration-500 rounded-full",
                                    daysRemaining <= 30 
                                      ? "bg-yellow-500" 
                                      : daysRemaining <= 90 
                                        ? "bg-blue-500" 
                                        : "bg-green-500"
                                  )}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Début</span>
                                <span>Expiration</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          {daysRemaining <= 30 ? (
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={() => navigate(`/insurance/renew/${insurance.id}`)}
                            >
                              <RefreshCcw className="h-4 w-4 mr-2" />
                              Renouveler maintenant
                            </Button>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-full">
                                    <Button 
                                      variant="outline" 
                                      className="w-full"
                                      disabled
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Disponible dans {daysRemaining - 30} jours
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="p-3">
                                  <p className="text-sm">
                                    Le renouvellement sera disponible à partir du{' '}
                                    {format(addYears(startDate, 1), 'dd MMMM yyyy', { locale: fr })}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default RenewInsurance;