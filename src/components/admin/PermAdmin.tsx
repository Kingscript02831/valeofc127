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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react";

interface AdminPage {
  id: string;
  path: string;
  description: string;
  created_at: string;
}

interface Permission {
  id: string;
  user_name: string;
  email: string;
  permission_name: string;
  created_at: string;
  pages: AdminPage[];
}

const PermAdmin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showPageDialog, setShowPageDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [newPermission, setNewPermission] = useState({
    user_name: "",
    email: "",
    permission_name: "",
    selectedPages: [] as string[],
  });
  const [newPage, setNewPage] = useState({
    path: "",
    description: "",
  });

  // Fetch pages
  const { data: pages } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_pages")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as AdminPage[];
    },
  });

  // Fetch permissions with pages
  const { data: permissions, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: async () => {
      const { data: perms, error: permsError } = await supabase
        .from("permissions")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (permsError) throw permsError;

      const permissionsWithPages = await Promise.all(
        (perms || []).map(async (perm) => {
          const { data: pages, error: pagesError } = await supabase
            .from("permissions_pages")
            .select("admin_pages(*)")
            .eq("permission_id", perm.id);

          if (pagesError) throw pagesError;

          return {
            ...perm,
            pages: pages?.map(p => p.admin_pages) || [],
          };
        })
      );

      return permissionsWithPages as Permission[];
    },
  });

  // Add new page
  const addPageMutation = useMutation({
    mutationFn: async (page: Omit<AdminPage, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("admin_pages")
        .insert(page)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      setShowPageDialog(false);
      setNewPage({ path: "", description: "" });
      toast({
        title: "Página adicionada",
        description: "A página foi adicionada com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar página",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add permission with pages
  const addPermissionMutation = useMutation({
    mutationFn: async (data: {
      permission: Omit<Permission, "id" | "created_at" | "pages">;
      pageIds: string[];
    }) => {
      // First create the permission record
      const { data: perm, error: permError } = await supabase
        .from("permissions")
        .insert({
          user_name: data.permission.user_name,
          email: data.permission.email,
          permission_name: data.permission.permission_name,
        })
        .select()
        .single();

      if (permError) throw permError;

      // Then create the permissions_pages associations
      if (data.pageIds.length > 0) {
        const { error: pagesError } = await supabase
          .from("permissions_pages")
          .insert(
            data.pageIds.map(pageId => ({
              permission_id: perm.id,
              page_id: pageId,
            }))
          );

        if (pagesError) throw pagesError;
      }

      return perm;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      setShowPermissionDialog(false);
      setNewPermission({
        user_name: "",
        email: "",
        permission_name: "",
        selectedPages: [],
      });
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

  // Update permission
  const updatePermissionMutation = useMutation({
    mutationFn: async (data: {
      permission: Permission;
      pageIds: string[];
    }) => {
      const { error: permError } = await supabase
        .from("permissions")
        .update({
          user_name: data.permission.user_name,
          email: data.permission.email,
          permission_name: data.permission.permission_name,
        })
        .eq("id", data.permission.id);

      if (permError) throw permError;

      // Delete existing page associations
      const { error: deleteError } = await supabase
        .from("permissions_pages")
        .delete()
        .eq("permission_id", data.permission.id);

      if (deleteError) throw deleteError;

      // Add new page associations
      if (data.pageIds.length > 0) {
        const { error: pagesError } = await supabase
          .from("permissions_pages")
          .insert(
            data.pageIds.map(pageId => ({
              permission_id: data.permission.id,
              page_id: pageId,
            }))
          );

        if (pagesError) throw pagesError;
      }
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

  // Delete permission
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
        permission: {
          ...editingPermission,
          user_name: newPermission.user_name,
          email: newPermission.email,
          permission_name: newPermission.permission_name,
        },
        pageIds: newPermission.selectedPages,
      });
    } else {
      addPermissionMutation.mutate({
        permission: {
          user_name: newPermission.user_name,
          email: newPermission.email,
          permission_name: newPermission.permission_name,
        },
        pageIds: newPermission.selectedPages,
      });
    }
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPageMutation.mutate(newPage);
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Permissões</h2>
        <div className="flex gap-2">
          <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Página
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Página</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePageSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Caminho da Página</label>
                  <Input
                    value={newPage.path}
                    onChange={(e) =>
                      setNewPage({ ...newPage, path: e.target.value })
                    }
                    placeholder="/admin/pagina"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Input
                    value={newPage.description}
                    onChange={(e) =>
                      setNewPage({ ...newPage, description: e.target.value })
                    }
                    placeholder="Descrição da página"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Adicionar
                </Button>
              </form>
            </DialogContent>
          </Dialog>

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
                  <label className="text-sm font-medium">Nome da Permissão</label>
                  <div className="flex gap-2">
                    <Input
                      value={newPermission.permission_name}
                      onChange={(e) =>
                        setNewPermission({ ...newPermission, permission_name: e.target.value })
                      }
                      placeholder="Nome da permissão"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (!newPermission.permission_name) {
                          toast({
                            title: "Campo obrigatório",
                            description: "Por favor, insira um nome para a permissão",
                            variant: "destructive",
                          });
                          return;
                        }
                        setNewPermission({
                          ...newPermission,
                          permission_name: `${newPermission.permission_name}_permission`,
                        });
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Páginas</label>
                  <div className="mt-2 space-y-2">
                    {pages?.map((page) => (
                      <div key={page.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={page.id}
                          checked={newPermission.selectedPages.includes(page.id)}
                          onCheckedChange={(checked) => {
                            setNewPermission({
                              ...newPermission,
                              selectedPages: checked
                                ? [...newPermission.selectedPages, page.id]
                                : newPermission.selectedPages.filter(id => id !== page.id),
                            });
                          }}
                        />
                        <label
                          htmlFor={page.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {page.path} - {page.description}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingPermission ? "Atualizar" : "Adicionar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead>Páginas</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions?.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.user_name}</TableCell>
                <TableCell>{permission.email}</TableCell>
                <TableCell>{permission.permission_name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {permission.pages.map((page) => (
                      <span
                        key={page.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {page.path}
                      </span>
                    ))}
                  </div>
                </TableCell>
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
                            permission_name: permission.permission_name,
                            selectedPages: permission.pages.map(p => p.id),
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
