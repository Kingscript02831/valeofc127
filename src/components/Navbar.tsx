
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="text-xl font-bold">
          Vale OFC
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
