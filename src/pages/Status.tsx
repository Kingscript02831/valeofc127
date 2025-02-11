
import React from "react";

const Status = () => {
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg p-4 border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full border-2 border-blue-500" />
          <div>
            <h3 className="font-medium text-gray-900">Meu status</h3>
            <p className="text-sm text-gray-500">
              Toque para atualizar seu status
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
