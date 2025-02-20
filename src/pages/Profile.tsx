import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "../integrations/supabase/client";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Camera,
  MoreHorizontal,
  Link2,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import type { Profile } from "@/types/profile";
import { useTheme } from "next-themes";

const formSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    })
    .optional(),
  full_name: z
    .string()
    .min(2, {
      message: "Full name must be at least 2 characters.",
    })
    .max(50, {
      message: "Full name must not be longer than 50 characters.",
    })
    .optional(),
  website: z.string().url({ message: "Please enter a valid URL." }).optional(),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }).optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional(),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  house_number: z.string().optional(),
  postal_code: z.string().optional(),
  status: z.string().optional(),
  location_id: z.string().optional(),
  avatar_url: z.string().url({ message: "Please enter a valid URL." }).optional(),
  cover_url: z.string().url({ message: "Please enter a valid URL." }).optional(),
  theme_preference: z.enum(["dark", "light", "system"]).optional(),
});

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
    onSuccess: (data) => {
      setProfile(data);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      website: profile?.website || "",
      bio: profile?.bio || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birth_date: profile?.birth_date || "",
      city: profile?.city || "",
      street: profile?.street || "",
      house_number: profile?.house_number || "",
      postal_code: profile?.postal_code || "",
      status: profile?.status || "",
      location_id: profile?.location_id || "",
      avatar_url: profile?.avatar_url || "",
      cover_url: profile?.cover_url || "",
      theme_preference: profile?.theme_preference || "system",
    },
    mode: "onChange",
    values: {
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      website: profile?.website || "",
      bio: profile?.bio || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birth_date: profile?.birth_date || "",
      city: profile?.city || "",
      street: profile?.street || "",
      house_number: profile?.house_number || "",
      postal_code: profile?.postal_code || "",
      status: profile?.status || "",
      location_id: profile?.location_id || "",
      avatar_url: profile?.avatar_url || "",
      cover_url: profile?.cover_url || "",
      theme_preference: profile?.theme_preference || "system",
    },
  });

  useEffect(() => {
    form.reset({
      full_name: profile?.full_name || "",
      username: profile?.username || "",
      website: profile?.website || "",
      bio: profile?.bio || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birth_date: profile?.birth_date || "",
      city: profile?.city || "",
      street: profile?.street || "",
      house_number: profile?.house_number || "",
      postal_code: profile?.postal_code || "",
      status: profile?.status || "",
      location_id: profile?.location_id || "",
      avatar_url: profile?.avatar_url || "",
      cover_url: profile?.cover_url || "",
      theme_preference: profile?.theme_preference || "system",
    });
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      toast({
        title: "Perfil atualizado com sucesso!",
      });
      setShowSettings(false);
    },
    onError: (error: any) => {
      toast({
        title: "Houve um erro ao atualizar o perfil.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Houve um erro ao fazer logout.",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  const handleCoverImageClick = () => {
    const dialog = window.prompt('Cole aqui o link do Dropbox para a imagem de capa:', profile?.cover_url || '');
    if (dialog !== null) {
      form.setValue("cover_url", dialog);
      updateProfile.mutate(form.getValues());
    }
  };

  const handleDeleteCover = () => {
    if (window.confirm('Tem certeza que deseja remover a imagem de capa?')) {
      form.setValue("cover_url", null);
      updateProfile.mutate(form.getValues());
    }
  };

  const handleAvatarImageClick = () => {
    const dialog = window.prompt('Cole aqui o link do Dropbox para a foto de perfil:', profile?.avatar_url || '');
    if (dialog !== null) {
      form.setValue("avatar_url", dialog);
      updateProfile.mutate(form.getValues());
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <Navbar />
      <SubNav />
      
      <div className="relative">
        <div className="h-48 relative group">
          {profile?.cover_url ? (
            <img
              src={profile.cover_url}
              alt="Capa"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-800" />
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              onClick={handleCoverImageClick}
              className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            {profile?.cover_url && (
              <button
                onClick={handleDeleteCover}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="absolute -bottom-12 left-4 rounded-2xl shadow-lg border border-gray-800 bg-zinc-900/90 backdrop-blur-sm flex items-center gap-4 p-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-24 h-24 rounded-xl object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-800" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{profile?.full_name || "Sem nome"}</h1>
            <p className="text-sm text-gray-400">
              @{profile?.username || "Sem username"}
            </p>
          </div>
          <button
            onClick={handleAvatarImageClick}
            className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <Camera className="h-5 w-5 text-white" />
          </button>
        </div>
        
        <div className="mt-16 pt-20 px-4">
          <div className="flex justify-end">
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Editar perfil
              </Button>
            </DialogTrigger>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b border-gray-800 bg-transparent">
            <TabsTrigger value="posts" className="data-[state=active]:border-b-2">
              Posts
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:border-b-2">
              Produtos
            </TabsTrigger>
            <TabsTrigger value="reels" className="data-[state=active]:border-b-2">
              Reels
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-4">
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Camera className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg opacity-70">Ainda não há posts</p>
            </div>
          </TabsContent>

          <TabsContent value="products" className="p-4">
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Camera className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg opacity-70">Ainda não há produtos</p>
            </div>
          </TabsContent>

          <TabsContent value="reels" className="p-4">
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <Camera className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg opacity-70">Ainda não há reels</p>
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="bg-gray-900 border-gray-800 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Editar perfil</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
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
                        <FormLabel>Usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu usuário" {...field} />
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
                          <Input placeholder="Sua página pessoal" {...field} />
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
                          <Input placeholder="Uma pequena descrição sobre você" {...field} />
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
                          <Input placeholder="Seu email" {...field} />
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
                          <Input placeholder="Seu telefone" {...field} />
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
                        <FormLabel>Data de nascimento</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua data de nascimento" {...field} />
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
                          <Input placeholder="Sua cidade" {...field} />
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
                          <Input placeholder="Sua rua" {...field} />
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
                          <Input placeholder="Número da casa" {...field} />
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
                          <Input placeholder="Seu CEP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2 justify-end mt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowSettings(false);
                        navigate('/perfil');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
