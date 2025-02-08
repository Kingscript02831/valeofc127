
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";

const Stores = () => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Lojas | Vale Notícias";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Lojas</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar lojas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <p className="text-gray-600">Conteúdo das lojas em breve...</p>
      </main>
      <Footer />
    </div>
  );
};

export default Stores;
