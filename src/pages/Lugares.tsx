
import { useState } from "react";
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
        <p className="text-gray-600">Conteúdo da página de lugares em breve...</p>
      </main>
      <Footer />
    </div>
  );
};

export default Lugares;
