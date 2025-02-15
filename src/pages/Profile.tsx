
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useMutation, useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import type { Profile } from "@/types/profile"

const Profile = () => {
  const { user } = useAuth()

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!user?.id,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Perfil</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/config">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback>{profile?.full_name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">{profile?.full_name || "Nome não definido"}</h2>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Nome de Usuário</h3>
                  <p className="text-muted-foreground">{profile?.username || "Não definido"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Biografia</h3>
                  <p className="text-muted-foreground">{profile?.bio || "Não definida"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Telefone</h3>
                  <p className="text-muted-foreground">{profile?.phone || "Não definido"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Website</h3>
                  <p className="text-muted-foreground">
                    {profile?.website ? (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {profile.website}
                      </a>
                    ) : (
                      "Não definido"
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Endereço</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p>{profile?.street} {profile?.house_number}</p>
                    <p>{profile?.city}</p>
                    <p>{profile?.postal_code}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
