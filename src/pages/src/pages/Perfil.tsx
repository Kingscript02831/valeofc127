import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { LogOut, User, Phone, Mail, MapPin, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
});

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return {};
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return {
        name: profile?.name || "",
        email: profile?.email || user.email || "",
        phone: profile?.phone || "",
        birth_date: profile?.birth_date ? new Date(profile.birth_date).toISOString().split('T')[0] : "",
        address: profile?.address || "",
      };
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      const { error } = await supabase
        .from("profiles")
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          birth_date: data.birth_date,
          address: data.address,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Falha ao atualizar perfil. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Falha ao sair. Tente novamente.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado");

      // Delete profile first (this will cascade to auth.users due to our foreign key)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Sign out after deletion
      await supabase.auth.signOut();
      navigate("/login");

      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída com sucesso.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Falha ao excluir conta. Tente novamente.",
      });
    }
  };
return (
    <div className="min-h-screen bg-[#121B22] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#202C33] p-8 rounded-xl shadow-lg border border-[#2A3942]">
        <div className="text-center space-y-3 mb-6">
          <div className="flex justify-center">
            <div className="bg-[#2A3942] p-3 rounded-xl">
              <User className="h-12 w-12 text-[#00A884]" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white">Seu Perfil</h2>
          <p className="text-gray-400">Gerencie suas informações pessoais</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    Nome
                  </FormLabel>
                  <FormControl>
                    <Input 
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="email"
                      className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="tel"
                      className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-300">
                    <User className="h-4 w-4" />
                    Data de Nascimento
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="date"
                      className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-300">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      className="bg-[#2A3942] border-none focus:ring-[#00A884] text-white h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 bg-[#00A884] hover:bg-[#1DA57A] transition-all duration-300 rounded-lg font-medium"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 space-y-4">
          <Button 
            onClick={handleLogout}
            variant="secondary"
            className="w-full h-12 bg-[#2A3942] hover:bg-[#374248] text-white transition-all duration-300 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="h-5 w-5" />
            Encerrar Sessão
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive"
                className="w-full h-12 bg-red-600 hover:bg-red-700 transition-all duration-300 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Trash2 className="h-5 w-5" />
                Excluir Conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#202C33] border border-[#2A3942]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Excluir Conta</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[#2A3942] text-white hover:bg-[#374248]">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default Profile;
  
