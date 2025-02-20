import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { 
  Camera, 
  MapPin, 
  MoreVertical, 
  Trash2, 
  LogOut, 
  Settings,
  ArrowLeft,
  Link2,
  Eye 
} from "lucide-react";
import type { Profile } from "../types/profile";
import { z } from "zod";

const profileSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    }),
  full_name: z
    .string()
    .min(2, {
      message: "Full name must be at least 2 characters.",
    })
    .max(50, {
      message: "Full name must not be longer than 50 characters.",
    }),
  bio: z.string().max(160, {
    message: "Bio must not be longer than 160 characters.",
  }),
  website: z.string().url({ message: "Please enter a valid URL." }).optional(),
  email: z.string().email({ message: "Please enter a valid email." }),
  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      "Phone number must start with a country code and contain only digits."
    )
    .optional(),
  birth_date: z.date().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  house_number: z.string().optional(),
  postal_code: z.string().optional(),
  status: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [showDeletePhotoDialog, setShowDeletePhotoDialog] = useState(false);
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const user = supabase.auth.user();

  const { data: profileData, refetch: refetchProfile } = useQuery(
    ["profile"],
    async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as Profile;
    },
    {
      enabled: !!user,
    }
  );

  useEffect(() => {
    if (profileData) {
      setProfile(profileData);
      setAvatarUrl(profileData.avatar_url || null);
      setCoverUrl(profileData.cover_url || null);
    }
  }, [profileData]);

  useEffect(() => {
    const getTheme = () => {
      const storedTheme = localStorage.getItem("theme") as
        | "light"
        | "dark"
        | "system"
        | null;
      return storedTheme || "system";
    };

    const initialTheme = getTheme();
    setTheme(initialTheme);
  }, []);

  const { data: locationData } = useQuery(
    ["location", profile?.location_id],
    async () => {
      if (!profile?.location_id) return null;

      const { data, error } = await supabase
        .from("locations")
        .select("name")
        .eq("id", profile.location_id)
        .single();

      if (error) {
        console.error("Error fetching location:", error);
        return null;
      }

      return data;
    },
    {
      enabled: !!profile?.location_id,
    }
  );

  useEffect(() => {
    if (locationData) {
      setLocationName(locationData.name || null);
    }
  }, [locationData]);

  const updateProfileMutation = useMutation(
    async (values: ProfileFormValues) => {
      if (!user) throw new Error("Not authenticated");
      if (!profile) throw new Error("Profile not loaded");

      const updates = {
        id: user.id,
        updated_at: new Date(),
        username: values.username,
        full_name: values.full_name,
        bio: values.bio,
        website: values.website,
        email: values.email,
        phone: values.phone,
        birth_date: values.birth_date ? format(values.birth_date, 'yyyy-MM-dd') : null,
        city: values.city,
        street: values.street,
        house_number: values.house_number,
        postal_code: values.postal_code,
        status: values.status,
      };

      const { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw new Error(error.message);
      }
      return values;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["profile"]);
        toast.success("Profile updated successfully!");
      },
      onError: (error: any) => {
        toast.error(error.message);
      },
    }
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: profile?.username || "",
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      website: profile?.website || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birth_date: profile?.birth_date ? new Date(profile.birth_date) : undefined,
      city: profile?.city || "",
      street: profile?.street || "",
      house_number: profile?.house_number || "",
      postal_code: profile?.postal_code || "",
      status: profile?.status || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      username: profile?.username || "",
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      website: profile?.website || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birth_date: profile?.birth_date ? new Date(profile.birth_date) : undefined,
      city: profile?.city || "",
      street: profile?.street || "",
      house_number: profile?.house_number || "",
      postal_code: profile?.postal_code || "",
      status: profile?.status || "",
    });
  }, [profile]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleAvatarImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const { data, error } = await supabase.storage
            .from("avatars")
            .upload(`avatars/${user?.id}/avatar`, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error("Error uploading avatar:", error);
            toast.error("Failed to update avatar.");
          } else {
            const avatarURL = `${
              import.meta.env.VITE_SUPABASE_URL
            }/storage/v1/object/public/${data.Key}`;

            const { error: profileUpdateError } = await supabase
              .from("profiles")
              .update({ avatar_url: avatarURL })
              .eq("id", user?.id);

            if (profileUpdateError) {
              console.error("Error updating profile:", profileUpdateError);
              toast.error("Failed to update profile with new avatar.");
            } else {
              setAvatarUrl(avatarURL);
              refetchProfile();
              toast.success("Avatar updated successfully!");
            }
          }
        } catch (error) {
          console.error("Unexpected error:", error);
          toast.error("An unexpected error occurred.");
        }
      }
    };
    input.click();
  };

  const handleCoverImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        try {
          const { data, error } = await supabase.storage
            .from("covers")
            .upload(`covers/${user?.id}/cover`, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) {
            console.error("Error uploading cover:", error);
            toast.error("Failed to update cover.");
          } else {
            const coverURL = `${
              import.meta.env.VITE_SUPABASE_URL
            }/storage/v1/object/public/${data.Key}`;

            const { error: profileUpdateError } = await supabase
              .from("profiles")
              .update({ cover_url: coverURL })
              .eq("id", user?.id);

            if (profileUpdateError) {
              console.error("Error updating profile:", profileUpdateError);
              toast.error("Failed to update profile with new cover.");
            } else {
              setCoverUrl(coverURL);
              refetchProfile();
              toast.success("Cover updated successfully!");
            }
          }
        } catch (error) {
          console.error("Unexpected error:", error);
          toast.error("An unexpected error occurred.");
        }
      }
    };
    input.click();
  };

  const handleDeleteAvatar = async () => {
    try {
      const { error } = await supabase.storage
        .from("avatars")
        .remove([`avatars/${user?.id}/avatar`]);

      if (error) {
        console.error("Error deleting avatar:", error);
        toast.error("Failed to delete avatar.");
      } else {
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ avatar_url: null })
          .eq("id", user?.id);

        if (profileUpdateError) {
          console.error("Error updating profile:", profileUpdateError);
          toast.error("Failed to update profile.");
        } else {
          setAvatarUrl(null);
          refetchProfile();
          toast.success("Avatar deleted successfully!");
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setShowDeletePhotoDialog(false);
    }
  };

  const handleDeleteCover = async () => {
    try {
      const { error } = await supabase.storage
        .from("covers")
        .remove([`covers/${user?.id}/cover`]);

      if (error) {
        console.error("Error deleting cover:", error);
        toast.error("Failed to delete cover.");
      } else {
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({ cover_url: null })
          .eq("id", user?.id);

        if (profileUpdateError) {
          console.error("Error updating profile:", profileUpdateError);
          toast.error("Failed to update profile.");
        } else {
          setCoverUrl(null);
          refetchProfile();
          toast.success("Cover deleted successfully!");
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setShowDeleteCoverDialog(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}`}>
      <div
        className="relative h-56 w-full bg-muted"
        style={{
          backgroundImage: coverUrl ? `url(${coverUrl})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute top-2 left-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <div className="absolute bottom-2 left-2 text-white">
          {locationName && (
            <Button variant="secondary">
              <MapPin className="h-4 w-4 mr-2" />
              {locationName}
            </Button>
          )}
        </div>
        <div className="absolute bottom-2 right-2 text-white">
          {profile?.website && (
            <Button variant="secondary" asChild>
              <a href={profile.website} target="_blank" rel="noopener noreferrer">
                <Link2 className="h-4 w-4 mr-2" />
                Website
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex items-start">
          <div className="relative w-32 h-32 rounded-full overflow-hidden mt-[-4rem]">
            <img
              src={avatarUrl || "/placeholder-avatar.jpg"}
              alt="Avatar"
              className="object-cover w-full h-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/config")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="bg-background hover:bg-accent text-foreground border-border"
                  >
                    Editar perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Editar Perfil</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((values) =>
                        updateProfileMutation.mutate(values)
                      )}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="shadcn" {...field} />
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
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
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
                              <Textarea
                                placeholder="Write something about yourself."
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
                              <Input placeholder="https://example.com" {...field} />
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
                              <Input placeholder="example@example.com" {...field} />
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
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+15551234567" {...field} />
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
                            <FormLabel>Birth Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={
                                  field.value
                                    ? format(field.value, "yyyy-MM-dd")
                                    : ""
                                }
                                onChange={(e) => {
                                  field.onChange(new Date(e.target.value));
                                }}
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
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="New York" {...field} />
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
                            <FormLabel>Street</FormLabel>
                            <FormControl>
                              <Input placeholder="5th Avenue" {...field} />
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
                            <FormLabel>House Number</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
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
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="10001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Input placeholder="Active" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit">Salvar</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    title="Editar fotos"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background border-border">
                  <DialogHeader>
                    <DialogTitle className="text-foreground">Editar fotos</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-foreground mb-2">Foto de Perfil</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAvatarImageClick}
                          variant="outline"
                          className="bg-background hover:bg-accent text-foreground border-border"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Alterar foto
                        </Button>
                        <Button
                          onClick={() => setShowDeletePhotoDialog(true)}
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-foreground mb-2">Foto de Capa</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCoverImageClick}
                          variant="outline"
                          className="bg-background hover:bg-accent text-foreground border-border"
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Alterar capa
                        </Button>
                        <Button
                          onClick={() => setShowDeleteCoverDialog(true)}
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : (
          <Button onClick={() => setIsPreviewMode(false)}>
            <Eye className="h-4 w-4 mr-2" />
            Sair do modo de visualização
          </Button>
        )}
      </div>

        <div className="mt-4">
          <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
          <p className="text-muted-foreground">@{profile?.username}</p>
          <p className="mt-2">{profile?.bio}</p>
        </div>

        <Tabs defaultValue="about" className="w-full mt-4">
          <TabsList>
            <TabsTrigger value="about">Sobre</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          <TabsContent value="about" className="space-y-2">
            <Card>
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold">Detalhes Pessoais</h2>
                <div className="grid gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium leading-none">Email</p>
                    <p className="text-muted-foreground">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">Telefone</p>
                    <p className="text-muted-foreground">{profile?.phone || "Não informado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">Data de Nascimento</p>
                    <p className="text-muted-foreground">
                      {profile?.birth_date
                        ? format(new Date(profile.birth_date), "dd/MM/yyyy")
                        : "Não informada"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">Status</p>
                    <p className="text-muted-foreground">{profile?.status || "Não informado"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="settings">
            <Card>
              <CardContent>
                <h2 className="text-lg font-semibold">Configurações da Conta</h2>
                <Button onClick={() => navigate("/config")} className="mt-4">
                  Gerenciar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDeletePhotoDialog} onOpenChange={setShowDeletePhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Foto de Perfil</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir sua foto de perfil?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeletePhotoDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAvatar}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteCoverDialog} onOpenChange={setShowDeleteCoverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Foto de Capa</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir sua foto de capa?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowDeleteCoverDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteCover}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
