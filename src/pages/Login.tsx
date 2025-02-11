
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSiteConfig } from "../hooks/useSiteConfig";

const Login = () => {
  const navigate = useNavigate();
  const { data: config, isLoading: configLoading } = useSiteConfig();

  useEffect(() => {
    // Automatically redirect to profile page
    navigate("/perfil");
  }, [navigate]);

  if (configLoading || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Login;

