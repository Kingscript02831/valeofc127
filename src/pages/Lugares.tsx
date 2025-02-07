
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";

const Lugares = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Lugares</h1>
        <div className="grid gap-6">
          {/* Content will be added later */}
          <p className="text-gray-500 text-center py-8">
            Conteúdo de lugares em breve...
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Lugares;
