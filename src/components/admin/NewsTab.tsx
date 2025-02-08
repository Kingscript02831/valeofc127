
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewsTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const NewsTab = ({ searchTerm, setSearchTerm }: NewsTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: news } = useQuery({
    queryKey: ['news', searchTerm],
    queryFn: async () => {
      console.info('Fetching news with searchTerm:', searchTerm);
      const query = supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      console.info('Fetched news data:', data);
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 mr-4">
          <Input
            type="text"
            placeholder="Buscar notícias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="whitespace-nowrap"
        >
          Nova Notícia
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {news?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">
                {new Date(item.created_at).toLocaleDateString('pt-BR')}
              </p>
              <p className="mt-2 line-clamp-3">{item.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NewsTab;
