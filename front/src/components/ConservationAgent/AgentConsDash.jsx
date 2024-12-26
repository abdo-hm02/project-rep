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
  ScrollText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';


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

import { Label } from '@mui/icons-material';

const AgentConsDash = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [consultations, setConsultations] = useState([]);
  const [activeItem, setActiveItem] = useState('consultations');
  const [agentResponse, setAgentResponse] = useState('');
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
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:6500/api/title-consultations/all');
      const data = await response.json();
      setConsultations(data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: consultations.length,
    pending: consultations.filter(c => c.status === 'pending').length,
    completed: consultations.filter(c => c.status === 'completed').length,
    rejected: consultations.filter(c => c.status === 'rejected').length
  };

  const handleConsultationResponse = async (status) => {
    if (!agentResponse && status === 'completed') {
      alert('Veuillez fournir une réponse avant de valider la consultation');
      return;
    }

    setProcessingAction(true);
    try {
      const response = await fetch(`http://localhost:6500/api/title-consultations/${selectedConsultation.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          agent_response: agentResponse,
          agent_id: JSON.parse(localStorage.getItem('user')).id
        }),
      });

      if (response.ok) {
        await fetchConsultations();
        setSelectedConsultation(null);
        setAgentResponse('');
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
    } finally {
      setProcessingAction(false);
    }
  };

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

  const filteredConsultations = consultations.filter(consultation => {
    const matchesSearch = 
      consultation.title_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultation.conservation_fonciere?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
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
                    <ScrollText className="h-5 w-5 text-blue-700" />
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
                    <p className="text-sm font-medium text-green-600">Traitées</p>
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
          <Card className="border-none shadow-sm">
            <CardHeader className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Demandes de Consultation</CardTitle>
                  <CardDescription>Gérez les demandes de consultation des titres fonciers</CardDescription>
                </div>
                <div className="flex items-center gap-3 flex-1 md:flex-none md:max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par numéro de titre..."
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
                      <SelectItem value="completed">Traitées</SelectItem>
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
                    {filteredConsultations.map((consultation) => (
                      <Card
                        key={consultation.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer border shadow-sm"
                        onClick={() => setSelectedConsultation(consultation)}
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
                                <div className="mt-1 space-y-1">
                                  <p className="text-sm text-gray-500">
                                    Conservation: {consultation.conservation_fonciere}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Type: {consultation.property_type}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(consultation.created_at), 'dd/MM/yyyy')}
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

          {/* Consultation Details Dialog */}
          <Dialog open={!!selectedConsultation} onOpenChange={() => setSelectedConsultation(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky top-0 z-10 bg-white pb-4">
                <DialogTitle>Détails de la Consultation</DialogTitle>
                <DialogDescription>
                  Demande soumise le {selectedConsultation && 
                    format(new Date(selectedConsultation.created_at), 'dd MMMM yyyy')}
                </DialogDescription>
              </DialogHeader>

              {selectedConsultation && (
                <div className="space-y-6">
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
                    {selectedConsultation.first_name} {selectedConsultation.last_name}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedConsultation.email}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{selectedConsultation.phone_number}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">CIN</p>
                    <p className="font-medium">{selectedConsultation.card_number}</p>
                </div>
                </CardContent>
            </Card>
                  {/* Property Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Informations du Titre</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">N° du Titre</p>
                        <p className="font-medium">{selectedConsultation.title_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Conservation Foncière</p>
                        <p className="font-medium">{selectedConsultation.conservation_fonciere}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Type de Propriété</p>
                        <p className="font-medium">{selectedConsultation.property_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium">{selectedConsultation.property_address}</p>
                      </div>
                      {selectedConsultation.title_index && (
                        <div>
                          <p className="text-sm text-gray-500">Index du Titre</p>
                          <p className="font-medium">{selectedConsultation.title_index}</p>
                        </div>
                      )}
                      {selectedConsultation.special_index && (
                        <div>
                          <p className="text-sm text-gray-500">Index Spécial</p>
                          <p className="font-medium">{selectedConsultation.special_index}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Request Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Détails de la Demande</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <p className="text-sm text-gray-500">Motif de la Consultation</p>
                        <p className="font-medium mt-1">{selectedConsultation.purpose_of_consultation}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Response Section */}
                  {selectedConsultation.status === 'pending' && (
                    <div className="space-y-4">
                      <div>
                        <Label>Réponse de l'Agent</Label>
                        <Textarea
                          placeholder="Saisissez votre réponse..."
                          value={agentResponse}
                          onChange={(e) => setAgentResponse(e.target.value)}
                          rows={6}
                          className="mt-2"
                        />
                      </div>

                      <DialogFooter className="flex justify-between items-center gap-4">
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleConsultationResponse('rejected')}
                          disabled={processingAction}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rejeter la demande
                        </Button>
                        <Button
                          onClick={() => handleConsultationResponse('completed')}
                          disabled={processingAction || !agentResponse.trim()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {processingAction ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Valider la Réponse
                        </Button>
                      </DialogFooter>
                    </div>
                  )}

                  {/* View Response for completed/rejected consultations */}
                  {selectedConsultation.status !== 'pending' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Réponse de l'Agent</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700">{selectedConsultation.agent_response}</p>
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

export default AgentConsDash;  