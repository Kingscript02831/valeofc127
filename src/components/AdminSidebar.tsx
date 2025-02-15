
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Store,
  MapPin,
  Tags,
  Users,
  Settings,
} from "lucide-react";
import { useSiteConfig } from "../hooks/useSiteConfig";

interface AdminSidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AdminSidebar = ({ open, setOpen }: AdminSidebarProps) => {
  const location = useLocation();
  const { data: config } = useSiteConfig();

  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Notícias",
      path: "/admin/noticias",
      icon: Newspaper,
    },
    {
      title: "Eventos",
      path: "/admin/eventos",
      icon: Calendar,
    },
    {
      title: "Lugares",
      path: "/admin/lugares",
      icon: MapPin,
    },
    {
      title: "Lojas",
      path: "/admin/lojas",
      icon: Store,
    },
    {
      title: "Categorias",
      path: "/admin/categorias",
      icon: Tags,
    },
    {
      title: "Permissões",
      path: "/admin/permissoes",
      icon: Users,
    },
    {
      title: "Configurações",
      path: "/config",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen pt-20 transition-transform lg:translate-x-0 lg:pt-16 bg-white shadow-md",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto w-64">
          <ul className="space-y-2 font-medium">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100",
                    location.pathname === item.path && "bg-gray-100"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="ml-3">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
