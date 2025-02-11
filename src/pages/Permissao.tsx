
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { PermissionType } from '@/hooks/usePermissions';

type Permission = {
  id: string;
  user_id: string;
  permission: PermissionType;
};

type Profile = {
  id: string;
  email: string;
  name: string;
};

type UserPermission = {
  profile: Profile;
  permissions: PermissionType[];
};

const Permissao = () => {
  const [users, setUsers] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  const permissionTypes: PermissionType[] = [
    'admin_places',
    'admin_events',
    'admin_stores',
    'admin_news',
    'admin_categories'
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*');

      if (permissionsError) throw permissionsError;

      const usersWithPermissions = profiles.map((profile: Profile) => ({
        profile,
        permissions: permissions
          .filter((p: Permission) => p.user_id === profile.id)
          .map((p: Permission) => p.permission)
      }));

      setUsers(usersWithPermissions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (userId: string, permission: PermissionType, currentValue: boolean) => {
    try {
      if (currentValue) {
        // Remover permissão
        const { error } = await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('permission', permission);

        if (error) throw error;
      } else {
        // Adicionar permissão
        const { error } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            permission: permission
          });

        if (error) throw error;
      }

      // Atualizar a interface
      await fetchUsers();
      toast.success('Permissões atualizadas com sucesso');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Erro ao atualizar permissões');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Permissões</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              {permissionTypes.map((type) => (
                <TableHead key={type} className="text-center">
                  {type.replace('admin_', '').charAt(0).toUpperCase() + 
                   type.replace('admin_', '').slice(1)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.profile.id}>
                <TableCell>{user.profile.name}</TableCell>
                <TableCell>{user.profile.email}</TableCell>
                {permissionTypes.map((permission) => (
                  <TableCell key={permission} className="text-center">
                    <Switch
                      checked={user.permissions.includes(permission)}
                      onCheckedChange={(checked) => 
                        togglePermission(user.profile.id, permission, user.permissions.includes(permission))
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Permissao;
