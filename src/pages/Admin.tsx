
import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar2 from '../components/Navbar2';
import SubNav2 from '../components/SubNav2';
import { usePermissions } from '../hooks/usePermissions';

const Admin = () => {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // Verifica se tem pelo menos uma permissão administrativa
  const hasAnyAdminPermission = (
    hasPermission('admin_places') ||
    hasPermission('admin_events') ||
    hasPermission('admin_stores') ||
    hasPermission('admin_news') ||
    hasPermission('admin_categories')
  );

  if (!hasAnyAdminPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar a área administrativa.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

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
