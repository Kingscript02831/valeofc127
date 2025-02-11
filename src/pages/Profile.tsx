
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
  Grid,
  Settings,
  Key,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Globe,
  Image,
  PenSquare,
  BookUser,
  Contact,
  Building,
  Home,
  Shield,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import BottomNav from "../components/BottomNav";
import type { ProfileUpdateData } from "../types/profile";

const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  street: z.string().min(3, "Rua deve ter pelo menos 3 caracteres"),
  house_number: z.string().min(1, "Número da casa é obrigatório"),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  postal_code: z.string().min(8, "CEP deve ter 8 dígitos"),
  avatar_url: z.string().url("URL inválida").optional(),
  username: z.string().min(2, "Username deve ter pelo menos 2 caracteres"),
  bio: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  basic_info_updated_at: z.string().optional(),
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
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !isLoading,
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        ...profile,
        birth_date: profile.birth_date ? format(new Date(profile.birth_date), "yyyy-MM-dd") : "",
      });
    }
  }, [profile, form]);

  // Update profile mutation with 30-day check
  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      // Check if basic info is being updated
      const isUpdatingBasicInfo = 
        values.name !== profile?.name ||
        values.username !== profile?.username ||
        values.phone !== profile?.phone ||
        values.birth_date !== profile?.birth_date;

      if (isUpdatingBasicInfo) {
        // Get the last update time
        const { data: profileData } = await supabase
          .from("profiles")
          .select("basic_info_updated_at")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          const lastUpdate = new Date(profileData.basic_info_updated_at);
          const daysSinceLastUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysSinceLastUpdate < 30) {
            throw new Error(`Você só pode alterar suas informações básicas após 30 dias da última atualização. Dias restantes: ${30 - daysSinceLastUpdate}`);
          }
        }

        // If we're here, it's been more than 30 days, so update the timestamp
        values = {
          ...values,
          basic_info_updated_at: new Date().toISOString(),
        };
      }

      const { error } = await supabase
        .from("profiles")
        .update(values)
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

  const handlePasswordReset = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.email) {
        toast({
          title: "Erro",
          description: "Email não encontrado",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email);
      if (error) throw error;

      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir sua senha",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao redefinir senha",
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="container max-w-4xl mx-auto p-4 pb-20 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <BookUser className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Perfil</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="hover:bg-primary/10"
            >
              <PenSquare className="h-5 w-5 text-primary" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hover:bg-red-100"
            >
              <LogOut className="h-5 w-5 text-red-500" />
            </Button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="space-y-6">
          {/* Profile Header Card */}
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  {profile?.avatar_url ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-primary/20">
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/10 ring-2 ring-primary/20 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-gray-800">{profile?.name}</h2>
                  {profile?.username && (
                    <p className="text-primary/80 flex items-center gap-1 text-sm">
                      <AtSign className="h-4 w-4" />
                      {profile.username}
                    </p>
                  )}
                  {profile?.bio && (
                    <p className="text-sm text-gray-600">{profile.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="info" className="flex-1 gap-2">
                <Grid className="h-4 w-4" /> Informações
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex-1 gap-2">
                <Settings className="h-4 w-4" /> Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid gap-6">
                {/* Personal Info Card */}
                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex gap-2 items-center text-primary">
                      <Contact className="h-5 w-5" />
                      Informações Pessoais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.email && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="h-4 w-4 text-primary/60" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile?.phone && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone className="h-4 w-4 text-primary/60" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile?.birth_date && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Calendar className="h-4 w-4 text-primary/60" />
                        <span>{format(new Date(profile.birth_date), "dd/MM/yyyy")}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Address Card */}
                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex gap-2 items-center text-primary">
                      <Building className="h-5 w-5" />
                      Endereço
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.street && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Home className="h-4 w-4 text-primary/60" />
                        <span>Rua: {profile.street}</span>
                      </div>
                    )}
                    {profile?.house_number && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="h-4 w-4 text-primary/60" />
                        <span>Número: {profile.house_number}</span>
                      </div>
                    )}
                    {profile?.city && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <Building className="h-4 w-5 text-primary/60" />
                        <span>Cidade: {profile.city}</span>
                      </div>
                    )}
                    {profile?.postal_code && (
                      <div className="flex items-center gap-3 text-gray-600">
                        <MapPin className="h-4 w-4 text-primary/60" />
                        <span>CEP: {profile.postal_code}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Website Card */}
                {profile?.website && (
                  <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Globe className="h-4 w-4 text-primary/60" />
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-6">
                  {/* Avatar Settings */}
                  <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex gap-2 items-center text-primary">
                        <Image className="h-5 w-5" />
                        Foto de Perfil
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="avatar_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="URL da imagem" className="bg-white" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Basic Info Settings */}
                  <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex gap-2 items-center text-primary">
                        <BookUser className="h-5 w-5" />
                        Informações Básicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biografia</FormLabel>
                            <FormControl>
                              <Input placeholder="Conte um pouco sobre você" {...field} />
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
                              <Input placeholder="https://seu-site.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Contact Settings */}
                  <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex gap-2 items-center text-primary">
                        <Contact className="h-5 w-5" />
                        Contato
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
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
                              <Input type="tel" {...field} />
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
                    </CardContent>
                  </Card>

                  {/* Address Settings */}
                  <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex gap-2 items-center text-primary">
                        <Building className="h-5 w-5" />
                        Endereço
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rua</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Security Settings */}
                  <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex gap-2 items-center text-primary">
                        <Shield className="h-5 w-5" />
                        Segurança
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePasswordReset}
                        className="w-full bg-white hover:bg-primary/5"
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Alterar Senha
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="bg-white hover:bg-primary/5"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateProfile.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
