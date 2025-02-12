
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  LogOut,
  User,
  AtSign,
  Settings,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Globe,
  Building,
  Home,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import type { ProfileUpdateData } from "../types/profile";

const profileSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  street: z.string().min(1, "Rua é obrigatória"),
  house_number: z.string().min(1, "Número é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  postal_code: z.string().min(1, "CEP é obrigatório"),
  avatar_url: z.string().url("URL inválida").optional(),
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  bio: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  basic_info_updated_at: z.string().optional(),
});

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Set up form with default values
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      birth_date: "",
      street: "",
      house_number: "",
      city: "",
      postal_code: "",
      avatar_url: "",
      username: "",
      bio: "",
      website: "",
    },
  });

  // Check for authentication and scheduled deletion
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        // Check if user had a scheduled deletion
        const { data: profile } = await supabase
          .from("profiles")
          .select("scheduled_deletion_date")
          .eq("id", session.user.id)
          .single();

        if (profile?.scheduled_deletion_date) {
          // Cancel deletion and show welcome back message
          const { error } = await supabase
            .from("profiles")
            .update({ scheduled_deletion_date: null })
            .eq("id", session.user.id);

          if (!error) {
            toast({
              title: "Bem-vindo de volta!",
              description: "A exclusão da sua conta foi cancelada.",
              duration: 5000,
            });
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        navigate("/login");
      }
    };
    checkSession();
  }, [navigate, toast]);

  // Fetch profile data
  const { data: profile, isLoading: isProfileLoading } = useQuery({
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
      return data;
    },
    enabled: !isLoading,
  });

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        birth_date: profile.birth_date ? format(new Date(profile.birth_date), "yyyy-MM-dd") : "",
        street: profile.street || "",
        house_number: profile.house_number || "",
        city: profile.city || "",
        postal_code: profile.postal_code || "",
        avatar_url: profile.avatar_url || "",
        username: profile.username || "",
        bio: profile.bio || "",
        website: profile.website || "",
      });
    }
  }, [profile, form]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      // Check if username or phone is being updated
      const isUpdatingRestricted = 
        values.username !== profile?.username ||
        values.phone !== profile?.phone;

      if (isUpdatingRestricted) {
        // Check if enough time has passed
        const { data: canUpdate, error: checkError } = await supabase
          .rpc('can_update_basic_info', { profile_id: session.user.id });

        if (checkError) throw checkError;
        if (!canUpdate) {
          throw new Error("Você só pode alterar seu @ ou telefone após 30 dias da última atualização.");
        }

        // Update the last basic info update timestamp
        values.basic_info_updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAccountDeletion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const { error } = await supabase
        .rpc('schedule_account_deletion', { user_id: session.user.id });

      if (error) throw error;

      toast({
        title: "Conta programada para exclusão",
        description: "Sua conta será excluída em 30 dias. Você pode cancelar este processo fazendo login novamente.",
      });
      
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao programar exclusão da conta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading || isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <SubNav />
      <div className="container max-w-4xl mx-auto p-4 pb-20 pt-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">
              {profile?.username ? `@${profile.username}` : 'Perfil'}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="hover:bg-gray-800"
            >
              <Settings className="h-5 w-5 text-white" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-4">
          {/* Profile Header Card */}
          <Card className="border-none bg-gray-900 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {profile?.avatar_url ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-700">
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-800 ring-2 ring-gray-700 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">{profile?.full_name}</h2>
                  {profile?.username && (
                    <p className="text-gray-400 flex items-center gap-1 text-sm">
                      <AtSign className="h-4 w-4" />
                      {profile.username}
                    </p>
                  )}
                  {profile?.bio && (
                    <p className="text-sm text-gray-400">{profile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {showSettings ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
                <Card className="border-none bg-gray-900 shadow-xl">
                  <CardContent className="space-y-4 pt-6">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Username</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="Seu username"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Nome completo</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="Seu nome completo"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Bio</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="Sua biografia"
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
                          <FormLabel className="text-white">Website</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="https://seu-site.com"
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
                          <FormLabel className="text-white">Telefone</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="tel"
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="(00) 00000-0000"
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
                          <FormLabel className="text-white">Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="date"
                              className="bg-transparent border-white text-white"
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
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="seu@email.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Rua</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="Nome da rua"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="house_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Número</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="123"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Cidade</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="Sua cidade"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">CEP</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="00000-000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="avatar_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">URL do Avatar</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-transparent border-white text-white placeholder:text-gray-400"
                              placeholder="https://exemplo.com/avatar.jpg"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
                  </Button>

                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleAccountDeletion}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir conta
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid gap-4">
              <Card className="border-none bg-gray-900 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.email && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile?.birth_date && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(profile.birth_date), "dd/MM/yyyy")}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none bg-gray-900 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.street && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Home className="h-4 w-4" />
                      <span>{profile.street}</span>
                    </div>
                  )}
                  {profile?.house_number && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.house_number}</span>
                    </div>
                  )}
                  {profile?.city && (
                    <div className="flex items-center gap-3 text-gray-300">
                      <Building className="h-4 w-4" />
                      <span>{profile.city}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {profile?.website && (
                <Card className="border-none bg-gray-900 shadow-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Globe className="h-4 w-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
