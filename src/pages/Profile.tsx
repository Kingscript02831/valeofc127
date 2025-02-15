import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { ThemeToggle } from "@/components/ThemeToggle"

const Profile = () => {
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
        
        
      </div>
    </div>
  )
}

export default Profile
