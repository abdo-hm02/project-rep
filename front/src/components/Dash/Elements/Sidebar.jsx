import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Shield,
  FileText,
  Clock,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from "../../../lib/utils"

import { Button } from "../../ui/button";



const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start h-12",
        active 
          ? "bg-gradient-to-r from-blue-50 to-transparent text-blue-700 hover:from-blue-100" 
          : "hover:bg-gray-50"
      )}
      onClick={onClick}
    >
      <Icon className={cn(
        "mr-3 h-5 w-5 transition-colors",
        active ? "text-blue-700" : "text-gray-500"
      )} />
      <span className={cn(
        "font-medium",
        active ? "text-blue-700" : "text-gray-700"
      )}>
        {label}
      </span>
    </Button>
  );


  const Sidebar = ({ activeItem, setActiveItem, className }) => {
    const navigate = useNavigate();
    const menuItems = [
      { icon: Home, label: 'Tableau de bord', id: 'dashboard', path: '/DashUser' },
      { icon: Shield, label: 'Assurances', id: 'insurance', path: '/insurance' },
      { icon: Clock, label: 'Conservation', id: 'conservation', path: '/conservation' },
      { icon: Settings, label: 'Paramètres', id: 'settings', path: '/DashUser' },
    ];

    const handleItemClick = (item) => {
      setActiveItem(item.id);
      navigate(item.path);
    };
  
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">MonService</h1>
        </div>
        <div className="flex-1 py-6 px-4">
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeItem === item.id}
                onClick={() => handleItemClick(item)}
              />
            ))}
          </div>
        </div>
        <div className="p-4 border-t mt-auto">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/auth');
            }}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </div>
    );
  };

  export default Sidebar;
