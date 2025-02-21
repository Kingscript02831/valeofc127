import React, { useState, useEffect } from "react";
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

interface SiteConfiguration {
  id: string; // UUID
  basic_info_update_interval: number;
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
  const [updateIntervalDays, setUpdateIntervalDays] = useState(30);
  const [siteConfig, setSiteConfig] = useState<SiteConfiguration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Busca a configuração do site
  const { data: siteConfiguration } = useQuery({
    queryKey: ["site_configuration"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .single();

      if (error) throw error;
      setSiteConfig(data);
      setUpdateIntervalDays(data.basic_info_update_interval);
      return data as SiteConfiguration;
    },
  });

  // Função para atualizar o intervalo de atualização
  const handleUpdateInterval = async () => {
    if (isUpdating) return;

    if (!siteConfig?.id) {
      toast({
        title: "Erro ao atualizar configuração",
        description: "Configuração do site não encontrada.",
        variant: "destructive",
      });
      return;
    }

    if (typeof updateIntervalDays !== "number" || updateIntervalDays <= 0) {
      toast({
        title: "Erro ao atualizar configuração",
        description: "O intervalo de atualização deve ser um número positivo.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    const { error } = await supabase
      .from("site_configuration")
      .update({ basic_info_update_interval: updateIntervalDays })
      .eq("id", siteConfig.id); // Usa o UUID do siteConfig

    if (error) {
      toast({
        title: "Erro ao atualizar configuração",
        description: error.message,
        variant: "destructive",
      });
      setIsUpdating(false);
      return;
    }

    // Atualiza o estado local
    setSiteConfig((prev) => ({
      ...prev,
      basic_info_update_interval: updateIntervalDays,
    }));

    toast({
      title: "Configuração atualizada",
      description: "O intervalo de atualização foi modificado com sucesso.",
    });

    setIsUpdating(false);
  };

  // Consulta de usuários
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

  // Consulta do histórico do usuário
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

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <div className="flex gap-2 items-center">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Tabela de usuários */}
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
                      {/* Ações do usuário */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Configurações do sistema */}
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
                value={updateIntervalDays}
                onChange={(e) =>
                  setUpdateIntervalDays(parseInt(e.target.value))
                }
                className="max-w-[200px]"
              />
              <Button
                onClick={handleUpdateInterval}
                disabled={isUpdating}
              >
                {isUpdating ? "Salvando..." : "Salvar"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Define o período mínimo que usuários devem esperar para atualizar username e email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSistema;
