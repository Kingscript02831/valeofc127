
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import type { Profile } from "@/types/profile";
import { useTheme } from "@/components/ThemeProvider";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      
      if (data) {
        setProfile(data);
        // Set theme based on user preference
        if (data.theme_preference) {
          setTheme(data.theme_preference);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          username: profile.username,
          website: profile.website,
          bio: profile.bio,
          theme_preference: theme
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar seu perfil.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto p-4">
        <Card className="w-full animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto p-4">
      <Card className="w-full bg-card">
        <CardHeader>
          <CardTitle>Seu Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                type="text"
                value={profile?.full_name || ''}
                onChange={(e) => setProfile(profile ? { ...profile, full_name: e.target.value } : null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                type="text"
                value={profile?.username || ''}
                onChange={(e) => setProfile(profile ? { ...profile, username: e.target.value } : null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={profile?.website || ''}
                onChange={(e) => setProfile(profile ? { ...profile, website: e.target.value } : null)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Sobre você</Label>
              <Input
                id="bio"
                type="text"
                value={profile?.bio || ''}
                onChange={(e) => setProfile(profile ? { ...profile, bio: e.target.value } : null)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                >
                  Claro
                </Button>
                <Button
                  type="button"
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                >
                  Escuro
                </Button>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">
                Atualizar perfil
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <Button
              variant="link"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/login');
              }}
              className="text-destructive hover:text-destructive/90"
            >
              Sair
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
