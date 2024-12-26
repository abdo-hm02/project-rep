import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  User2,
  FileText,
  Book,
  Home,
  Download,
  Upload,
  ScrollText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { Textarea } from "../ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const AgentPropertyDash = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [activeItem, setActiveItem] = useState('registrations');
  const [agentResponse, setAgentResponse] = useState('');
  const [titleNumber, setTitleNumber] = useState('');
  const [finalDocument, setFinalDocument] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = async () => {
    try {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = '/auth';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:6500/api/property/all');
      const data = await response.json();
      setRegistrations(data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    completed: registrations.filter(r => r.status === 'completed').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  const handleRegistrationResponse = async (status) => {
    if (status === 'completed' && !titleNumber) {
      alert('Veuillez fournir un numéro de titre foncier');
      return;
    }

    if (status === 'completed' && !finalDocument) {
      alert('Veuillez joindre le certificat d\'immatriculation');
      return;
    }

    setProcessingAction(true);
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('agent_response', agentResponse);
      formData.append('agent_id', user.id);
      formData.append('title_number', titleNumber);
      if (finalDocument) {
        formData.append('final_document', finalDocument);
      }

      const response = await fetch(`http://localhost:6500/api/property/${selectedRegistration.id}/status`, {
        method: 'PATCH',
        body: formData
      });

      if (response.ok) {
        await fetchRegistrations();
        setSelectedRegistration(null);
        setAgentResponse('');
        setTitleNumber('');
        setFinalDocument(null);
      }
    } catch (error) {
      console.error('Error updating registration:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const downloadDocument = async (documentId) => {
    try {
      const response = await fetch(`http://localhost:6500/api/property/documents/serve/${documentId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        label: 'En attente',
        variant: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      completed: {
        label: 'Immatriculée',
        variant: 'bg-green-100 text-green-800 border-green-200'
      },
      rejected: {
        label: 'Rejetée',
        variant: 'bg-red-100 text-red-800 border-red-200'
      }
    };
    return configs[status] || { label: status, variant: 'bg-gray-100' };
  };

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = 
      registration.property_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registration.title_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderSidebarLink = (icon, label, path) => {
    const Icon = icon;
    const navigate = useNavigate();
    
    return (
      <button
        onClick={() => navigate(path)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
          text-gray-600 hover:bg-gray-100"
      >
        <Icon className="h-5 w-5" />
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/95">
        {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{ width: '280px' }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-semibold">C</span>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Agent Conservation</h2>
                <p className="text-xs text-gray-500">Conservation Foncière</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
                {renderSidebarLink(ScrollText, "Demandes de Consultation", "/agent/conservationdash")}
                {renderSidebarLink(Book, "Demandes d'Immatriculation", "/agent/propertydash")}
                </nav>
          </ScrollArea>

          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User2 className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                    <p className="text-xs text-gray-500">Agent de Conservation</p>
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
                <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
      {/* Sidebar and Header components remain the same */}
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

        {/* Main Content */}
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
                    <Book className="h-5 w-5 text-blue-700" />
           0         </div>
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
                <p className="text-sm font-medium text-green-600">Immatriculées</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
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
        <Card className="border-none">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Demandes d'Immatriculation</CardTitle>
                <CardDescription>
                  Gérez les demandes d'immatriculation des biens immobiliers
                </CardDescription>
              </div>
              {/* Search and Filter controls */}
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
                  {filteredRegistrations.map((registration) => (
                    <Card
                      key={registration.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedRegistration(registration)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Home className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">
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
                          <div className="text-sm text-gray-500">
                            {format(new Date(registration.created_at), 'dd/MM/yyyy')}
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

        {/* Registration Details Dialog */}
        <Dialog open={!!selectedRegistration} onOpenChange={() => setSelectedRegistration(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Détails de la Demande d'Immatriculation</DialogTitle>
              <DialogDescription>
                Demande soumise le {selectedRegistration && 
                  format(new Date(selectedRegistration.created_at), 'dd MMMM yyyy')}
              </DialogDescription>
            </DialogHeader>

            {selectedRegistration && (
              <div className="space-y-6">
                {/* User Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                        <User2 className="h-4 w-4" />
                        Informations du Demandeur
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        <p className="font-medium">
                            {selectedRegistration.first_name} {selectedRegistration.last_name}
                        </p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedRegistration.email}</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium">{selectedRegistration.phone_number}</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">CIN</p>
                        <p className="font-medium">{selectedRegistration.card_number}</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium">{selectedRegistration.address}</p>
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Date de naissance</p>
                        <p className="font-medium">
                            {selectedRegistration.birth_date && 
                            format(new Date(selectedRegistration.birth_date), 'dd/MM/yyyy')}
                        </p>
                        </div>
                    </CardContent>
                    </Card>

                {/* Property Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Informations du Bien</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Type de bien</p>
                      <p className="font-medium">{selectedRegistration.property_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Adresse</p>
                      <p className="font-medium">{selectedRegistration.property_address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Superficie</p>
                      <p className="font-medium">{selectedRegistration.property_size} m²</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Usage</p>
                      <p className="font-medium">{selectedRegistration.property_usage}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Documents Fournis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                    <a
                        href={`http://localhost:6500/api/property/documents/serve/${selectedRegistration.identity_doc_mongo_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Pièce d'identité
                    </a>

                    <a
                        href={`http://localhost:6500/api/property/documents/serve/${selectedRegistration.title_deed_mongo_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Titre de propriété
                    </a>

                    <a
                        href={`http://localhost:6500/api/property/documents/serve/${selectedRegistration.property_plan_mongo_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Plan topographique
                    </a>

                    <a
                        href={`http://localhost:6500/api/property/documents/serve/${selectedRegistration.location_cert_mongo_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Certificat de localisation
                    </a>

                    <a
                        href={`http://localhost:6500/api/property/documents/serve/${selectedRegistration.tax_cert_mongo_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Attestation fiscale
                    </a>
                    </div>
                </CardContent>
                </Card>

                {selectedRegistration.status === 'pending' && (
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Décision</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Title Number Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Numéro du Titre Foncier
                          </label>
                          <Input
                            placeholder="Entrez le numéro du titre"
                            value={titleNumber}
                            onChange={(e) => setTitleNumber(e.target.value)}
                          />
                    </div>

                    {/* Final Document Upload */}
                    <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Certificat d'Immatriculation
                    </label>
                    <div 
                        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                                hover:border-blue-400 transition-colors"
                        onClick={() => document.getElementById('final-document').click()}
                    >
                        <input
                        id="final-document"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => setFinalDocument(e.target.files[0])}
                        />
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        {finalDocument ? (
                        <p className="mt-2 text-sm text-gray-600">{finalDocument.name}</p>
                        ) : (
                        <>
                            <p className="mt-2 text-sm text-gray-500">
                            Cliquez pour ajouter le certificat d'immatriculation
                            </p>
                            <p className="text-xs text-gray-400">Format: PDF, JPG, PNG</p>
                        </>
                        )}
                    </div>
                    </div>

                    {/* Agent Response */}
                    <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Commentaire ou Motif de Rejet
                    </label>
                    <Textarea
                        placeholder="Ajoutez un commentaire ou expliquez le motif du rejet..."
                        value={agentResponse}
                        onChange={(e) => setAgentResponse(e.target.value)}
                        rows={4}
                    />
                    </div>
                    </CardContent>
                    </Card>

                    <DialogFooter className="flex justify-between items-center gap-4">
                    <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleRegistrationResponse('rejected')}
                    disabled={processingAction}
                    >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter la demande
                    </Button>
                    <Button
                    onClick={() => handleRegistrationResponse('completed')}
                    disabled={processingAction}
                    className="bg-green-600 hover:bg-green-700"
                    >
                    {processingAction ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Valider l'Immatriculation
                    </Button>
                    </DialogFooter>
                    </div>
                    )}

                    {/* Show Response for completed/rejected registrations */}
                    {selectedRegistration.status !== 'pending' && (
                <Card>
                    <CardHeader>
                    <CardTitle className="text-sm">Décision de l'Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {selectedRegistration.status === 'completed' && (
                    <>
                        <div>
                        <p className="text-sm text-gray-500">Numéro du Titre</p>
                        <p className="font-medium">{selectedRegistration.title_number}</p>
                        </div>
                        <a
                        href={`http://localhost:6500/api/property/documents/serve/${selectedRegistration.final_document_mongo_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                        <FileText className="h-4 w-4 mr-2" />
                        Certificat d'Immatriculation
                        </a>
                    </>
                    )}
                    <div>
                    <p className="text-sm text-gray-500">Commentaire de l'Agent</p>
                    <p className="mt-1">{selectedRegistration.agent_response}</p>
                    </div>
                    </CardContent>
                </Card>
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

export default AgentPropertyDash;