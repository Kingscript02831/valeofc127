import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  History,
  Lock,
  UserCog,
  Search,
} from "lucide-react";
import SystemSettings from "@/components/admin/SystemSettings";
import LocationsManagement from "@/components/admin/LocationsManagement";
import type { Location } from "@/types/locations";

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
});

interface UserAuditLog {
  id: string;
  action: string;
  details: any;
  performed_by: string;
  performed_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone: string;
  birth_date: string;
  bio: string;
  created_at: string;
  is_blocked: boolean;
  avatar_url: string;
  website: string;
  city: string;
  street: string;
  house_number: string;
  postal_code: string;
  status: string;
}

const AdminSistema = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", searchTerm],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*");

      if (searchTerm) {
        query = query.ilike("full_name", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as UserProfile[];
    },
  });

  const blockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_blocked: true })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuário bloqueado",
        description: "O usuário foi bloqueado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao bloquear usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unblockUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ is_blocked: false })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuário desbloqueado",
        description: "O usuário foi desbloqueado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao desbloquear usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fetchUserAuditLogs = async (userId: string) => {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .eq("table_name", "profiles")
      .eq("record_id", userId)
      .order("performed_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data as UserAuditLog[];
  };

  const { data: auditLogs, refetch: refetchAuditLogs } = useQuery(
    ["userAuditLogs", selectedUser?.id],
    () => fetchUserAuditLogs(selectedUser!.id),
    {
      enabled: !!selectedUser,
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: selectedUser?.username || "",
      full_name: selectedUser?.full_name || "",
      email: selectedUser?.email || "",
      phone: selectedUser?.phone || "",
      website: selectedUser?.website || "",
      birth_date: selectedUser?.birth_date || "",
      city: selectedUser?.city || "",
      street: selectedUser?.street || "",
      house_number: selectedUser?.house_number || "",
      postal_code: selectedUser?.postal_code || "",
      status: selectedUser?.status || "",
    },
    values: {
      username: selectedUser?.username || "",
      full_name: selectedUser?.full_name || "",
      email: selectedUser?.email || "",
      phone: selectedUser?.phone || "",
      website: selectedUser?.website || "",
      birth_date: selectedUser?.birth_date || "",
      city: selectedUser?.city || "",
      street: selectedUser?.street || "",
      house_number: selectedUser?.house_number || "",
      postal_code: selectedUser?.postal_code || "",
      status: selectedUser?.status || "",
    },
    mode: "onChange",
  });

  const updateUserMutation = useMutation(
    async (values: z.infer<typeof formSchema>) => {
      if (!selectedUser) {
        throw new Error("No user selected");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", selectedUser.id);

      if (error) {
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["users"] });
        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Erro ao atualizar usuário",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <div className="flex gap-2 items-center">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>@{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {format(new Date(user.created_at), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  {user.is_blocked ? (
                    <span className="text-red-500">Bloqueado</span>
                  ) : (
                    <span className="text-green-500">Ativo</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                          </DialogHeader>
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(updateUserMutation.mutate)} className="space-y-6">
                              <div className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="username"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Username</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
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
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Telefone</FormLabel>
                                      <FormControl>
                                        <Input {...field} type="tel" />
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
                                        <Input {...field} type="url" />
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
                                        <Input {...field} type="date" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="space-y-4 pt-4 border-t">
                                  <h3 className="font-semibold">Endereço</h3>
                                  
                                  <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Cidade</FormLabel>
                                        <Select
                                          onValueChange={field.onChange}
                                          defaultValue={field.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Selecione uma cidade" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {locations?.map((location) => (
                                              <SelectItem
                                                key={location.id}
                                                value={location.name}
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
                                </div>

                                <FormField
                                  control={form.control}
                                  name="status"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Status</FormLabel>
                                      <FormControl>
                                        <Input {...field} placeholder="Ex: Em linha" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>

                              <Button type="submit" className="w-full">
                                Salvar alterações
                              </Button>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setSelectedUser(user);
                          setShowHistory(true);
                          refetchAuditLogs();
                        }}
                      >
                        <History className="mr-2 h-4 w-4" />
                        Ver histórico
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.is_blocked ? (
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            unblockUserMutation.mutate(user.id);
                          }}
                        >
                          <Lock className="mr-2 h-4 w-4" />
                          Desbloquear
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            blockUserMutation.mutate(user.id);
                          }}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          Bloquear
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          // Implement delete user logic here
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SystemSettings />
      <LocationsManagement />
    </div>
  );
};

export default AdminSistema;
