import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { supabase } from "../../integrations/supabase/client";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Camera, LogOut, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "../components/ui/textarea";
import BottomNav from "../components/BottomNav";
import { Profile, ProfileUpdateData } from "../types/profile";
import MediaCarousel from "../components/MediaCarousel";
import { useTheme } from "../components/ThemeProvider";

const formSchema = z.object({
  username: z.string().min(2).max(50),
  full_name: z.string().min(2).max(50),
  bio: z.string().optional(),
  avatar_url: z.string().optional(),
  cover_url: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional(),
  birth_date: z.string().optional(),
  website: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  house_number: z.string().optional(),
  postal_code: z.string().optional(),
  status: z.string().optional(),
});

export default function Profile() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteAvatarDialog, setShowDeleteAvatarDialog] = useState(false);
  const [showDeleteCoverDialog, setShowDeleteCoverDialog] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("No user logged in");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      full_name: "",
      bio: "",
      avatar_url: "",
      cover_url: "",
      email: "",
      phone: "",
      birth_date: "",
      website: "",
      city: "",
      street: "",
      house_number: "",
      postal_code: "",
      status: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
        cover_url: profile.cover_url || "",
        email: profile.email || "",
        phone: profile.phone || "",
        birth_date: profile.birth_date || "",
        website: profile.website || "",
        city: profile.city || "",
        street: profile.street || "",
        house_number: profile.house_number || "",
        postal_code: profile.postal_code || "",
        status: profile.status || "",
      });
    }
  }, [profile, form]);

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileUpdateData) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) throw new Error("No user logged in");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Erro ao atualizar perfil");
    },
  });

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

  const handleDeleteCover = async () => {
    const values = {
      ...form.getValues(),
      cover_url: null
    };
    updateProfile.mutate(values);
    setShowDeleteCoverDialog(false);
    toast.success("Foto de capa removida com sucesso!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
        {profile?.cover_url ? (
          <>
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full"
                onClick={handleCoverImageClick}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <AlertDialog open={showDeleteCoverDialog} onOpenChange={setShowDeleteCoverDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover foto de capa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja remover sua foto de capa?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteCover}
                    >
                      Remover
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        ) : (
          <Button
            variant="ghost"
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            onClick={handleCoverImageClick}
          >
            <Camera className="h-6 w-6 mr-2" />
            Adicionar foto de capa
          </Button>
        )}
      </div>

      <Form {...form}>
        <form className="space-y-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Textarea {...field} />
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
                  <Input {...field} type="email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            onClick={() => {
              const values = form.getValues();
              updateProfile.mutate(values);
            }}
          >
            Salvar alterações
          </Button>
        </form>
      </Form>

      <div className="mt-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sair da conta</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja sair da sua conta?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <Button variant="destructive" onClick={handleLogout}>
                Sair
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <BottomNav />
    </div>
  );
}
