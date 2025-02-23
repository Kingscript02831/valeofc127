
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
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react";

interface Permission {
  id: string;
  user_name: string;
  email: string;
  page_path: string;
  permission_name: string;
  created_at: string;
}

const PermAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [newPermission, setNewPermission] = useState({
    user_name: "",
    email: "",
    page_path: "",
    permission_name: "",
  });

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Permission[];
    },
  });

  const addPermissionMutation = useMutation({
    mutationFn: async (permission: Omit<Permission, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("permissions")
        .insert(permission)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setShowPermissionDialog(false);
      setNewPermission({ user_name: "", email: "", page_path: "", permission_name: "" });
      toast({
        title: "Permissão adicionada",
        description: "A permissão foi adicionada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async (permission: Permission) => {
      const { data, error } = await supabase
        .from("permissions")
        .update({
          user_name: permission.user_name,
          email: permission.email,
          page_path: permission.page_path,
          permission_name: permission.permission_name,
        })
        .eq("id", permission.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setShowPermissionDialog(false);
      setEditingPermission(null);
      toast({
        title: "Permissão atualizada",
        description: "A permissão foi atualizada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePermissionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("permissions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast({
        title: "Permissão excluída",
        description: "A permissão foi excluída com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePermissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPermission) {
      updatePermissionMutation.mutate({
        ...editingPermission,
        ...newPermission,
      });
    } else {
      addPermissionMutation.mutate(newPermission);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Permissões</h2>
        <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Permissão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPermission ? "Editar" : "Adicionar"} Permissão
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePermissionSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nome do Usuário</label>
                <Input
                  value={newPermission.user_name}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, user_name: e.target.value })
                  }
                  placeholder="Nome do usuário"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">E-mail</label>
                <Input
                  value={newPermission.email}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, email: e.target.value })
                  }
                  type="email"
                  placeholder="E-mail do usuário"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Página</label>
                <Input
                  value={newPermission.page_path}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, page_path: e.target.value })
                  }
                  placeholder="/admin/pagina"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Nome da Permissão</label>
                <Input
                  value={newPermission.permission_name}
                  onChange={(e) =>
                    setNewPermission({ ...newPermission, permission_name: e.target.value })
                  }
                  placeholder="Nome da permissão"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingPermission ? "Atualizar" : "Adicionar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Página</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions?.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.user_name}</TableCell>
                <TableCell>{permission.email}</TableCell>
                <TableCell>{permission.page_path}</TableCell>
                <TableCell>{permission.permission_name}</TableCell>
                <TableCell>
                  {format(new Date(permission.created_at), "dd/MM/yyyy")}
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
                          setEditingPermission(permission);
                          setNewPermission({
                            user_name: permission.user_name,
                            email: permission.email,
                            page_path: permission.page_path,
                            permission_name: permission.permission_name,
                          });
                          setShowPermissionDialog(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          if (window.confirm("Tem certeza que deseja excluir esta permissão?")) {
                            deletePermissionMutation.mutate(permission.id);
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
  );
};

export default PermAdmin;
