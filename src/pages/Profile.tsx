
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Home } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import MediaCarousel from "@/components/MediaCarousel";
import { useTheme } from "@/components/ThemeProvider";
import type { Profile } from "@/types/profile";

export default function Profile() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const { theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      email: "",
      phone: "",
      birth_date: "",
      website: "",
      city: "",
      street: "",
      house_number: "",
      postal_code: "",
      avatar_url: "",
      cover_url: "",
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locations")
        .select("*")
        .order("name");
      return data || [];
    },
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        loadProfile(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        loadProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
        form.reset(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleCoverImageClick = () => {
    const coverUrl = prompt("Cole aqui o link do Dropbox para a imagem de capa:");
    if (coverUrl) {
      form.setValue("cover_url", coverUrl);
      handleSubmit(form.getValues());
    }
  };

  const handleAvatarImageClick = () => {
    const avatarUrl = prompt("Cole aqui o link do Dropbox para a foto de perfil:");
    if (avatarUrl) {
      form.setValue("avatar_url", avatarUrl);
      handleSubmit(form.getValues());
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (!session?.user?.id) throw new Error("No user ID");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Perfil atualizado com sucesso!");
      loadProfile(session.user.id);
      setIsPreviewMode(true);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    }
  };

  if (!session) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="relative w-full h-48">
        {profile?.cover_url ? (
          <img
            src={profile.cover_url}
            alt="Capa"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500" />
        )}
        {!isPreviewMode && (
          <label 
            className="absolute right-4 bottom-4 bg-black/50 p-2 rounded-full cursor-pointer hover:bg-black/70 transition-colors"
            onClick={handleCoverImageClick}
          >
            <Camera className="h-5 w-5 text-white" />
          </label>
        )}
      </div>

      <div className="px-4 -mt-16 relative z-10">
        <div className="relative inline-block">
          <img
            src={profile?.avatar_url || "/placeholder.svg"}
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
          />
          {!isPreviewMode && (
            <label 
              className="absolute bottom-2 right-2 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
              onClick={handleAvatarImageClick}
            >
              <Camera className="h-5 w-5 text-white" />
            </label>
          )}
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
          <p className="text-gray-500">@{profile?.username}</p>
          {profile?.city && (
            <div className="flex items-center gap-2 text-gray-400">
              <Home className="h-4 w-4" />
              <span>Mora em {profile.city}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          {isPreviewMode ? (
            <Button
              onClick={() => setIsPreviewMode(false)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Editar Perfil
            </Button>
          ) : (
            <>
              <Button
                onClick={() => setIsPreviewMode(true)}
                variant="outline"
                className="border-blue-500 text-blue-500"
              >
                Cancelar
              </Button>
              <Button
                onClick={form.handleSubmit(handleSubmit)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Salvar
              </Button>
            </>
          )}
        </div>

        {!isPreviewMode && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-6">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
                        placeholder="Seu nome completo"
                      />
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
                    <FormLabel>Nome de Usuário</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
                        placeholder="@seunome"
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
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
                        placeholder="Fale um pouco sobre você"
                        rows={3}
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="email"
                        className="w-full bg-transparent border rounded-md p-2"
                        placeholder="seu@email.com"
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
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
                        placeholder="(00) 00000-0000"
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
                      <input
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
                        placeholder="https://seusite.com"
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
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
                        placeholder="Nome da sua rua"
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
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
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
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
                      >
                        {locations?.map((location) => (
                          <option 
                            key={location.id} 
                            value={location.name}
                          >
                            {location.name}
                          </option>
                        ))}
                      </select>
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
                      <input
                        {...field}
                        className="w-full bg-transparent border rounded-md p-2"
                        placeholder="00000-000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
