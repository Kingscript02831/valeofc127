import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Camera, Trash2 } from "lucide-react";
import { useTheme } from "../components/ThemeProvider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Profile } from "../types/profile";

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
});

interface ProfileConfigProps {
  profile: Profile;
  isPreviewMode: boolean;
  locations: any[];
  handleAvatarImageClick: () => void;
  handleCoverImageClick: () => void;
  setShowDeletePhotoDialog: (show: boolean) => void;
  setShowDeleteCoverDialog: (show: boolean) => void;
  onSubmit: (data: z.infer<typeof profileSchema>) => void;
}

export function ProfileConfig({
  profile,
  isPreviewMode,
  locations,
  handleAvatarImageClick,
  handleCoverImageClick,
  setShowDeletePhotoDialog,
  setShowDeleteCoverDialog,
  onSubmit
}: ProfileConfigProps) {
  const { theme } = useTheme();
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      birth_date: profile?.birth_date || "",
      street: profile?.street || "",
      house_number: profile?.house_number || "",
      city: profile?.city || "",
      postal_code: profile?.postal_code || "",
      avatar_url: profile?.avatar_url || "",
      cover_url: profile?.cover_url || "",
      username: profile?.username || "",
      bio: profile?.bio || "",
      website: profile?.website || "",
      status: profile?.status || "",
    },
  });

  if (isPreviewMode) return null;

  return (
    <>
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
            <DialogTitle className="text-foreground">Editar perfil</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Username</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Nome completo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Bio</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Website</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Telefone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="date"
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Rua</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Número</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground"
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
                    <FormLabel className="text-foreground">Cidade</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full bg-background border-border text-foreground rounded-md p-2"
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
                    <FormLabel className="text-foreground">CEP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background border-border text-foreground"
                        placeholder="00000-000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 justify-end">
                <Button type="submit">
                  Salvar alterações
                </Button>
              </div>
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
    </>
  );
}
