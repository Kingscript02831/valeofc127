import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthWrapper from './components/AuthWrapper';
import Perfil from './pages/Perfil';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import NewProduct from './pages/NewProduct';
import EditProduct from './pages/EditProduct';
import Notify from './pages/Notify';
import Events from './pages/Events';
import Places from './pages/Places';
import Admin from './pages/Admin';
import AdminNews from './components/admin/AdminNews';
import AdminEvents from './components/admin/AdminEvents';
import AdminPlaces from './components/admin/AdminPlaces';
import AdminProducts from './components/admin/AdminProducts';
import AdminCategories from './components/admin/AdminCategories';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import CreatePost from './pages/CreatePost';
import Posts from './pages/Posts';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={createBrowserRouter(
        createRoutesFromElements(
          <Route element={<AuthWrapper />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/products/new" element={<NewProduct />} />
            <Route path="/products/:id/edit" element={<EditProduct />} />
            <Route path="/notify" element={<Notify />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/lugares" element={<Places />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/news" element={<AdminNews />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/places" element={<AdminPlaces />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/new" element={<CreatePost />} />
          </Route>
        )
      )} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
