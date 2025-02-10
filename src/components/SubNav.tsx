
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SubNav = () => {
  const location = useLocation();
  
  const links = [
    { path: '/', label: 'Início' },
    { path: '/notify', label: 'Notificações' },
  ];

  return (
    <nav className="w-full border-b mt-16">
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 py-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm ${
                location.pathname === link.path
                  ? 'text-primary font-medium'
                  : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
