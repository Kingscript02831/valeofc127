
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold">
            Vale Notícias
          </Link>
          
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin")}
            >
              Admin
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
