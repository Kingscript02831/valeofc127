
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card } from './ui/card';
import { X } from 'lucide-react';
import { Button } from './ui/button';

interface LupaUsuarioProps {
  onClose: () => void;
  onSelectUser: (username: string) => void;
}

const LupaUsuario: React.FC<LupaUsuarioProps> = ({ onClose, onSelectUser }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    searchUsers();
  }, []);

  const searchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .limit(20);
        
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (username: string) => {
    onSelectUser(username);
    onClose();
  };

  return (
    <Card className="absolute z-50 left-0 right-0 top-full mt-1 max-h-60 overflow-y-auto shadow-lg border border-border p-2">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="font-medium text-sm">Marcar pessoa</h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {loading ? (
        <div className="p-4 text-center">Carregando...</div>
      ) : searchResults.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div className="space-y-1">
          {searchResults.map(user => (
            <button
              key={user.id}
              onClick={() => handleSelectUser(user.username)}
              className="flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded-md text-left"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm leading-none">
                  {user.username}
                </div>
                {user.full_name && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {user.full_name}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LupaUsuario;
