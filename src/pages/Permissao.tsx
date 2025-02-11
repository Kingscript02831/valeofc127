
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type Permission = {
  id: string;
  user_id: string;
  permission: PermissionType;
};

type Profile = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  birth_date?: string;
  avatar_url?: string;
  username?: string;
  city?: string;
  bio?: string;
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

  const SUPER_ADMIN_EMAIL = 'marcosvinihhh2003@gmail.com';

  useEffect(() => {
    fetchUsers();
    ensureSuperAdminPermissions();
  }, []);

  const ensureSuperAdminPermissions = async () => {
    try {
      // Primeiro, procura o usuário pelo email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', SUPER_ADMIN_EMAIL)
        .single();

      if (profileError) {
        console.error('Error finding super admin profile:', profileError);
        return;
      }

      if (!profiles) {
        console.error('Super admin profile not found');
        return;
      }

      // Remove todas as permissões existentes para garantir que não haja duplicatas
      await supabase
        .from('user_permissions')
        .delete()
        .eq('user_id', profiles.id);

      // Adiciona todas as permissões
      const permissionsToAdd = permissionTypes.map(permission => ({
        user_id: profiles.id,
        permission: permission
      }));

      const { error: insertError } = await supabase
        .from('user_permissions')
        .insert(permissionsToAdd);

      if (insertError) {
        console.error('Error ensuring super admin permissions:', insertError);
        return;
      }

      toast.success('Permissões de super admin configuradas com sucesso');
    } catch (error) {
      console.error('Error in ensureSuperAdminPermissions:', error);
      toast.error('Erro ao configurar permissões de super admin');
    }
  };

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
      const userProfile = users.find(u => u.profile.id === userId)?.profile;
      
      // Impede a remoção de permissões do super admin
      if (userProfile?.email === SUPER_ADMIN_EMAIL) {
        toast.error('Não é possível remover permissões do super admin');
        return;
      }

      if (currentValue) {
        const { error } = await supabase
          .from('user_permissions')
          .delete()
          .eq('user_id', userId)
          .eq('permission', permission);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            permission: permission
          });

        if (error) throw error;
      }

      await fetchUsers();
      toast.success('Permissões atualizadas com sucesso');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Erro ao atualizar permissões');
    }
  };

  const resetSuperAdminPermissions = () => {
    ensureSuperAdminPermissions();
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Permissões</h1>
        <Button onClick={resetSuperAdminPermissions}>
          Resetar Permissões do Super Admin
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Informações do Usuário</TableHead>
              <TableHead>Contato</TableHead>
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
              <TableRow 
                key={user.profile.id}
                className={user.profile.email === SUPER_ADMIN_EMAIL ? 'bg-blue-50' : ''}
              >
                <TableCell>
                  {user.profile.avatar_url ? (
                    <img 
                      src={user.profile.avatar_url} 
                      alt={user.profile.name} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.profile.name?.charAt(0) || user.profile.email.charAt(0)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">
                      {user.profile.name}
                      {user.profile.email === SUPER_ADMIN_EMAIL && (
                        <Badge className="ml-2" variant="secondary">
                          Super Admin
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {user.profile.username && <div>@{user.profile.username}</div>}
                      {user.profile.email}
                    </div>
                    {user.profile.bio && (
                      <div className="text-sm text-gray-600">{user.profile.bio}</div>
                    )}
                    {user.profile.city && (
                      <Badge variant="secondary" className="text-xs">
                        {user.profile.city}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm">
                    {user.profile.phone && (
                      <div>📱 {user.profile.phone}</div>
                    )}
                    {user.profile.birth_date && (
                      <div>🎂 {new Date(user.profile.birth_date).toLocaleDateString()}</div>
                    )}
                  </div>
                </TableCell>
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
