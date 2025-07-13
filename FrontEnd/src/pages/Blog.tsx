import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config/appConfig";

interface BlogPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: string;
  image?: string;
}

const Blog = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: "", 
    content: "",
    image: null as File | null,
  });
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/blog-posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await fetch(`${API_URL}/api/blog-posts/${postId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Успешно",
        description: "Пост успешно удалён",
      });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить пост",
        variant: "destructive",
      });
    },
  });

  const addPostMutation = useMutation({
    mutationFn: async (postData: typeof newPost) => {
      // Создаем новый объект FormData
      const formData = new FormData();
  
      // Добавляем текстовые данные (название и контент)
      formData.append('title', postData.title);
      formData.append('content', postData.content);
  
      // Добавляем изображение, если оно есть
      if (postData.image) {
        formData.append('image', postData.image, postData.image.name);
      }
  
      // Отправляем данные на сервер
      const response = await fetch(`${API_URL}/api/blog-posts`, {
        method: 'POST',
        body: formData, // Отправляем данные в формате FormData
      });
  
      if (!response.ok) throw new Error('Failed to add post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      toast({
        title: "Успешно",
        description: "Пост успешно добавлен",
      });
      setIsOpen(false);
      setNewPost({ title: "", content: "", image: null });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось добавить пост",
        variant: "destructive",
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewPost(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 custom-button1 hidden lg:flex"
          >
            <ArrowLeft className="mr-2 h-4 w-4"/>
            Назад
          </Button>
          {user?.isAdmin && (
            <Button 
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Добавить пост
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Card key={post.id} className="animate-fade-in">
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <CardDescription>
                  Автор: {post.author} | {new Date(post.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.image && (
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img 
                      src={`${API_URL}${post.image}`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deletePostMutation.mutate(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <p className="whitespace-pre-wrap">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый пост</DialogTitle>
            </DialogHeader>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                addPostMutation.mutate(newPost);
              }}
              className="space-y-4"
            >
              <Input
                placeholder="Заголовок"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                required
              />
              <Textarea
                placeholder="Содержание"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                required
                className="min-h-[200px]"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Button type="submit" className="w-full">
                Опубликовать
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Blog;
