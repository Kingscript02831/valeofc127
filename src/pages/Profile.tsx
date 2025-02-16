
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
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
import { LogOut, Settings, Trash2 } from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import type { ProfileUpdateData } from "../types/profile";
import { profileSchema, type ProfileFormValues } from "../components/profile/ProfileSchema";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ProfileInfo } from "../components/profile/ProfileInfo";

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const form = useForm<ProfileFormValues>({
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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("scheduled_deletion_date")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        if (data?.scheduled_deletion_date) {
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

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const isUpdatingRestricted = 
        values.username !== profile?.username ||
        values.phone !== profile?.phone;

      if (isUpdatingRestricted) {
        const { data: canUpdate, error: checkError } = await supabase
          .rpc('can_update_basic_info', { profile_id: session.user.id });

        if (checkError) throw checkError;
        if (!canUpdate) {
          throw new Error("Você só pode alterar seu @ ou telefone após 30 dias da última atualização.");
        }

        values.basic_info_updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update(values as ProfileUpdateData)
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
      <div className="container max-w-4xl mx-auto p-4 pb-20 pt-4">
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

        <div className="space-y-4">
          <Card className="border-none bg-gray-900 shadow-xl">
            <CardContent className="pt-6">
              <ProfileHeader profile={profile} />
            </CardContent>
          </Card>

          {showSettings ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
                <Card className="border-none bg-gray-900 shadow-xl">
                  <CardContent className="space-y-4 pt-6">
                    {/* Form fields */}
                    {Object.entries(form.formState.defaultValues || {}).map(([field, _]) => (
                      <FormField
                        key={field}
                        control={form.control}
                        name={field as keyof ProfileFormValues}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white capitalize">
                              {field.replace(/_/g, ' ')}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type={field === 'birth_date' ? 'date' : 'text'}
                                className="bg-transparent border-white text-white placeholder:text-gray-400"
                                placeholder={`Digite seu ${field.replace(/_/g, ' ')}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
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
            <ProfileInfo profile={profile} />
          )}
        </div>
      </div>
    </div>
  );
}
