
import React from 'react';

const Admin = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total de Notícias</h3>
          <p className="text-3xl font-bold text-gray-700 mt-2">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total de Eventos</h3>
          <p className="text-3xl font-bold text-gray-700 mt-2">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total de Lugares</h3>
          <p className="text-3xl font-bold text-gray-700 mt-2">0</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">Total de Lojas</h3>
          <p className="text-3xl font-bold text-gray-700 mt-2">0</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atividade Recente</h3>
          <p className="text-gray-500">Nenhuma atividade recente.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Próximos Eventos</h3>
          <p className="text-gray-500">Nenhum evento agendado.</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
