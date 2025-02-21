import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Places from "./pages/Places";
import PlaceDetail from "./pages/PlaceDetail";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import News from "./pages/News";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/perfil/:username" element={<PublicProfile />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/places" element={<Places />} />
        <Route path="/place/:id" element={<PlaceDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/news" element={<News />} />
      </Routes>
    </Router>
  );
}

export default App;
