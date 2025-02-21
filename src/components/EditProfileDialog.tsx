
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Profile } from "@/types/profile";

const formSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  full_name: z.string().min(1, "Nome completo é obrigatório"),
  city: z.string().optional(),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  status: z.string().optional(),
});

interface EditProfileDialogProps {
  profile: Profile | null;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

const EditProfileDialog = ({ profile, onSubmit }: EditProfileDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile?.username || "",
      full_name: profile?.full_name || "",
      city: profile?.city || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      status: profile?.status || "",
    },
  });

  return (
    <DialogContent className="bg-gray-900 border-gray-800">
      <DialogHeader>
        <DialogTitle className="text-white">Editar perfil</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Username</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                  <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                  <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                  <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                  <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                <FormLabel className="text-white">Status</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-gray-800 border-gray-700 text-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">Salvar alterações</Button>
        </form>
      </Form>
    </DialogContent>
  );
};

export default EditProfileDialog;
