
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, UserPlus, PencilLine, Trash2, Save, X } from "lucide-react";

interface User {
  id: string;
  email: string;
}

interface Permission {
  id: string;
  user_id: string;
  page_path: string;
  user_email?: string;
}

const availablePages = [
  "/admin",
  "/admin/lugares",
  "/admin/eventos",
  "/admin/lojas",
  "/admin/categorias",
];

const Permissao = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPermission, setEditingPermission] = useState<string | null>(null);
  const [newPagePath, setNewPagePath] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, email");

      if (usersError) throw usersError;

      const { data: permissionsData, error: permissionsError } = await supabase
        .from("page_permissions")
        .select(`
          id,
          user_id,
          page_path,
          profiles (
            email
          )
        `);

      if (permissionsError) throw permissionsError;

      setUsers(usersData || []);
      setPermissions(
        permissionsData?.map((p) => ({
          ...p,
          user_email: p.profiles?.email,
        })) || []
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar dados. Por favor, tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPermission = async () => {
    try {
      const user = users.find((u) => u.email === newUserEmail);
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não encontrado.",
        });
        return;
      }

      const { error } = await supabase.from("page_permissions").insert({
        user_id: user.id,
        page_path: newPagePath,
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Permissão adicionada com sucesso.",
      });

      setNewUserEmail("");
      setNewPagePath("");
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao adicionar permissão. Por favor, tente novamente.",
      });
    }
  };

  const updatePermission = async (id: string, newPagePath: string) => {
    try {
      const { error } = await supabase
        .from("page_permissions")
        .update({ page_path: newPagePath })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso.",
      });

      setEditingPermission(null);
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar permissão. Por favor, tente novamente.",
      });
    }
  };

  const deletePermission = async (id: string) => {
    try {
      const { error } = await supabase
        .from("page_permissions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Permissão removida com sucesso.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao remover permissão. Por favor, tente novamente.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121B22] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#00A884] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121B22] p-6">
      <div className="max-w-6xl mx-auto bg-[#202C33] rounded-xl shadow-lg border border-[#2A3942] p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">
          Gerenciamento de Permissões
        </h1>

        <div className="mb-8 space-y-4">
          <h2 className="text-lg text-white">Adicionar Nova Permissão</h2>
          <div className="flex gap-4 flex-wrap">
            <Input
              placeholder="Email do usuário"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="bg-[#2A3942] border-none text-white focus:ring-[#00A884] flex-1 min-w-[200px]"
            />
            <select
              value={newPagePath}
              onChange={(e) => setNewPagePath(e.target.value)}
              className="bg-[#2A3942] border-none text-white focus:ring-[#00A884] rounded-md px-4 py-2 flex-1 min-w-[200px]"
            >
              <option value="">Selecione uma página</option>
              {availablePages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
            <Button
              onClick={addPermission}
              disabled={!newUserEmail || !newPagePath}
              className="bg-[#00A884] hover:bg-[#1DA57A] text-white flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-[#2A3942]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#2A3942] hover:bg-[#2A3942]">
                <TableHead className="text-white">Usuário</TableHead>
                <TableHead className="text-white">Página</TableHead>
                <TableHead className="text-white w-[150px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow
                  key={permission.id}
                  className="bg-[#202C33] hover:bg-[#2A3942] text-white"
                >
                  <TableCell>{permission.user_email}</TableCell>
                  <TableCell>
                    {editingPermission === permission.id ? (
                      <select
                        value={newPagePath || permission.page_path}
                        onChange={(e) => setNewPagePath(e.target.value)}
                        className="bg-[#2A3942] border-none text-white focus:ring-[#00A884] rounded-md px-2 py-1 w-full"
                      >
                        {availablePages.map((page) => (
                          <option key={page} value={page}>
                            {page}
                          </option>
                        ))}
                      </select>
                    ) : (
                      permission.page_path
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {editingPermission === permission.id ? (
                      <>
                        <Button
                          onClick={() =>
                            updatePermission(permission.id, newPagePath)
                          }
                          className="bg-[#00A884] hover:bg-[#1DA57A] p-2 h-8 w-8"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => setEditingPermission(null)}
                          variant="destructive"
                          className="p-2 h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          onClick={() => {
                            setEditingPermission(permission.id);
                            setNewPagePath(permission.page_path);
                          }}
                          className="bg-[#00A884] hover:bg-[#1DA57A] p-2 h-8 w-8"
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deletePermission(permission.id)}
                          variant="destructive"
                          className="p-2 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {permissions.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-gray-400 py-8"
                  >
                    Nenhuma permissão encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Permissao;

