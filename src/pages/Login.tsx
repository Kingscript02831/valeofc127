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
import { User, Lock, LogIn, Smile, KeyRound, UserPlus, AtSign, Calendar, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const loginSchema = z.object({
  email: z.string().min(1, "O email é obrigatório").email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

const resetPasswordSchema = z.object({
  email: z.string().min(1, "O email é obrigatório").email("Digite um email válido"),
});

const signupSchema = z
  .object({
    email: z.string().min(1, "O email é obrigatório").email("Digite um email válido"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    username: z.string()
      .min(3, "Username deve ter pelo menos 3 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Username deve conter apenas letras, números e _"),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
    phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const signupForm = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      username: "",
      birth_date: "",
      phone: "",
    },
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast({
        title: "Bem-vindo!",
        description: "Login realizado com sucesso.",
      });
      navigate("/");
    } catch (error: any) {
      let errorMessage = "Falha ao realizar login. Tente novamente.";
      if (error.message === "Invalid login credentials") {
        errorMessage = "Email ou senha incorretos.";
      }
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: z.infer<typeof resetPasswordSchema>) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setIsResetPasswordDialogOpen(false);
      resetPasswordForm.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao enviar email de redefiniç����o de senha. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSignUp = async (data: z.infer<typeof signupSchema>) => {
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) throw signUpError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          username: data.username,
          birth_date: data.birth_date,
          phone: data.phone,
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (profileError) throw profileError;

      toast({
        title: "Conta criada!",
        description: "Sua conta foi criada com sucesso. Faça login para continuar.",
      });
      setIsSignUp(false);
    } catch (error: any) {
      let errorMessage = "Falha ao criar conta. Tente novamente.";
      if (error.message.includes("already registered")) {
        errorMessage = "Este email já está cadastrado.";
      } else if (error.message.includes("unique constraint")) {
        errorMessage = "Este username já está em uso.";
      }
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    const currentEmail = isSignUp ? signupForm.getValues("email") : loginForm.getValues("email");
    setIsSignUp(!isSignUp);
    
    // Reset forms but preserve the email
    loginForm.reset({ email: currentEmail, password: "" });
    signupForm.reset({ email: currentEmail, password: "", confirmPassword: "", name: "", username: "", birth_date: "", phone: "" });
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
          <h2 className="text-2xl font-semibold text-white">
            {isSignUp ? "Criar Conta" : "Bem-vindo!"}
          </h2>
          <p className="text-gray-400">
            {isSignUp ? "Preencha os dados para se cadastrar" : "Faça login para acessar sua conta"}
          </p>
        </div>

        {isSignUp ? (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignUp)} className="space-y-6 mt-6">
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-300">
                      <AtSign className="h-4 w-4" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="seu@email.com" 
                        {...field}
                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
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
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-300">
                      <Lock className="h-4 w-4" />
                      Confirmar Senha
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="******" 
                        {...field}
                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-300">
                      <User className="h-4 w-4" />
                      Nome Completo
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Seu nome completo"
                        {...field}
                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-300">
                      <AtSign className="h-4 w-4" />
                      Nome do usuário
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu_username"
                        {...field}
                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      Data de Nascimento
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={signupForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-300">
                      <Phone className="h-4 w-4" />
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="(00) 00000-0000"
                        {...field}
                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#00A884] hover:bg-[#1DA57A] transition-all duration-300 rounded-lg font-medium flex items-center justify-center gap-2 shadow-md"
                disabled={loading}
              >
                <UserPlus className="h-5 w-5" />
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6 mt-6">
              <FormField
                control={loginForm.control}
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
                        autoComplete="email"
                        {...field}
                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
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
                        autoComplete="current-password"
                        {...field}
                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                    <div className="flex justify-end">
                      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-sm text-[#00A884] hover:text-[#1DA57A] transition-colors font-medium flex items-center gap-1"
                          >
                            <KeyRound className="h-3 w-3" />
                            Esqueceu a senha?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#202C33] border border-[#2A3942]">
                          <DialogHeader>
                            <DialogTitle className="text-white">Redefinir Senha</DialogTitle>
                          </DialogHeader>
                          <Form {...resetPasswordForm}>
                            <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-4">
                              <FormField
                                control={resetPasswordForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-gray-300">Email</FormLabel>
                                    <FormControl>
                                      <Input 
                                        placeholder="seu@email.com" 
                                        type="email"
                                        {...field}
                                        className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white"
                                      />
                                    </FormControl>
                                    <FormMessage className="text-red-400" />
                                  </FormItem>
                                )}
                              />
                              <Button 
                                type="submit" 
                                className="w-full bg-[#00A884] hover:bg-[#1DA57A]"
                                disabled={loading}
                              >
                                {loading ? "Enviando..." : "Enviar link de redefinição"}
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
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
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            {isSignUp ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
            <Button 
              variant="link" 
              className="p-0 text-[#00A884] hover:text-[#1DA57A] transition-colors font-medium"
              onClick={toggleForm}
              type="button"
            >
              {isSignUp ? "Faça login" : "Cadastre-se"}
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
