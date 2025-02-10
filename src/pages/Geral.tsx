
import Navbar2 from "../components/Navbar2";
import SubNav2 from "../components/SubNav2";

const Geral = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <SubNav2 />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel de Cores</h1>
        {/* Conteúdo da página geral */}
      </div>
    </div>
  );
};

export default Geral;
