
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar2 from '../components/Navbar2';
import AdminNav from '../components/AdminNav';

const Admin = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <AdminNav />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Admin;
