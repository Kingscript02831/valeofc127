
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-primary text-white p-4">
      <div className="container mx-auto">
        <Link to="/" className="text-xl font-bold">
          Vale Notícias
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
