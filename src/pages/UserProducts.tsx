
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import BottomNav from "../components/BottomNav";

const UserProducts = () => {
  const [activeTab, setActiveTab] = useState("my-products");

  return (
    <>
      <Navbar />
      <SubNav />
      <div className="container mx-auto px-4 pb-20 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-products">Meus Produtos</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="sold">Vendidos</TabsTrigger>
          </TabsList>
          <TabsContent value="my-products">
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-4">Meus Produtos</h2>
              {/* Conteúdo dos produtos do usuário */}
            </div>
          </TabsContent>
          <TabsContent value="favorites">
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-4">Favoritos</h2>
              {/* Conteúdo dos favoritos */}
            </div>
          </TabsContent>
          <TabsContent value="sold">
            <div className="mt-4">
              <h2 className="text-2xl font-bold mb-4">Vendidos</h2>
              {/* Conteúdo dos produtos vendidos */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </>
  );
};

export default UserProducts;
