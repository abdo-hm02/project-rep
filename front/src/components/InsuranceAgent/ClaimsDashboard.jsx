import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  CarFront,
  User2,
  FileCheck,
  FileClock,
  AlertTriangle,
  ChevronRight,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Bell,
  Settings,
  LogOut,
  Menu,
  Users,
  ChevronDown,
  Camera,
  Clock,
  Shield,
  Car,
  FileText,
  MessageCircle,
  History
} from 'lucide-react';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

import {Label} from "../ui/label"

import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { authService } from '../../services/insuranceService';

const ClaimsDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeItem, setActiveItem] = useState('claims');
  

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:6500/api/claims/all');
      const data = await response.json();
      setClaims(data);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (claimId, newStatus) => {
    setProcessingAction(true);
    try {
      const response = await fetch(`http://localhost:6500/api/claims/${claimId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await fetchClaims();
        setSelectedClaim(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    validated: claims.filter(c => c.status === 'validated').length,
    completed: claims.filter(c => c.status === 'completed').length,
    closed: claims.filter(c => c.status === 'closed').length
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        label: 'Nouveau',
        variant: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      validated: {
        label: 'Validé',
        variant: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      completed: {
        label: 'Terminé',
        variant: 'bg-green-100 text-green-800 border-green-200'
      },
      closed: {
        label: 'Clôturé',
        variant: 'bg-red-100 text-red-800 border-red-200'
      }
    };
    return configs[status] || { label: status, variant: 'bg-gray-100' };
  };

  const ClaimDetails = () => {
    if (!selectedClaim) return null;

    const documentSections = [
      {
        title: "Documents du déclarant",
        docs: [
          { id: selectedClaim.user_license_mongo_id, label: "Permis" },
          { id: selectedClaim.user_insurance_mongo_id, label: "Attestation d'assurance" }
        ]
      },
      {
        title: "Documents du tiers",
        docs: [
          { id: selectedClaim.other_license_mongo_id, label: "Permis" },
          { id: selectedClaim.other_insurance_mongo_id, label: "Attestation d'assurance" }
        ]
      }
    ];

    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sinistre #{selectedClaim.id}</DialogTitle>
          <DialogDescription>
            Déclaré le {format(new Date(selectedClaim.created_at), 'dd/MM/yyyy', { locale: fr })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions Card */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <Badge className={getStatusBadge(selectedClaim.status).variant}>
                  {getStatusBadge(selectedClaim.status).label}
                </Badge>
                <div className="flex gap-2">
                  {selectedClaim.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleStatusChange(selectedClaim.id, 'closed')}
                        disabled={processingAction}
                      >
                        Clôturer
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(selectedClaim.id, 'validated')}
                        disabled={processingAction}
                      >
                        Valider
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User2 className="h-4 w-4" />
                Informations du déclarant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Nom complet</p>
                  <p className="font-medium">
                    {selectedClaim.first_name} {selectedClaim.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedClaim.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Téléphone</p>
                  <p className="font-medium">{selectedClaim.phone_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4" />
                Véhicule concerné
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Marque & Modèle</p>
                  <p className="font-medium">{selectedClaim.marque} {selectedClaim.modele}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Immatriculation</p>
                  <p className="font-medium">{selectedClaim.immatriculation}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Sections */}
          {documentSections.map((section, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {section.docs.map((doc, docIdx) => (
                    <div key={docIdx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{doc.label}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`http://localhost:6500/api/claims/documents/serve/${doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Damage Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photos des dégâts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {selectedClaim.damage_photos_mongo_ids?.map((photoId) => (
                  <a
                    key={photoId}
                    href={`http://localhost:6500/api/claims/documents/serve/${photoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden border"
                  >
                    <img
                      src={`http://localhost:6500/api/claims/documents/serve/${photoId}`}
                      alt="Damage"
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Constat */}
          {selectedClaim.constat_mongo_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Constat Amiable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  asChild
                >
                  <a
                    href={`http://localhost:6500/api/claims/documents/serve/${selectedClaim.constat_mongo_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Voir le constat
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Repair Documents (if status is completed) */}
          {selectedClaim.status === 'completed' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  
                  Documents de réparation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Repair Photos */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedClaim.repair_photos_mongo_ids?.map((photoId) => (
                      <a
                        key={photoId}
                        href={`http://localhost:6500/api/claims/documents/serve/${photoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden border"
                      >
                        <img
                          src={`http://localhost:6500/api/claims/documents/serve/${photoId}`}
                          alt="Repair"
                          className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                  {/* Repair Bill */}
                  {selectedClaim.repair_bill_mongo_id && (
                    <Button
                      variant="outline"
                      asChild
                    >
                      <a
                        href={`http://localhost:6500/api/claims/documents/serve/${selectedClaim.repair_bill_mongo_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Voir la facture
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    );
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

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = (
      claim.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
              <button
                onClick={() => navigate('/agent/insurancedash')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeItem === 'insurance' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ClipboardList className="h-5 w-5" />
                Demandes d'assurance
              </button>
              <button
                onClick={() => navigate('/agent/claimdash')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeItem === 'claims' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <AlertTriangle className="h-5 w-5" />
                Cas sinistres
              </button>
              <button
                onClick={() => navigate('/agent/clients')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeItem === 'clients' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Users className="h-5 w-5" />
                Clients
              </button>
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
  
        {/* Main Content Area */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Sinistres</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                  </div>
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
  
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Nouveaux</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                  </div>
                  <div className="p-2 bg-yellow-200 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
  
            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">Validés</p>
                    <p className="text-2xl font-bold text-indigo-900 mt-1">{stats.validated}</p>
                  </div>
                  <div className="p-2 bg-indigo-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-indigo-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
  
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-green-600">Complétés</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{stats.completed}</p>
                  </div>
                  <div className="p-2 bg-green-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-700" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
  
          {/* Claims List */}
          <Card className="border-none shadow-sm">
            <CardHeader className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl">Déclarations de sinistre</CardTitle>
                  <CardDescription>Gérez les déclarations de sinistre</CardDescription>
                </div>
                <div className="flex items-center gap-3 flex-1 md:flex-none md:max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un sinistre..."
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
                      <SelectItem value="pending">Nouveaux</SelectItem>
                      <SelectItem value="validated">Validés</SelectItem>
                      <SelectItem value="completed">Complétés</SelectItem>
                      <SelectItem value="closed">Clôturés</SelectItem>
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
                    {filteredClaims.map((claim) => (
                      <Card
                        key={claim.id}
                        className="hover:bg-gray-50 transition-colors cursor-pointer border shadow-sm"
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-red-100 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-gray-900">
                                    Sinistre #{claim.id}
                                  </h3>
                                  <Badge className={getStatusBadge(claim.status).variant}>
                                    {getStatusBadge(claim.status).label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {claim.marque} {claim.modele}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {format(new Date(claim.created_at), 'dd/MM/yyyy')}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
  
          {/* Claim Details Dialog */}
          <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
            <ClaimDetails />
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default ClaimsDashboard;