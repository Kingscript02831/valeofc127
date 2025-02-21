import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import type { Location } from "@/types/locations";
import { useToast } from "./ui/use-toast";
import { differenceInDays } from "date-fns";

const formSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  birth_date: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  house_number: z.string().optional(),
  postal_code: z.string().optional(),
  status: z.string().optional(),
  location_id: z.string().optional(),
  relationship_status: z.enum(["single", "dating", "widowed"]).nullable(),
  instagram_url: z.string().url("URL do Instagram inválida").optional().or(z.literal("")),
});

interface EditProfileDialogProps {
  profile: Profile | null;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

const EditProfileDialog = ({ profile, onSubmit }: EditProfileDialogProps) => {
  const { toast } = useToast();
  
  // Fetch site configuration
  const { data: siteConfig } = useQuery({
    queryKey: ["site-configuration"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_configuration")
        .select("*")
        .single();
      return data;
    },
  });

  // Calculate days until basic info can be updated
  const getDaysUntilUpdate = () => {
    if (!profile?.basic_info_updated_at || !siteConfig?.basic_info_update_interval) {
      return 0;
    }

    const lastUpdate = new Date(profile.basic_info_updated_at);
    const daysRequired = siteConfig.basic_info_update_interval;
    const daysPassed = differenceInDays(new Date(), lastUpdate);
    return Math.max(0, daysRequired - daysPassed);
  };

  const daysUntilUpdate = getDaysUntilUpdate();
  const canUpdateBasicInfo = daysUntilUpdate === 0;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username || "",
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      website: profile?.website || "",
      birth_date: profile?.birth_date || "",
      city: profile?.city || "",
      street: profile?.street || "",
      house_number: profile?.house_number || "",
      postal_code: profile?.postal_code || "",
      status: profile?.status || "",
      location_id: profile?.location_id || "",
      relationship_status: profile?.relationship_status || null,
      instagram_url: profile?.instagram_url || "",
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("locations")
        .select("*")
        .order("name");
      return data as Location[];
    },
  });

  const handleLocationChange = (locationId: string) => {
    const selectedLocation = locations?.find(loc => loc.id === locationId);
    if (selectedLocation) {
      form.setValue('location_id', locationId);
      form.setValue('city', selectedLocation.name);
    }
  };

  return (
    <DialogContent className="bg-card border-border sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-foreground">Editar perfil</DialogTitle>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        disabled={!canUpdateBasicInfo}
                        className="bg-input border-input text-foreground" 
                      />
                      {!canUpdateBasicInfo && (
                        <p className="text-sm text-yellow-500 mt-1">
                          Aguarde {daysUntilUpdate} dias para atualizar o username
                        </p>
                      )}
                    </div>
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
                    <div className="relative">
                      <Input 
                        {...field} 
                        type="email" 
                        disabled={!canUpdateBasicInfo}
                        className="bg-input border-input text-foreground" 
                      />
                      {!canUpdateBasicInfo && (
                        <p className="text-sm text-yellow-500 mt-1">
                          Aguarde {daysUntilUpdate} dias para atualizar o email
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="relationship_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Estado Civil</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="bg-input border-input text-foreground">
                        <SelectValue placeholder="Selecione seu estado civil" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="single" className="text-foreground hover:bg-accent">
                        Solteiro(a)
                      </SelectItem>
                      <SelectItem value="dating" className="text-foreground hover:bg-accent">
                        Namorando
                      </SelectItem>
                      <SelectItem value="widowed" className="text-foreground hover:bg-accent">
                        Viúvo(a)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagram_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Instagram</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="url" 
                      placeholder="https://instagram.com/seu_perfil"
                      className="bg-input border-input text-foreground" 
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
                    <Input {...field} className="bg-input border-input text-foreground" />
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
                    <Input {...field} type="tel" className="bg-input border-input text-foreground" />
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
                    <Input {...field} type="url" className="bg-input border-input text-foreground" />
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
                    <Input {...field} type="date" className="bg-input border-input text-foreground" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="text-foreground font-semibold">Endereço</h3>
              
              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Cidade</FormLabel>
                    <Select
                      onValueChange={handleLocationChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-input border-input text-foreground">
                          <SelectValue placeholder="Selecione uma cidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card border-border">
                        {locations?.map((location) => (
                          <SelectItem
                            key={location.id}
                            value={location.id}
                            className="text-foreground hover:bg-accent"
                          >
                            {location.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Input {...field} className="bg-input border-input text-foreground" />
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
                      <Input {...field} className="bg-input border-input text-foreground" />
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
                      <Input {...field} className="bg-input border-input text-foreground" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground">Status</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-input border-input text-foreground" placeholder="Ex: Em linha" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Salvar alterações
          </Button>
        </form>
      </Form>
    </DialogContent>
  );
};

export default EditProfileDialog;
