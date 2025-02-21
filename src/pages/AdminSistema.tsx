
import { BasicInfoUpdateInterval } from "@/components/admin/system/BasicInfoUpdateInterval";
import { ColorConfig } from "@/components/admin/system/ColorConfig";
import { SystemImages } from "@/components/admin/system/SystemImages";

const AdminSistema = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Configurações do Sistema</h1>
      
      <div className="grid gap-8">
        <BasicInfoUpdateInterval />
        <ColorConfig />
        <SystemImages />
      </div>
    </div>
  );
};

export default AdminSistema;
