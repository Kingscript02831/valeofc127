
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";

const AdminPermissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newPermission, setNewPermission] = useState("admin");

  const { data: permissions, isLoading, refetch } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      let query = supabase
        .from("admin_permissions")
        .select(`
          *,
          users:user_id (
            email
          )
        `)
        .eq("is_active", true);

      if (searchTerm) {
        query = query.or(`users.email.ilike.%${searchTerm}%,user_id.eq.${searchTerm}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleAddPermission = async () => {
    try {
      // Primeiro, busca o usuário pelo email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', newUserEmail)
        .single();

      if (userError) throw userError;

      // Adiciona a permissão para o usuário
      const { error: permissionError } = await supabase
        .from('admin_permissions')
        .insert({
          user_id: userData.id,
          permission: newPermission,
          is_active: true
        });

      if (permissionError) throw permissionError;

      // Limpa o formulário e atualiza a lista
      setNewUserEmail("");
      setNewPermission("admin");
      refetch();
    } catch (error) {
      console.error("Erro ao adicionar permissão:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Permissões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Campo de busca */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Buscar por email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Formulário para adicionar nova permissão */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="newUserEmail">Email do usuário</Label>
              <Input
                id="newUserEmail"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="w-48">
              <Label htmlFor="newPermission">Permissão</Label>
              <select
                id="newPermission"
                value={newPermission}
                onChange={(e) => setNewPermission(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="admin">admin</option>
                <option value="editor">editor</option>
                <option value="viewer">viewer</option>
              </select>
            </div>
            <Button onClick={handleAddPermission} className="flex gap-2">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>

          {/* Tabela de permissões */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID do Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Data de Concessão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions?.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-mono">{permission.user_id}</TableCell>
                  <TableCell>{permission.users?.email}</TableCell>
                  <TableCell>{permission.permission}</TableCell>
                  <TableCell>
                    {new Date(permission.granted_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPermissions;
