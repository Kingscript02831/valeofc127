
import { Link } from "react-router-dom";

const SubNav = () => {
  return (
    <nav className="bg-gray-100 p-2">
      <div className="container mx-auto flex justify-center space-x-4">
        <Link to="/" className="hover:text-primary">Notícias</Link>
        <Link to="/eventos" className="hover:text-primary">Eventos</Link>
        <Link to="/lugares" className="hover:text-primary">Lugares</Link>
        <Link to="/lojas" className="hover:text-primary">Lojas</Link>
      </div>
    </nav>
  );
};

export default SubNav;
