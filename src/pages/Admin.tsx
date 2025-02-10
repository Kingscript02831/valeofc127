
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar2 from '../components/Navbar2';
import SubNav2 from '../components/SubNav2';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <SubNav2 />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
