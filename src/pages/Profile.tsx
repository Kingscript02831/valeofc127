import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { LogOut, Settings, Grid, Link as LinkIcon, MapPin, User, AtSign } from "lucide-react";
import BottomNav from "../components/BottomNav";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  avatar_url: z.string().url("URL inválida").optional(),
  username: z.string().min(2, "Username deve ter pelo menos 2 caracteres"),
  bio: z.string().max(150, "Bio deve ter no máximo 150 caracteres").optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
});

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'profile' | 'password' | 'address'>('profile');

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
        console.error("Erro ao verificar sessão:", error);
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
      bio: "",
      website: "",
    },
  });

  // Fetch profile data
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              name: session.user.email?.split('@')[0] || 'Usuário',
            }
          ])
          .select()
          .single();

        if (createError) throw createError;
        return newProfile;
      }

      return data;
    },
    enabled: !isLoading,
  });

  // Fetch followers count
  const { data: followersCount = 0 } = useQuery({
    queryKey: ["followers", profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("following_id", profile?.id);
      
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  // Fetch following count
  const { data: followingCount = 0 } = useQuery({
    queryKey: ["following", profile?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("followers")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", profile?.id);
      
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        ...profile,
        birth_date: profile.birth_date ? format(new Date(profile.birth_date), "yyyy-MM-dd") : "",
      });
    }
  }, [profile, form]);

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
      console.error("Erro ao atualizar perfil:", error);
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
      console.error("Erro ao sair:", error);
      toast({
        title: "Erro ao sair",
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
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {profile?.username && (
                <h1 className="text-xl font-semibold flex items-center gap-1">
                  <AtSign className="h-5 w-5 text-primary" />
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
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
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
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Stats */}
            <div className="col-span-2">
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold mb-1">{profile?.name || "Nome não definido"}</h2>
                <div className="flex gap-6 mb-4">
                  <div className="text-center">
                    <span className="font-semibold">0</span>
                    <p className="text-sm text-gray-500">Publicações</p>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold">{followersCount}</span>
                    <p className="text-sm text-gray-500">Seguidores</p>
                  </div>
                  <div className="text-center">
                    <span className="font-semibold">{followingCount}</span>
                    <p className="text-sm text-gray-500">Seguindo</p>
                  </div>
                </div>
                {profile?.bio && (
                  <p className="text-sm text-gray-700 mb-2">{profile.bio}</p>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 flex items-center gap-1 mb-2 hover:text-blue-600"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Grid Section */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-3 gap-1">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <Grid className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Editar Perfil</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                    <Settings className="h-5 w-5" />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <FormLabel>Nome de usuário</FormLabel>
                            <FormControl>
                              <Input placeholder="seu_username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Conte um pouco sobre você..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://seusite.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

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

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
