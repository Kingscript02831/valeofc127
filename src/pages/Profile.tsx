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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import BottomNav from "../components/BottomNav";

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
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              id: session.user.id,
              email: session.user.email,
              name: session.user.email?.split('@')[0] || 'User',
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
    <div className="container max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">Perfil</h1>
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

      {/* Profile Content */}
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.name}</h2>
                {profile?.username && (
                  <p className="text-muted-foreground flex items-center gap-1">
                    <AtSign className="h-4 w-4" />
                    {profile.username}
                  </p>
                )}
                {profile?.bio && (
                  <p className="text-sm mt-1">{profile.bio}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">Informações</TabsTrigger>
            <TabsTrigger value="settings" className="flex-1">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.email}</span>
                </div>
                {profile?.username && (
                  <div className="flex items-center gap-2">
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.username}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.birth_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(profile.birth_date), "dd/MM/yyyy")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile?.street && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Rua: {profile.street}</span>
                  </div>
                )}
                {profile?.house_number && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Número: {profile.house_number}</span>
                  </div>
                )}
                {profile?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Cidade: {profile.city}</span>
                  </div>
                )}
                {profile?.postal_code && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>CEP: {profile.postal_code}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {profile?.website && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {profile.website}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Foto de Perfil</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="avatar_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Input placeholder="URL da imagem" {...field} />
                              <Image className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Contato</CardTitle>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Endereço</CardTitle>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Segurança</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePasswordReset}
                      className="w-full"
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
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
