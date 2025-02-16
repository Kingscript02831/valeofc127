import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";

type Permission = {
  id: string;
  user_id: string;
  permission: 'owner' | 'admin' | 'news_editor' | 'events_editor' | 'places_editor' | 'stores_editor';
  custom_role?: string;
  description?: string;
  path?: string;
  is_active: boolean;
  granted_at: string;
  modified_at?: string;
  users?: {
    email: string;
  };
};

const PERMISSION_LABELS = {
  owner: 'Dono do Sistema',
  admin: 'Administrador',
  news_editor: 'Editor de Notícias',
  events_editor: 'Editor de Eventos',
  places_editor: 'Editor de Lugares',
  stores_editor: 'Editor de Lojas',
  custom: 'Permissão Personalizada'
};

const AdminPermissions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    permission: "admin" as Permission["permission"],
    description: "",
    custom_role: "",
    path: ""
  });

  // Query permissions data
  const { data: permissions, isLoading } = useQuery({
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
      return data as Permission[];
    },
  });

  // Add permission mutation
  const addPermissionMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First, get user ID from email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single();

      if (userError) throw new Error('Usuário não encontrado');

      // Add permission
      const { error: permissionError } = await supabase
        .from('admin_permissions')
        .insert({
          user_id: userData.id,
          permission: data.permission,
          description: data.description,
          custom_role: data.custom_role,
          path: data.path,
          is_active: true
        });

      if (permissionError) throw permissionError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      setIsDialogOpen(false);
      setFormData({ email: "", permission: "admin", description: "", custom_role: "", path: "" });
      toast({
        title: "Sucesso",
        description: "Permissão adicionada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async (permission: Permission) => {
      const { error } = await supabase
        .from('admin_permissions')
        .update({
          permission: permission.permission,
          description: permission.description,
          custom_role: permission.custom_role,
          path: permission.path,
          modified_at: new Date().toISOString(),
        })
        .eq('id', permission.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      setEditingPermission(null);
      setIsDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete permission mutation
  const deletePermissionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_permissions')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-permissions"] });
      toast({
        title: "Sucesso",
        description: "Permissão removida com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPermission) {
      updatePermissionMutation.mutate({
        ...editingPermission,
        permission: formData.permission,
        description: formData.description,
        custom_role: formData.custom_role,
        path: formData.path
      });
    } else {
      addPermissionMutation.mutate(formData);
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      email: permission.users?.email || "",
      permission: permission.permission,
      description: permission.description || "",
      custom_role: permission.custom_role || "",
      path: permission.path || ""
    });
    setIsDialogOpen(true);
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
          {/* Search and Add button */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar usuário</Label>
              <div className="relative">
                <Search className="absolute left-2 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="search"
                  placeholder="Buscar por email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingPermission(null);
                    setFormData({ email: "", permission: "admin", description: "", custom_role: "", path: "" });
                  }}
                  className="mt-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Permissão
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPermission ? "Editar Permissão" : "Adicionar Nova Permissão"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email do usuário</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                      disabled={!!editingPermission}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="permission">Nível de Permissão</Label>
                    <Select
                      value={formData.permission}
                      onValueChange={(value: Permission["permission"]) => 
                        setFormData(prev => ({ ...prev, permission: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível de permissão" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PERMISSION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.permission === 'custom' && (
                    <div className="space-y-2">
                      <Label htmlFor="custom_role">Nome da Permissão Personalizada</Label>
                      <Input
                        id="custom_role"
                        value={formData.custom_role}
                        onChange={(e) => setFormData(prev => ({ ...prev, custom_role: e.target.value }))}
                        placeholder="Ex: Editor de Conteúdo Especial"
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="path">Endereço da Página</Label>
                    <Input
                      id="path"
                      value={formData.path}
                      onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                      placeholder="Ex: admin/addmin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição opcional da permissão"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingPermission ? "Salvar Alterações" : "Adicionar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Permissions Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Permissão</TableHead>
                <TableHead>Permissão Personalizada</TableHead>
                <TableHead>Endereço da Página</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Concessão</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions?.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>{permission.users?.email}</TableCell>
                  <TableCell>{PERMISSION_LABELS[permission.permission]}</TableCell>
                  <TableCell>{permission.custom_role || "-"}</TableCell>
                  <TableCell>{permission.path || "-"}</TableCell>
                  <TableCell>{permission.description || "-"}</TableCell>
                  <TableCell>
                    {new Date(permission.granted_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(permission)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                          if (window.confirm("Tem certeza que deseja remover esta permissão?")) {
                            deletePermissionMutation.mutate(permission.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {permissions?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhuma permissão encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPermissions;
