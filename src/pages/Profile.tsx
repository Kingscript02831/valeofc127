import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
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
  MoreHorizontal,
  Link2,
  Eye,
  ArrowLeft,
  Camera
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import type { Profile } from "@/types/profile";
import MediaCarousel from "@/components/MediaCarousel";
import { useTheme } from "@/components/ThemeProvider";

const profileSchema = z.object({
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  street: z.string().min(1, "Rua é obrigatória"),
  house_number: z.string().min(1, "Número é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  postal_code: z.string().min(1, "CEP é obrigatório"),
  avatar_url: z.string().nullable().optional(),
  cover_url: z.string().nullable().optional(),
  username: z.string().min(3, "Username deve ter pelo menos 3 caracteres"),
  bio: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  status: z.string().optional(),
  basic_info_updated_at: z.string().optional(),
});

const convertDropboxUrl = (url: string) => {
  if (!url) return "";
  if (url.includes("?raw=1")) return url;
  return url.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "?raw=1");
};

const defaultCoverImage = "/placeholder-cover.jpg"
const defaultAvatarImage = "/placeholder-avatar.jpg"

export default function Profile() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false);
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const { theme } = useTheme();

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
      cover_url: "",
      username: "",
      bio: "",
      website: "",
      status: "",
    },
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
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
      
      if (data) {
        if (data.avatar_url) {
          data.avatar_url = convertDropboxUrl(data.avatar_url);
        }
        if (data.cover_url) {
          data.cover_url = convertDropboxUrl(data.cover_url);
        }
      }
      
      return data;
    },
  });

  const { data: userProducts } = useQuery({
    queryKey: ["userProducts"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", session.user.id);

      return data || [];
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

  const handleDeleteAvatar = async () => {
    form.setValue("avatar_url", null);
    updateProfile.mutate(form.getValues());
    setShowDeletePhotoDialog(false);
    toast({
      title: "Foto de perfil removida",
      description: "Sua foto de perfil foi removida com sucesso",
    });
  };

  const handleDeleteCover = async () => {
    form.setValue("cover_url", null);
    updateProfile.mutate(form.getValues());
    setShowDeleteCoverDialog(false);
    toast({
      title: "Foto de capa removida",
      description: "Sua foto de capa foi removida com sucesso",
    });
  };

  const handleCoverImageClick = () => {
    const dialog = window.prompt('Cole aqui o link do Dropbox para a imagem de capa:', profile?.cover_url || '');
    if (dialog !== null) {
      const values = {
        ...form.getValues(),
        cover_url: dialog
      };
      updateProfile.mutate(values);
    }
  };

  const handleAvatarImageClick = () => {
    const dialog = window.prompt('Cole aqui o link do Dropbox para a foto de perfil:', profile?.avatar_url || '');
    if (dialog !== null) {
      form.setValue("avatar_url", dialog);
      updateProfile.mutate(form.getValues());
    }
  };

  const handleImageError = (error: any) => {
    console.error("Erro ao carregar a imagem", error);
    toast({
      title: "Erro ao carregar a imagem",
      description: "Verifique se o link do Dropbox está correto",
      variant: "destructive",
    });
    setIsLoadingImage(false);
  };

  const copyProfileLink = () => {
    const profileUrl = `${window.location.origin}/perfil/${profile?.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link copiado!",
      description: "O link do seu perfil foi copiado para a área de transferência.",
    });
  };

  const updateProfile = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      if (values.avatar_url) {
        values.avatar_url = convertDropboxUrl(values.avatar_url);
      }
      if (values.cover_url) {
        values.cover_url = convertDropboxUrl(values.cover_url);
      }

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
      setShowSettings(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
        cover_url: profile.cover_url || "",
        username: profile.username || "",
        bio: profile.bio || "",
        website: profile.website || "",
        status: profile.status || "",
      });
    }
  }, [profile, form]);

  if (isProfileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 ${theme === 'light' ? 'bg-white/90' : 'bg-black/90'} backdrop-blur`}>
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold">{profile?.full_name}</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center">
          <LogOut className="h-6 w-6" />
        </button>
      </div>

      <div className="pt-16 pb-20">
        <div className="relative">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 relative">
            {profile?.cover_url ? (
              <img
                src={profile.cover_url}
                alt="Capa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = defaultCoverImage;
                }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                <p className="text-gray-500">Sem Capa de Perfil</p>
              </div>
            )}
            {!isPreviewMode && (
              <div className="absolute right-4 bottom-4 flex gap-2">
                <button
                  onClick={() => setShowDeleteCoverDialog(true)}
                  className="bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5 text-white" />
                </button>
                <button
                  onClick={handleCoverImageClick}
                  className="bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                >
                  <Camera className="h-5 w-5 text-white" />
                </button>
              </div>
            )}
          </div>

          <div className="relative -mt-16 px-4">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-black">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = defaultAvatarImage;
                    }}
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                    <p className="text-gray-500">Sem foto de perfil</p>
                  </div>
                )}
              </div>
              {!isPreviewMode && (
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button 
                    onClick={() => setShowDeletePhotoDialog(true)}
                    className="bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5 text-white" />
                  </button>
                  <button 
                    onClick={handleAvatarImageClick}
                    className="bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{profile?.full_name}</h2>
                <p className="text-gray-400">@{profile?.username}</p>
                {profile?.status && (
                  <p className="text-yellow-500 text-sm mt-1">
                    {profile.status} 👍
                  </p>
                )}
                {profile?.city && (
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Mora em {profile.city}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {!isPreviewMode ? (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className={`${theme === 'light' ? 'text-black border-gray-300' : 'text-white border-gray-700'}`}>
                          Editar perfil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-white">Editar perfil</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit((data) => updateProfile.mutate(data))} className="space-y-4">
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
                                    <select
                                      {...field}
                                      className="w-full bg-transparent border-white text-white placeholder:text-gray-400 rounded-md p-2"
                                    >
                                      {locations?.map((location) => (
                                        <option 
                                          key={location.id} 
                                          value={location.name}
                                          selected={location.name === profile?.city}
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
                            <div className="flex gap-2 justify-end">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowSettings(false)}
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
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="border-gray-700">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800">
                        <DropdownMenuItem onClick={copyProfileLink} className="text-white cursor-pointer">
                          <Link2 className="h-4 w-4 mr-2" />
                          Copiar link do perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsPreviewMode(true)} className="text-white cursor-pointer">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver como
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsPreviewMode(false)} 
                    variant="outline" 
                    className={`${theme === 'light' ? 'text-black border-gray-300' : 'text-white border-gray-700'}`}
                  >
                    Sair do modo preview
                  </Button>
                )}
              </div>
            </div>

            {profile?.bio && (
              <p className={`mb-4 ${theme === 'light' ? 'text-black' : 'text-gray-300'}`}>{profile.bio}</p>
            )}

            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-start border-b border-gray-800 bg-transparent">
                <TabsTrigger
                  value="posts"
                  className={`flex-1 text-xl py-4 border-0 data-[state=active]:border-b-2 ${
                    theme === 'light' 
                      ? 'data-[state=active]:text-black data-[state=active]:border-black' 
                      : 'data-[state=active]:text-white data-[state=active]:border-white'
                  }`}
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className={`flex-1 text-xl py-4 border-0 data-[state=active]:border-b-2 ${
                    theme === 'light' 
                      ? 'data-[state=active]:text-black data-[state=active]:border-black' 
                      : 'data-[state=active]:text-white data-[state=active]:border-white'
                  }`}
                >
                  Produtos
                </TabsTrigger>
                <TabsTrigger
                  value="reels"
                  className={`flex-1 text-xl py-4 border-0 data-[state=active]:border-b-2 ${
                    theme === 'light' 
                      ? 'data-[state=active]:text-black data-[state=active]:border-black' 
                      : 'data-[state=active]:text-white data-[state=active]:border-white'
                  }`}
                >
                  Reels
                </TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="min-h-[200px]">
                <div className="grid grid-cols-3 gap-1">
                  <div className="aspect-square bg-gray-800/50 flex items-center justify-center">
                    <p className="text-gray-500">Ainda não há Posts</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="products" className="min-h-[200px]">
                {userProducts && userProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 p-4">
                    {userProducts.map((product) => (
                      <Card key={product.id} className={`${theme === 'light' ? 'bg-white' : 'bg-black'} shadow-none border-0`}>
                        <CardContent className="p-3">
                          {product.images?.[0] && (
                            <img
                              src={product.images[0]}
                              alt={product.title}
                              className="w-full aspect-square object-cover rounded-lg mb-2"
                            />
                          )}
                          <h3 className={`font-medium ${theme === 'light' ? 'text-black' : 'text-white'}`}>{product.title}</h3>
                          <p className="text-green-500">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(Number(product.price))}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[200px]">
                    <p className="text-gray-500">Ainda não há Produtos</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reels" className="min-h-[200px]">
                <div className="grid grid-cols-3 gap-1">
                  <div className="aspect-square bg-gray-800/50 flex items-center justify-center">
                    <p className="text-gray-500">Ainda não há Reels</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Dialog open={showDeletePhotoDialog} onOpenChange={setShowDeletePhotoDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Remover foto de perfil</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">Tem certeza que deseja remover sua foto de perfil?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePhotoDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAvatar}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteCoverDialog} onOpenChange={setShowDeleteCoverDialog}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Remover foto de capa</DialogTitle>
          </DialogHeader>
          <p className="text-gray-300">Tem certeza que deseja remover sua foto de capa?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteCoverDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCover}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
