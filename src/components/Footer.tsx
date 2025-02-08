
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p>&copy; {new Date().getFullYear()} Vale Notícias. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
