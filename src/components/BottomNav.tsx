
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Bell, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 md:hidden">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center">
          <Link to="/" className="flex flex-col items-center">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Início</span>
          </Link>
          <Link to="/notify" className="flex flex-col items-center">
            <Bell className="h-5 w-5" />
            <span className="text-xs mt-1">Notificações</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center">
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Perfil</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
