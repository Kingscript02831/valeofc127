
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminPermissions = () => {
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["admin-permissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_permissions")
        .select(`
          *,
          users:user_id (
            email
          )
        `)
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
  });

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead>Data de Concessão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions?.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell>{permission.users?.email}</TableCell>
                <TableCell>{permission.permission}</TableCell>
                <TableCell>
                  {new Date(permission.granted_at).toLocaleDateString("pt-BR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminPermissions;
