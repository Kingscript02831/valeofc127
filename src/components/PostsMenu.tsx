
import React from "react";
import { Link } from "react-router-dom";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const PostsMenu = () => {
  const { data: config } = useSiteConfig();

  return (
    <nav 
      className="sticky top-[4.5rem] z-10 w-full border-b mb-6 py-4"
      style={{
        background: `linear-gradient(to right, ${config?.navbar_color || '#1a1b1e'}, ${config?.primary_color || '#2d2d2d'})`,
        borderColor: `${config?.primary_color}20` || '#2d2d2d20'
      }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-xl font-semibold" style={{ color: config?.text_color }}>
          Posts
        </h1>
        <Link to="/posts/new">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            style={{
              borderColor: config?.text_color,
              color: config?.text_color
            }}
          >
            <Plus className="h-4 w-4" />
            Novo Post
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default PostsMenu;
