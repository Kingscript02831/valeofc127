
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "sonner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";
import Menu from "./pages/Menu";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ProductForm from "./pages/ProductForm";
import UserProducts from "./pages/UserProducts";
import Places from "./pages/Places";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Config from "./pages/config";
import Search from "./pages/Search";
import Events from "./pages/Events";
import Notify from "./pages/Notify";
import StoryViewer from "./pages/StoryViewer";
import CreateStory from "./pages/CreateStory";
import Posts from "./pages/Posts";
import PostDetails from "./pages/PostDetails";
import PostForm from "./pages/PostForm";

import AuthWrapper from "./components/AuthWrapper";

// Admin pages
import Admin from "./pages/Admin";
import AdminEvents from "./pages/AdminEvents";
import AdminNews from "./pages/AdminNews";
import AdminPlaces from "./pages/AdminPlaces";
import AdminSistema from "./pages/AdminSistema";
import AdminCategories from "./pages/AdminCategories";

function ScrollToTop() {
  const { pathname } = useLocation();

  window.scrollTo(0, 0);

  return null;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <ScrollToTop />
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/locais" element={<Places />} />
          <Route path="/eventos" element={<Events />} />
          <Route path="/search" element={<Search />} />
          <Route path="/stories/:userId" element={<StoryViewer />} />

          {/* Rotas autenticadas */}
          <Route
            path="/create-product"
            element={
              <AuthWrapper>
                <ProductForm />
              </AuthWrapper>
            }
          />
          <Route
            path="/create-post"
            element={
              <AuthWrapper>
                <PostForm />
              </AuthWrapper>
            }
          />
          <Route
            path="/create-story"
            element={
              <AuthWrapper>
                <CreateStory />
              </AuthWrapper>
            }
          />
          <Route
            path="/my-products"
            element={
              <AuthWrapper>
                <UserProducts />
              </AuthWrapper>
            }
          />
          <Route
            path="/perfil"
            element={
              <AuthWrapper>
                <Profile />
              </AuthWrapper>
            }
          />
          <Route
            path="/perfil/:username"
            element={<UserProfile />}
          />
          <Route
            path="/configuracoes"
            element={
              <AuthWrapper>
                <Config />
              </AuthWrapper>
            }
          />
          <Route
            path="/notificacoes"
            element={
              <AuthWrapper>
                <Notify />
              </AuthWrapper>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AuthWrapper>
                <Admin />
              </AuthWrapper>
            }
          />
          <Route
            path="/admin/eventos"
            element={
              <AuthWrapper>
                <AdminEvents />
              </AuthWrapper>
            }
          />
          <Route
            path="/admin/noticias"
            element={
              <AuthWrapper>
                <AdminNews />
              </AuthWrapper>
            }
          />
          <Route
            path="/admin/locais"
            element={
              <AuthWrapper>
                <AdminPlaces />
              </AuthWrapper>
            }
          />
          <Route
            path="/admin/sistema"
            element={
              <AuthWrapper>
                <AdminSistema />
              </AuthWrapper>
            }
          />
          <Route
            path="/admin/categorias"
            element={
              <AuthWrapper>
                <AdminCategories />
              </AuthWrapper>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
