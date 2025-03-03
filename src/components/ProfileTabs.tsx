
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ProfileTabsProps {
  userProducts: any[];
  userPosts: any[];
  isLoading?: boolean;
}

const ProfileTabs = ({ userProducts = [], userPosts = [], isLoading = false }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="products">Produtos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="posts">
        {isLoading ? (
          <div className="flex justify-center">
            <p>Carregando posts...</p>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Nenhum post encontrado</p>
          </div>
        ) : (
          <div className="grid gap-4 mt-4">
            {userPosts.map((post: any) => (
              <div key={post.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <p>{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="products">
        {userProducts.length === 0 ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Nenhum produto encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {userProducts.map((product: any) => (
              <div key={product.id} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <p>{product.name}</p>
                <p className="text-sm text-gray-500">{product.price}</p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
