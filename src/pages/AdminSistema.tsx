
import React from "react";
import SystemSettings from "@/components/admin/SystemSettings";
import LocationsManagement from "@/components/admin/LocationsManagement";
import PermAdmin from "@/components/admin/PermAdmin";

const AdminSistema = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-8">
        <SystemSettings />
        <LocationsManagement />
        <PermAdmin />
      </div>
    </div>
  );
};

export default AdminSistema;
