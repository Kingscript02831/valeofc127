import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "../integrations/supabase/client";
import MediaCarousel from "../components/MediaCarousel";
import { useToast } from "../components/ui/use-toast";
import { Avatar, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Textarea } from "../components/ui/textarea";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import ReactionMenu from "../components/ReactionMenu";
import { MessageSquare, MoreVertical, Share2, Trash2, Edit2 } from 'lucide-react';

export default function PostDetails() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Fetch current user data
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUser(profile);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .update({ content: newContent })
        .eq('id', commentId);

      if (error) throw error;

      // Atualiza a lista de comentários
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: newContent }
          : comment
      ));
      setIsEditing(null);
      toast({
        title: "Comentário atualizado com sucesso!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar comentário",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Remove o comentário da lista
      setComments(comments.filter(comment => comment.id !== commentId));
      toast({
        title: "Comentário excluído com sucesso!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir comentário",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select(`*, profiles(username, avatar_url)`)
          .eq('id', postId)
          .single();

        if (postError) {
          throw postError;
        }

        if (!postData) {
          navigate('/404');
          return;
        }

        setPost(postData);

        const { data: commentsData, error: commentsError } = await supabase
          .from('post_comments')
          .select(`*, profiles(username, avatar_url)`)
          .eq('post_id', postId)
          .order('created_at', { ascending: false });

        if (commentsError) {
          throw commentsError;
        }

        setComments(commentsData || []);
      } catch (error: any) {
        console.error("Error fetching post details:", error);
        toast({
          title: "Error fetching post details",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate, toast]);

  const handleComment = async () => {
    if (!newComment.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Not authenticated",
          description: "You must be logged in to comment.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('post_comments')
        .insert([{
          post_id: postId,
          user_id: user.id,
          content: newComment,
        }])
        .select(`*, profiles(username, avatar_url)`)
        .single();

      if (error) {
        throw error;
      }

      setComments([data, ...comments]);
      setNewComment('');
      toast({
        title: "Comment added",
        variant: "default",
      });

    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="container mx-auto pb-20">
      <Navbar />
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={post.profiles?.avatar_url || ''} />
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{post.profiles?.username}</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {post.images && post.images.length > 0 || post.video_urls && post.video_urls.length > 0 ? (
            <MediaCarousel images={post.images} videos={post.video_urls} />
          ) : null}
          <CardDescription className="mt-2">{post.content}</CardDescription>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <ReactionMenu postId={postId} />
            <Button variant="ghost">
              <MessageSquare className="h-5 w-5 mr-2" />
              {comments.length} Comments
            </Button>
          </div>
          <Button variant="ghost">
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-4">Comentários</h2>
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profiles?.avatar_url || ''} />
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold">{comment.profiles?.username}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {(currentUser?.id === comment.user_id || currentUser?.role === 'admin') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {currentUser?.id === comment.user_id && (
                        <DropdownMenuItem
                          onClick={() => {
                            setIsEditing(comment.id);
                            setEditedComment(comment.content);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              <CardContent>
                {isEditing === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditComment(comment.id, editedComment)}
                      >
                        Salvar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm">{comment.content}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Add a comment</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Write your comment here"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button onClick={handleComment}>Post Comment</Button>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
