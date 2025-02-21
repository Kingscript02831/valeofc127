
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
} from "lucide-react";
import SystemSettings from "@/components/admin/SystemSettings";
import LocationsManagement from "@/components/admin/LocationsManagement";

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

const AdminSistema = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showHistory, setShowHistory] = useState(false);

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

      <SystemSettings />
      <LocationsManagement />
    </div>
  );
};

export default AdminSistema;
