
import { Outlet } from "react-router-dom";
import Navbar2 from "@/components/Navbar2";
import SubNav2 from "@/components/SubNav2";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Admin() {
  return (
    <ProtectedRoute requiredPermission="admin">
      <div className="min-h-screen">
        <Navbar2 />
        <SubNav2 />
        <div className="container mx-auto py-8 px-4">
          <Outlet />
        </div>
      </div>
    </ProtectedRoute>
  );
}
