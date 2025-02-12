
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "../integrations/supabase/types";

type AdminPermission = Database["public"]["Enums"]["admin_permission"];

type UserPermission = {
  id: string;
  email: string;
  permissions: {
    id: string;
    permission: AdminPermission;
    is_active: boolean;
  }[];
};

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", searchTerm],
    queryFn: async () => {
      // Primeiro, buscar usuários que correspondam ao termo de busca
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      const filteredUsers = authUsers.users.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Depois, buscar as permissões para esses usuários
      const { data: permissions, error: permError } = await supabase
        .from("admin_permissions")
        .select("*")
        .in("user_id", filteredUsers.map(u => u.id));

      if (permError) throw permError;

      // Combinar os dados
      return filteredUsers.map(user => ({
        id: user.id,
        email: user.email || "",
        permissions: permissions
          .filter(p => p.user_id === user.id)
          .map(p => ({
            id: p.id,
            permission: p.permission,
            is_active: p.is_active || false
          }))
      }));
    }
  });

  const togglePermission = async (userId: string, permission: AdminPermission) => {
    try {
      const existingPerm = users?.find(u => u.id === userId)?.permissions
        .find(p => p.permission === permission);

      if (existingPerm) {
        // Atualizar permissão existente
        const { error } = await supabase
          .from("admin_permissions")
          .update({ is_active: !existingPerm.is_active })
          .eq("id", existingPerm.id);

        if (error) throw error;
      } else {
        // Criar nova permissão
        const { error } = await supabase
          .from("admin_permissions")
          .insert({
            user_id: userId,
            permission,
            is_active: true
          });

        if (error) throw error;
      }

      toast.success("Permissão atualizada com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error("Erro ao atualizar permissão: " + error.message);
    }
  };

  const deletePermissions = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("admin_permissions")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Permissões removidas com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error("Erro ao remover permissões: " + error.message);
    }
  };

  const permissionTypes: AdminPermission[] = [
    "full_access",
    "places",
    "events",
    "stores",
    "news",
    "categories"
  ];

  const permissionLabels: Record<AdminPermission, string> = {
    full_access: "Acesso Total",
    places: "Lugares",
    events: "Eventos",
    stores: "Lojas",
    news: "Notícias",
    categories: "Categorias"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Buscar usuários por e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              {permissionTypes.map((type) => (
                <TableHead key={type}>{permissionLabels[type]}</TableHead>
              ))}
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={permissionTypes.length + 2} className="text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={permissionTypes.length + 2} className="text-center">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  {permissionTypes.map((type) => {
                    const permission = user.permissions.find(
                      (p) => p.permission === type
                    );
                    return (
                      <TableCell key={type}>
                        <Button
                          variant={permission?.is_active ? "default" : "outline"}
                          size="sm"
                          onClick={() => togglePermission(user.id, type)}
                        >
                          {permission?.is_active ? "Ativo" : "Inativo"}
                        </Button>
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deletePermissions(user.id)}
                    >
                      Remover Todas
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
