import React, { useState, useDeferredValue } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const AdminPermissions = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newPermission, setNewPermission] = useState("admin");
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const { data: permissions, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-permissions", deferredSearchTerm, sortConfig],
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

      if (deferredSearchTerm) {
        query = query.or(`users.email.ilike.%${deferredSearchTerm}%,user_id.eq.${deferredSearchTerm}`);
      }

      if (sortConfig?.key) {
        query = query.order(sortConfig.key, { ascending: sortConfig.direction === 'asc' });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    keepPreviousData: true,
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddPermission = async () => {
    if (!newUserEmail) {
      toast({ variant: "destructive", title: "Erro", description: "Por favor, insira um email válido" });
      return;
    }

    setIsAdding(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', newUserEmail)
        .single();

      if (userError || !userData) {
        throw userError || new Error('Usuário não encontrado');
      }

      const { error: permissionError } = await supabase
        .from('admin_permissions')
        .insert([{
          user_id: userData.id,
          permission: newPermission,
          is_active: true
        }]);

      if (permissionError) throw permissionError;

      toast({ title: "Sucesso", description: "Permissão adicionada com sucesso" });
      setNewUserEmail("");
      refetch();
    } catch (error) {
      console.error("Erro ao adicionar permissão:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao adicionar permissão"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const getBadgeVariant = (permission: string) => {
    switch (permission) {
      case 'admin': return 'destructive';
      case 'editor': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'default';
    }
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Erro ao carregar permissões. Tente recarregar a página.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg">Gerenciamento de Permissões</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Filtros e busca */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label>Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por email ou ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Formulário de adição */}
          <div className="rounded-lg border p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="newUserEmail">Adicionar Permissão</Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  disabled={isAdding}
                />
              </div>
              
              <div className="w-full md:w-40">
                <Label htmlFor="newPermission">Nível de acesso</Label>
                <select
                  id="newPermission"
                  value={newPermission}
                  onChange={(e) => setNewPermission(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={isAdding}
                >
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>

              <Button 
                onClick={handleAddPermission} 
                disabled={isAdding}
                className="gap-2 md:w-40"
              >
                {isAdding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isAdding ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {[
                    { key: 'user_id', label: 'ID do Usuário' },
                    { key: 'email', label: 'Email' },
                    { key: 'permission', label: 'Permissão' },
                    { key: 'granted_at', label: 'Data de Concessão' }
                  ].map((header) => (
                    <TableHead 
                      key={header.key}
                      className="cursor-pointer hover:bg-muted/75"
                      onClick={() => handleSort(header.key)}
                    >
                      <div className="flex items-center gap-2">
                        {header.label}
                        {sortConfig?.key === header.key && (
                          <span className="text-muted-foreground">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    </TableRow>
                  ))
                ) : permissions?.length ? (
                  permissions.map((permission) => (
                    <TableRow key={permission.id} className="hover:bg-muted/25">
                      <TableCell className="font-mono text-sm">
                        {permission.user_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {permission.users?.email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(permission.permission)}>
                          {permission.permission}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(permission.granted_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhuma permissão encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPermissions;
