
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewsTab from "@/components/admin/NewsTab";
import EventsTab from "@/components/admin/EventsTab";
import PlacesTab from "@/components/admin/PlacesTab";
import NavConfigTab from "@/components/admin/NavConfigTab";
import FooterTab from "@/components/admin/FooterTab";
import GeneralTab from "@/components/admin/GeneralTab";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchEventTerm, setSearchEventTerm] = useState("");
  const [searchPlaceTerm, setSearchPlaceTerm] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel Administrativo</h1>

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList>
            <TabsTrigger value="news">Notícias</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="places">Lugares</TabsTrigger>
            <TabsTrigger value="config">Config Navbar</TabsTrigger>
            <TabsTrigger value="footer">Rodapé</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <NewsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </TabsContent>

          <TabsContent value="events">
            <EventsTab searchEventTerm={searchEventTerm} setSearchEventTerm={setSearchEventTerm} />
          </TabsContent>

          <TabsContent value="places">
            <PlacesTab searchPlaceTerm={searchPlaceTerm} setSearchPlaceTerm={setSearchPlaceTerm} />
          </TabsContent>

          <TabsContent value="config">
            <NavConfigTab />
          </TabsContent>

          <TabsContent value="footer">
            <FooterTab />
          </TabsContent>

          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
