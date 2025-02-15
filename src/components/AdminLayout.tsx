
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import AdminSidebar from "./AdminSidebar";
import Navbar2 from "./Navbar2";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      
      {/* Mobile menu button */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <Button
          variant="default"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full shadow-lg"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 mt-16">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
