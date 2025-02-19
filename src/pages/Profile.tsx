
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Profile } from "@/types/profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Array<{ id: string; name: string; state: string }>>([]);
  const [profile, setProfile] = useState<Profile>({
    id: "",
    username: "",
    full_name: "",
    avatar_url: "",
    bio: "",
    email: "",
    phone: "",
    birth_date: "",
    website: "",
    city: "",
    street: "",
    house_number: "",
    postal_code: "",
    location_id: null
  });

  useEffect(() => {
    getProfile();
    getLocations();
  }, []);

  async function getLocations() {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (data) setLocations(data);
    } catch (error) {
      console.error('Erro ao buscar localizações:', error);
    }
  }

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user');

      let { data, error } = await supabase
        .from('profiles')
        .select(`
          username,
          full_name,
          avatar_url,
          bio,
          email,
          phone,
          birth_date,
          website,
          city,
          street,
          house_number,
          postal_code,
          location_id
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setProfile({
          id: user.id,
          ...data,
        });
      }
    } catch (error) {
      console.error('Error loading user data!');
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('No user');

      const updates = {
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
        email: profile.email,
        phone: profile.phone,
        birth_date: profile.birth_date,
        website: profile.website,
        city: profile.city,
        street: profile.street,
        house_number: profile.house_number,
        postal_code: profile.postal_code,
        location_id: profile.location_id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Perfil</h1>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              value={profile.email || ""}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={profile.username || ""}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input
              id="full_name"
              type="text"
              value={profile.full_name || ""}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Select
              value={profile.location_id || ""}
              onValueChange={(value) => setProfile({ ...profile, location_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua localização" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} - {location.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              type="text"
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              type="text"
              value={profile.phone || ""}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={profile.website || ""}
              onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Data de nascimento</Label>
            <Input
              id="birth_date"
              type="date"
              value={profile.birth_date || ""}
              onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              type="text"
              value={profile.street || ""}
              onChange={(e) => setProfile({ ...profile, street: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="house_number">Número</Label>
            <Input
              id="house_number"
              type="text"
              value={profile.house_number || ""}
              onChange={(e) => setProfile({ ...profile, house_number: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input
              id="city"
              type="text"
              value={profile.city || ""}
              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postal_code">CEP</Label>
            <Input
              id="postal_code"
              type="text"
              value={profile.postal_code || ""}
              onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => updateProfile()}
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar perfil"}
          </Button>
        </div>
      </div>
    </div>
  );
}
