
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 flex items-center justify-around z-50">
      <button 
        onClick={() => navigate('/')} 
        className={`flex flex-col items-center justify-center w-16 h-full ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Home size={24} />
        <span className="text-xs mt-1">Início</span>
      </button>
      
      <button 
        onClick={() => navigate('/search')} 
        className={`flex flex-col items-center justify-center w-16 h-full ${isActive('/search') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Search size={24} />
        <span className="text-xs mt-1">Buscar</span>
      </button>
      
      <button 
        onClick={() => navigate('/posts/new')} 
        className={`flex flex-col items-center justify-center w-16 h-full ${isActive('/posts/new') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <PlusSquare size={24} />
        <span className="text-xs mt-1">Postar</span>
      </button>
      
      <button 
        onClick={() => navigate('/notify')} 
        className={`flex flex-col items-center justify-center w-16 h-full ${isActive('/notify') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <Heart size={24} />
        <span className="text-xs mt-1">Notif.</span>
      </button>
      
      <button 
        onClick={() => navigate('/perfil')} 
        className={`flex flex-col items-center justify-center w-16 h-full ${isActive('/perfil') ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <User size={24} />
        <span className="text-xs mt-1">Perfil</span>
      </button>
    </div>
  );
};

export default BottomNav;
