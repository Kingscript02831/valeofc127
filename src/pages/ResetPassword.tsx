
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto p-4 min-h-screen flex flex-col justify-center">
      <div className="space-y-6 bg-card p-6 rounded-lg shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Recuperar Senha</h1>
          <p className="text-muted-foreground">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar email de recuperação"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Lembrou sua senha?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate("/login")}
            >
              Fazer login
            </Button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
