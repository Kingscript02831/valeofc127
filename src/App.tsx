
import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";
import AuthWrapper from "./components/AuthWrapper";
import { ErrorBoundary } from "react-error-boundary";

// Lazy load routes
const Index = lazy(() => import("./pages/Index"));
const NewsDetails = lazy(() => import("./pages/NewsDetails"));
const Places = lazy(() => import("./pages/Places"));
const Events = lazy(() => import("./pages/Events"));
const Stores = lazy(() => import("./pages/Stores"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Notify = lazy(() => import("./pages/Notify"));
const Config = lazy(() => import("./pages/config"));
const UserProducts = lazy(() => import("./pages/UserProducts"));
const ProductForm = lazy(() => import("./pages/ProductForm"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/news/:id" element={<NewsDetails />} />
      <Route path="/places" element={<Places />} />
      <Route path="/events" element={<Events />} />
      <Route path="/stores" element={<Stores />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      {/* Protected routes */}
      <Route element={<AuthWrapper />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/notify" element={<Notify />} />
        <Route path="/config" element={<Config />} />
        <Route path="/user-products" element={<UserProducts />} />
        <Route path="/product-form" element={<ProductForm />} />
        <Route path="/product-form/:id" element={<ProductForm />} />
        <Route path="/admin/*" element={<Admin />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<div>Loading...</div>}>
            <RouterProvider router={router} />
          </Suspense>
        </ErrorBoundary>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
