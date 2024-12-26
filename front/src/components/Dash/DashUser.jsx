import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  FileText,
  Bell,
  ChevronDown,
  Menu,
  Wallet,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  Loader2,
  User,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import Sidebar from './Elements/Sidebar';
import Header from './Elements/Header';

const DashUser = () => {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, activitiesRes] = await Promise.all([
          fetch(`http://localhost:6500/api/dashboard/stats/${user.id}`),
          fetch(`http://localhost:6500/api/dashboard/activities/${user.id}`)
        ]);

        if (!statsRes.ok || !activitiesRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const statsData = await statsRes.json();
        const activitiesData = await activitiesRes.json();

        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user.id) {
      fetchDashboardData();
    }
  }, [user.id]);

  const dashboardStats = [
    { 
      icon: Shield, 
      label: 'Assurances Actives', 
      value: stats?.activeInsurances || 0,
      color: 'text-blue-600 bg-blue-50'
    },
    { 
      icon: FileText, 
      label: 'Documents Stockés', 
      value: stats?.documents || 0,
      color: 'text-indigo-600 bg-indigo-50'
    },
    { 
      icon: Wallet, 
      label: 'Transactions', 
      value: stats?.transactions || 0,
      color: 'text-emerald-600 bg-emerald-50'
    }
  ];

  const getActivityIcon = (type, status) => {
    switch (type) {
      case 'insurance':
        switch (status) {
          case 'approved':
            return Shield;
          case 'pending':
            return FileText;
          case 'rejected':
            return AlertCircle;
          default:
            return FileText;
        }
      case 'claim':
        switch (status) {
          case 'resolved':
            return FileCheck;
          case 'in_progress':
            return TrendingUp;
          default:
            return AlertTriangle;
        }
      default:
        return FileText;
    }
  };

  const getActivityColor = (type, status) => {
    switch (type) {
      case 'insurance':
        switch (status) {
          case 'approved':
            return 'text-green-600 bg-green-50';
          case 'pending':
            return 'text-blue-600 bg-blue-50';
          case 'rejected':
            return 'text-red-600 bg-red-50';
          default:
            return 'text-gray-600 bg-gray-50';
        }
      case 'claim':
        switch (status) {
          case 'resolved':
            return 'text-green-600 bg-green-50';
          case 'in_progress':
            return 'text-blue-600 bg-blue-50';
          default:
            return 'text-yellow-600 bg-yellow-50';
        }
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex w-72 border-r bg-white">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} className="w-full" />
      </aside>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        
        <ScrollArea className="flex-1">
          <main className="p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Bonjour, {user?.first_name}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dashboardStats.map((stat, index) => (
                      <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all duration-200">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">
                            {stat.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                              <stat.icon className="h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold">{stat.value}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Activités récentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-4">
                            {activities.map((activity, index) => {
                              const ActivityIcon = getActivityIcon(activity.type, activity.status);
                              const colorClass = getActivityColor(activity.type, activity.status);
                              
                              return (
                                <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                  <div className={`p-2 rounded-lg shrink-0 ${colorClass}`}>
                                    <ActivityIcon className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{activity.title}</p>
                                    <p className="text-sm text-gray-600">{activity.details}</p>
                                    <p className="text-xs text-gray-500">
                                      {format(new Date(activity.timestamp), 'dd MMM yyyy, HH:mm', { locale: fr })}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg">Actions rapides</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <Button 
                            className="w-full justify-start text-left" 
                            variant="outline"
                            onClick={() => navigate('/insurance/new')}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Souscrire à une nouvelle assurance
                          </Button>
                          <Button 
                            className="w-full justify-start text-left" 
                            variant="outline"
                            onClick={() => navigate('/insurance/claim')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Déclarer un sinistre
                          </Button>
                          <Button 
                            className="w-full justify-start text-left" 
                            variant="outline"
                            onClick={() => navigate('/insurance')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Gérer mes assurances
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </main>
        </ScrollArea>
      </div>
    </div>
  );
};

export default DashUser;