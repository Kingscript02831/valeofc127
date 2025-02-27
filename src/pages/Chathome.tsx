import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Ajuste o caminho conforme necessário

interface User {
  id: string;
  username: string;
  email: string;
}

export default function Chathome() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(data);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.startsWith('@')) {
      const searchTerm = query.substring(1);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('username', `%${searchTerm}%`);

      if (data) setFilteredUsers(data);
    }
  };

  const handleUserClick = async (user: User) => {
    if (!currentUser) return;

    // Verificar se a sala já existe
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('*')
      .or(`user1.eq.${currentUser.id},user2.eq.${currentUser.id}`)
      .or(`user1.eq.${user.id},user2.eq.${user.id}`)
      .single();

    if (existingRoom) {
      navigate(`/chat/${existingRoom.id}`);
    } else {
      // Criar nova sala
      const { data: newRoom } = await supabase
        .from('rooms')
        .insert([{
          user1: currentUser.id,
          user2: user.id
        }])
        .select()
        .single();

      if (newRoom) navigate(`/chat/${newRoom.id}`);
    }
  };

  return (
    <div className="p-4">
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Pesquisar usuários @..."
          className="w-full p-2 border rounded-lg pl-10"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <svg
          className="absolute left-3 top-3 h-5 w-5 text-gray-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {searchQuery.startsWith('@') && (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="p-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              @{user.username}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
