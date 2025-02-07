
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";

const Lojas = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Lojas</h1>
        <p className="text-gray-600">Conteúdo da página de lojas em breve...</p>
      </main>
      <Footer />
    </div>
  );
};

export default Lojas;
