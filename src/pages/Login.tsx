import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { User, Lock, LogIn, Smile, KeyRound } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const Login = () => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      console.log("Login data:", data);
      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao realizar login. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121B22] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#202C33] p-8 rounded-xl shadow-lg border border-[#2A3942]">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="bg-[#2A3942] p-3 rounded-xl">
              <Smile className="h-12 w-12 text-[#00A884]" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white">Bem-vindo!</h2>
          <p className="text-gray-400">Faça login para acessar sua conta</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="seu@email.com" 
                      {...field}
                      className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-300">
                    <Lock className="h-4 w-4" />
                    Senha
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="******" 
                      {...field}
                      className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="flex justify-end">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm text-[#00A884] hover:text-[#1DA57A] transition-colors font-medium flex items-center gap-1"
                    >
                      <KeyRound className="h-3 w-3" />
                      Esqueceu a senha?
                    </Button>
                  </div>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#00A884] hover:bg-[#1DA57A] transition-all duration-300 rounded-lg font-medium flex items-center justify-center gap-2 shadow-md"
              disabled={loading}
            >
              <LogIn className="h-5 w-5" />
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-gray-400">
            Ainda não tem uma conta?{" "}
            <Button 
              variant="link" 
              className="p-0 text-[#00A884] hover:text-[#1DA57A] transition-colors font-medium"
            >
              Cadastre-se
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
