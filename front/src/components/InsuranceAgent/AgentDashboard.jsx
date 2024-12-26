import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutDashboard,
    ClipboardList,
    CarFront,
    User2,
    FileCheck,
    FileClock,
    FileX,
    ChevronRight,
    Search,
    Filter,
    Download,
    Eye,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    Bell,
    Settings,
    LogOut,
    Menu,
    Users,
    AlertTriangle,
    ChevronDown,
    Clock,
    Shield
  } from 'lucide-react';

  import { useNavigate } from 'react-router-dom';

import { insuranceService, authService } from '../../services/insuranceService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const getDocumentUrl = (mongoId, fileName) => {
  if (!mongoId) return null;
  // Check if the file is a PDF based on the filename
  const isPDF = fileName?.toLowerCase().endsWith('.pdf');
  return `http://localhost:6500/api/insurance/documents/serve/${mongoId}`;e
};


const AgentDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [processingAction, setProcessingAction] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [activeItem, setActiveItem] = useState('insurance');

    const [attestationFile, setAttestationFile] = useState(null);
    const attestationInputRef = useRef(null);

    

    const handleLogout = async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
      };
  
    // Mock data
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchInsurances = async () => {
            try {
                setLoading(true);
                // Use getAllInsurances instead of getPendingInsurances
                const data = await insuranceService.getAllInsurances();
                setRequests(data);
            } catch (error) {
                console.error('Error fetching insurances:', error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchInsurances();
    }, []);

    const stats = {
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      total: requests.length
    };
  
    const handleRequestAction = async (action) => {
        setProcessingAction(true);
        try {
            if (action === 'approved') {
                attestationInputRef.current?.click();
                return;
            }
    
            if (action === 'rejected') {

              await insuranceService.updateInsuranceStatus(selectedRequest.id, action);

           

           } else {
              await insuranceService.updateInsuranceStatus(selectedRequest.id, action);
           }
         
            const updatedData = await insuranceService.getAllInsurances();
            setRequests(updatedData);
            setSelectedRequest(null);
        } catch (error) {
            console.error('Error updating insurance status:', error);
        } finally {
            setProcessingAction(false);
        }
    };

    const handleAttestationUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingAction(true);
    try {
        await insuranceService.updateInsuranceStatus(selectedRequest.id, 'approved', file);
        // Use getAllInsurances here too
        const updatedData = await insuranceService.getAllInsurances();
        setRequests(updatedData);
        setSelectedRequest(null);
    } catch (error) {
        console.error('Error uploading attestation:', error);
    } finally {
        setProcessingAction(false);
        event.target.value = '';
    }
};
  
const SidebarLink = ({ icon: Icon, label, active, path }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
};

    const filteredRequests = requests.filter(request => {
        const matchesSearch = (
          request.marque?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.modele?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.immatriculation?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
  
    const getStatusBadge = (status) => {
      const configs = {
        pending: { 
          label: 'En attente', 
          variant: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
        },
        approved: { 
          label: 'Approuvée', 
          variant: 'bg-green-100 text-green-800 border-green-200' 
        },
        rejected: { 
          label: 'Rejetée', 
          variant: 'bg-red-100 text-red-800 border-red-200' 
        }
      };
      return configs[status] || { label: status, variant: 'bg-gray-100' };
    };
  
    return (
      <div className="min-h-screen bg-gray-50/95">
        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
          style={{ width: '280px' }}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold">A</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Agent Dashboard</h2>
                  <p className="text-xs text-gray-500">Gestion des assurances</p>
                </div>
              </div>
            </div>
  
            {/* Sidebar Links */}
            <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
                <SidebarLink
                icon={ClipboardList}
                label="Demandes d'assurance"
                active={activeItem === 'insurance'}
                path="/agent/insurancedash"
                />
                <SidebarLink
                icon={AlertTriangle}
                label="Cas sinistres"
                active={activeItem === 'claims'}
                path="/agent/claimdash"
                />
                <SidebarLink
                icon={Users}
                label="Clients"
                active={activeItem === 'clients'}
                path="/agent/clients"
                />
            </nav>
            </ScrollArea>
  
  
            {/* Sidebar Footer */}
            <div className="p-4 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User2 className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900">Ahmed Bennani</p>
                      <p className="text-xs text-gray-500">Agent d'assurance</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>
  
        {/* Main Content */}
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'md:ml-[280px]' : ''}`}>
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-white border-b">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>
  
          {/* Page Content */}
          <main className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Demandes</p>
                      <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <ClipboardList className="h-5 w-5 text-blue-700" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-blue-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full" 
                        style={{ width: `${(stats.approved / stats.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">En attente</p>
                      <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                    </div>
                    <div className="p-2 bg-yellow-200 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-green-600">Approuvées</p>
                      <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
                    </div>
                    <div className="p-2 bg-green-200 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
  
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-red-600">Rejetées</p>
                      <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
                    </div>
                    <div className="p-2 bg-red-200 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
  
            {/* Main Content Card */}
            <Card className="border-none shadow-sm">
              <CardHeader className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Demandes d'assurance</CardTitle>
                    <CardDescription>Gérez les demandes d'assurance entrantes</CardDescription>
                  </div>
                  <div className="flex items-center gap-3 flex-1 md:flex-none md:max-w-md">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher une demande..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrer par statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="approved">Approuvées</SelectItem>
                        <SelectItem value="rejected">Rejetées</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
  
              <ScrollArea className="h-[600px]">
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                    
                    {filteredRequests.map((request) => (
  <Card 
    key={request.id}
    className="hover:bg-gray-50 transition-colors cursor-pointer border shadow-sm"
    onClick={() => setSelectedRequest(request)}
  >
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CarFront className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900">
                {request.marque} {request.modele}
              </h3>
              <Badge className={getStatusBadge(request.status).variant}>
                {getStatusBadge(request.status).label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-gray-500">
                {request.immatriculation}
              </p>
              <Separator orientation="vertical" className="h-4" />
              <p className="text-sm text-gray-500">
                {format(new Date(request.created_at), 'dd/MM/yyyy')}
              </p>
            </div>
            <div className="mt-1">
              <p className="text-sm text-gray-500">
                Valeur: {request.valeur_neuf?.toLocaleString()} DH
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
        {request.status === 'approved' && request.attestation_mongo_id && (
          <a
          href={getDocumentUrl(request.attestation_mongo_id, 'attestation.pdf')}
          target="_blank"
          rel="noopener noreferrer"
          download="attestation.pdf"
        >
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Télécharger Attestation
          </Button>
        </a>
        )}
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
))}
                    </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          <input
            type="file"
            ref={attestationInputRef}
            className="hidden"
            accept=".pdf"
            onChange={handleAttestationUpload}
            />

          {/* Request Details Dialog */}
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="sticky top-0 z-10 bg-white pb-4">
                <DialogTitle className="text-xl flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Détails de la Demande
                </DialogTitle>
                <DialogDescription>
                {selectedRequest && `Demande N°${selectedRequest.id} - Soumise le ${format(new Date(selectedRequest.created_at), 'dd/MM/yyyy', { locale: fr })}`}
                </DialogDescription>
              </DialogHeader>

              {selectedRequest && (
                <div className="space-y-6 pt-2">
                  {/* Client & Vehicle Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <Card className="border shadow-sm">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <User2 className="h-4 w-4" />
                          Informations Client
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                        <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-medium">
                        {selectedRequest.first_name} {selectedRequest.last_name}
                        </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{selectedRequest.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Numéro télephone</p>
                            <p className="font-medium">{selectedRequest.phone_number}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">num CIN</p>
                            <p className="font-medium">{selectedRequest.card_number}</p>
                        </div>


                        <div>
                            <p className="text-sm text-gray-500">Statut</p>
                            <Badge className={getStatusBadge(selectedRequest.status).variant}>
                            {getStatusBadge(selectedRequest.status).label}
                            </Badge>
                        </div>
                        </div>
                        
                      </CardContent>
                    </Card>

                    <Card className="border shadow-sm">
                      <CardHeader className="p-4">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CarFront className="h-4 w-4" />
                          Informations Véhicule
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-2">
                            <div>
                            <p className="text-sm text-gray-500">Marque & Modèle</p>
                            <p className="font-medium">{selectedRequest.marque} {selectedRequest.modele}</p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500">Immatriculation</p>
                            <p className="font-medium">{selectedRequest.immatriculation}</p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500">Date de circulation</p>
                            <p className="font-medium">
                                {format(new Date(selectedRequest.date_circulation), 'dd/MM/yyyy', { locale: fr })}
                            </p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500">Nombre de places</p>
                            <p className="font-medium">{selectedRequest.places}</p>
                            </div>
                            <div>
                            <p className="text-sm text-gray-500">Valeur</p>
                            <p className="font-medium">{selectedRequest.valeur_neuf?.toLocaleString()} DH</p>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                  </div>

                  {/* Documents Section */}
                                  
                <Card className="border shadow-sm">
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Documents Requis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-4">
                      {/* License Document */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Permis de conduire</span>
                        </div>
                        <a 
                          href={getDocumentUrl(selectedRequest.license_mongo_id, selectedRequest.license_filename)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          download={selectedRequest.license_filename}
                        >
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {selectedRequest.license_filename?.toLowerCase().endsWith('.pdf') ? 'Télécharger' : 'Voir'}
                          </Button>
                        </a>
                      </div>
                      
                      {/* Registration Document */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Carte grise</span>
                        </div>
                        <a 
                          href={getDocumentUrl(selectedRequest.registration_mongo_id, selectedRequest.registration_filename)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          download={selectedRequest.registration_filename}
                        >
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Télécharger PDF
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                  {/* Insurance Details */}
                  <Card className="border shadow-sm">
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Détails de l'Assurance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <p className="text-sm text-gray-500">Formule choisie</p>
                        <p className="font-medium capitalize">{selectedRequest.plan_type}</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Prime annuelle</p>
                        <p className="font-medium">{selectedRequest.annual_price?.toLocaleString()} DH</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Usage</p>
                        <p className="font-medium capitalize">{selectedRequest.usage_type}</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Kilométrage</p>
                        <p className="font-medium">{selectedRequest.kilometrage} km/an</p>
                        </div>
                    </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  {selectedRequest.status === 'pending' && (
              <>
                  <DialogFooter className="flex justify-between items-center !mt-6">
                      <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setShowRejectDialog(true)}
                          disabled={processingAction}
                      >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter la demande
                      </Button>
                      <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleRequestAction('approved')}
                          disabled={processingAction}
                      >
                          {processingAction ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Approuver et Ajouter Attestation
                      </Button>
                  </DialogFooter>

                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Confirmer le rejet</DialogTitle>
                              <DialogDescription>
                                  Cette action va rejeter la demande et rembourser automatiquement le client.
                                  Cette action ne peut pas être annulée.
                              </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                              <Button
                                  variant="outline"
                                  onClick={() => setShowRejectDialog(false)}
                              >
                                  Annuler
                              </Button>
                              <Button
                                  variant="destructive"
                                  onClick={async () => {
                                      setShowRejectDialog(false);
                                      handleRequestAction('rejected');
                                  }}
                                  disabled={processingAction}
                              >
                                  {processingAction ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                      <XCircle className="h-4 w-4 mr-2" />
                                  )}
                                  Confirmer le rejet
                              </Button>
                          </DialogFooter>
                      </DialogContent>
                  </Dialog>
              </>
          )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;