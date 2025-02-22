import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, PlusSquare, User, MessageSquare } from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <Home className="h-6 w-6" />
          <span className="text-xs">Home</span>
        </button>

        <button
          onClick={() => navigate('/messages')}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs">Messages</span>
        </button>

        <button
          onClick={() => navigate('/new')}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <PlusSquare className="h-6 w-6" />
          <span className="text-xs">New Post</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
        >
          <User className="h-6 w-6" />
          <span className="text-xs">Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
