
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { LogOut, Trash2, User, AtSign, Grid, Settings, Edit } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  avatar_url: z.string().url("URL inválida").optional(),
  username: z.string().min(2, "Username deve ter pelo menos 2 caracteres"),
});

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Check for authentication status
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate]);

  // Set up form with default values
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birth_date: "",
      address: "",
      avatar_url: "",
      username: "",
    },
  });

  // Fetch profile data
  const { data: profile, isError: isProfileError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      return data;
    },
    enabled: !isLoading,
    meta: {
      onSuccess: (data: any) => {
        if (data) {
          form.reset({
            ...data,
            birth_date: data.birth_date ? format(new Date(data.birth_date), "yyyy-MM-dd") : "",
          });
        }
      },
      onError: (error: Error) => {
        console.error("Error in profile query:", error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    }
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .from("profiles")
        .update({
          ...values,
          birth_date: values.birth_date ? new Date(values.birth_date).toISOString() : null,
        })
        .eq("id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para deletar sua conta",
          variant: "destructive",
        });
        return;
      }

      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", session.user.id);

      if (deleteError) throw deleteError;

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;

      navigate("/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Erro ao deletar conta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      {/* Header with settings and logout */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {profile?.username && (
            <h1 className="text-xl font-semibold flex items-center gap-1">
              <AtSign className="h-5 w-5" />
              {profile.username}
            </h1>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="grid grid-cols-3 gap-8 mb-8">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border-2 border-gray-200">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Stats and Bio */}
        <div className="col-span-2">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold mb-1">{profile?.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {profile?.email}
            </p>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div>
                <span className="font-semibold block">0</span>
                <span className="text-sm text-muted-foreground">Posts</span>
              </div>
              <div>
                <span className="font-semibold block">0</span>
                <span className="text-sm text-muted-foreground">Seguidores</span>
              </div>
              <div>
                <span className="font-semibold block">0</span>
                <span className="text-sm text-muted-foreground">Seguindo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid/Gallery Section */}
      <div className="border-t pt-4">
        <div className="flex justify-center mb-4">
          <Button variant="ghost" className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Posts
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {/* Placeholder for posts */}
          <div className="aspect-square bg-secondary" />
          <div className="aspect-square bg-secondary" />
          <div className="aspect-square bg-secondary" />
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed inset-x-0 top-[50%] translate-y-[-50%] p-4 max-w-2xl mx-auto">
            <div className="bg-card rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Editar Perfil</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                  <Edit className="h-5 w-5" />
                </Button>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Foto de Perfil</FormLabel>
                        <FormControl>
                          <Input placeholder="https://exemplo.com/foto.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="seu_username" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} />
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
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="(00) 00000-0000" {...field} />
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
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu endereço completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir conta
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
