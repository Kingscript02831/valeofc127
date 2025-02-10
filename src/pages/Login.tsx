
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate("/perfil");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111B21] p-6">
      <div className="w-full max-w-md bg-[#202C33]/90 backdrop-blur-md p-8 rounded-xl shadow-xl border border-white/10">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-white">Bem-vindo</h1>
          <p className="text-gray-400">Entre com suas credenciais para acessar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mt-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#2A3942] border-[#37454F] text-white placeholder-gray-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#2A3942] border-[#37454F] text-white placeholder-gray-400"
            />
            <Button
              variant="link"
              className="p-0 text-sm text-green-400 hover:text-green-300 transition"
              onClick={() => navigate("/reset-password")}
            >
              Esqueceu sua senha?
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-green-500 hover:bg-green-400 text-white font-medium rounded-lg transition duration-300 shadow-md"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <p className="text-center text-sm text-gray-400">
            Não possui uma conta?{" "}
            <Button
              variant="link"
              className="p-0 text-green-400 hover:text-green-300 transition"
              onClick={() => navigate("/signup")}
            >
              Criar conta
            </Button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
