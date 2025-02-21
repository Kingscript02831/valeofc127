import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  MapPin,
  Plus,
} from "lucide-react";

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
}

interface Location {
  id: string;
  name: string;
  state: string;
  created_at: string;
}

const AdminSistema = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [newLocation, setNewLocation] = useState({
    name: "",
    state: "",
  });
  const [updateInterval, setUpdateInterval] = useState(30);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const { data: userHistory } = useQuery({
    queryKey: ["userHistory", selectedUser?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_user_audit_history", {
        user_id_param: selectedUser?.id,
      });
      if (error) throw error;
      return data as UserAuditLog[];
    },
    enabled: !!selectedUser && showHistory,
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc("soft_delete_user", {
        target_user_id: userId,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({
      userId,
      shouldBlock,
    }: {
      userId: string;
      shouldBlock: boolean;
    }) => {
      const { error } = await supabase.rpc("toggle_user_block", {
        target_user_id: userId,
        should_block: shouldBlock,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Status atualizado",
        description: "O status do usuário foi atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<UserProfile>) => {
      const { error } = await supabase
        .from("profiles")
        .update(userData)
        .eq("id", userData.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso",
      });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error: rpcError } = await supabase.rpc("request_password_reset", {
        target_email: email,
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
      });
      if (rpcError) throw rpcError;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Redefinição de senha solicitada",
        description: "Um email foi enviado para o usuário com as instruções de redefinição de senha",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao solicitar redefinição de senha",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Location[];
    },
  });

  const addLocationMutation = useMutation({
    mutationFn: async (location: Omit<Location, "id" | "created_at">) => {
      console.log('Attempting to add location:', location);
      
      const { data, error } = await supabase
        .from('locations')
        .insert(location)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      console.log('Location added successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setShowLocationDialog(false);
      setNewLocation({ name: "", state: "" });
      toast({
        title: "Localização adicionada",
        description: "A localização foi adicionada com sucesso",
      });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Erro ao adicionar localização",
        description: error.message || "Ocorreu um erro ao adicionar a localização",
        variant: "destructive",
      });
    },
  });

  const updateLocationMutation = useMutation({
    mutationFn: async (location: Location) => {
      const { data, error } = await supabase
        .from("locations")
        .update({
          name: location.name,
          state: location.state,
        })
        .eq("id", location.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setShowLocationDialog(false);
      setEditingLocation(null);
      toast({
        title: "Localização atualizada",
        description: "A localização foi atualizada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar localização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("locations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast({
        title: "Localização excluída",
        description: "A localização foi excluída com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir localização",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateIntervalMutation = useMutation({
    mutationFn: async (days: number) => {
      const { data, error } = await supabase
        .from('site_configuration')
        .update({ basic_info_update_interval: days })
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Configuração atualizada",
        description: "O intervalo de atualização foi modificado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLocation) {
      updateLocationMutation.mutate({
        ...editingLocation,
        ...newLocation,
      });
    } else {
      addLocationMutation.mutate(newLocation);
    }
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
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Usuário</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Input
                                id="full_name"
                                placeholder="Nome completo"
                                defaultValue={user.full_name}
                                onChange={(e) =>
                                  setSelectedUser({
                                    ...user,
                                    full_name: e.target.value,
                                  })
                                }
                              />
                              <Input
                                id="username"
                                placeholder="Username"
                                defaultValue={user.username}
                                onChange={(e) =>
                                  setSelectedUser({
                                    ...user,
                                    username: e.target.value,
                                  })
                                }
                              />
                              <Input
                                id="phone"
                                placeholder="Telefone"
                                defaultValue={user.phone}
                                onChange={(e) =>
                                  setSelectedUser({
                                    ...user,
                                    phone: e.target.value,
                                  })
                                }
                              />
                              <Input
                                id="bio"
                                placeholder="Bio"
                                defaultValue={user.bio}
                                onChange={(e) =>
                                  setSelectedUser({
                                    ...user,
                                    bio: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <Button
                              onClick={() => updateUserMutation.mutate(user)}
                            >
                              Salvar alterações
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenuItem
                        onClick={() => resetPasswordMutation.mutate(user.email)}
                      >
                        <Lock className="mr-2 h-4 w-4" />
                        Redefinir Senha
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          toggleBlockMutation.mutate({
                            userId: user.id,
                            shouldBlock: !user.is_blocked,
                          })
                        }
                      >
                        {user.is_blocked ? (
                          <>
                            <UserCog className="mr-2 h-4 w-4" />
                            Desbloquear
                          </>
                        ) : (
                          <>
                            <Ban className="mr-2 h-4 w-4" />
                            Bloquear
                          </>
                        )}
                      </DropdownMenuItem>

                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <History className="mr-2 h-4 w-4" />
                            Histórico
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Histórico do Usuário</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4 space-y-4">
                            {userHistory?.map((log) => (
                              <div
                                key={log.id}
                                className="p-4 bg-gray-50 rounded-lg"
                              >
                                <p className="font-medium">{log.action}</p>
                                <p className="text-sm text-gray-500">
                                  {format(
                                    new Date(log.performed_at),
                                    "dd/MM/yyyy HH:mm"
                                  )}
                                </p>
                                <pre className="mt-2 text-sm">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteUserMutation.mutate(user.id)}
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

      <div className="mt-10 bg-card rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6">Configurações do Sistema</h2>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Intervalo para atualização de informações básicas (dias)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                value={updateInterval}
                onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
                className="max-w-[200px]"
              />
              <Button
                onClick={() => updateIntervalMutation.mutate(updateInterval)}
              >
                Salvar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Define o período mínimo que usuários devem esperar para atualizar username e email
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Localizações</h2>
          <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Localização
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLocation ? "Editar" : "Adicionar"} Localização
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLocationSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Cidade</label>
                  <Input
                    value={newLocation.name}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, name: e.target.value })
                    }
                    placeholder="Nome da cidade"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <Input
                    value={newLocation.state}
                    onChange={(e) =>
                      setNewLocation({ ...newLocation, state: e.target.value })
                    }
                    placeholder="Estado (UF)"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingLocation ? "Atualizar" : "Adicionar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cidade</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations?.map((location) => (
                <TableRow key={location.id}>
                  <TableCell className="font-medium">{location.name}</TableCell>
                  <TableCell>{location.state}</TableCell>
                  <TableCell>
                    {format(new Date(location.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingLocation(location);
                            setNewLocation({
                              name: location.name,
                              state: location.state,
                            });
                            setShowLocationDialog(true);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            if (window.confirm("Tem certeza que deseja excluir esta localização?")) {
                              deleteLocationMutation.mutate(location.id);
                            }
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
      </div>
    </div>
  );
};

export default AdminSistema;
