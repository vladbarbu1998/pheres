import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/admin/AdminProtectedRoute";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Story from "./pages/Story";
import Celebrities from "./pages/Celebrities";

import Contact from "./pages/Contact";
import SearchPage from "./pages/Search";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Collection from "./pages/Collection";
import Category from "./pages/Category";
import Product from "./pages/Product";
import ProductRedirect from "./pages/ProductRedirect";
import ShopAllRedirect from "./pages/ShopAllRedirect";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Returns from "./pages/Returns";
import Login from "./pages/account/Login";
import Register from "./pages/account/Register";
import ForgotPassword from "./pages/account/ForgotPassword";
import ResetPassword from "./pages/account/ResetPassword";
import AccountOverview from "./pages/account/Overview";
import Orders from "./pages/account/Orders";
import OrderDetail from "./pages/account/OrderDetail";
import Addresses from "./pages/account/Addresses";
import Favorites from "./pages/account/Favorites";
import Details from "./pages/account/Details";
import AdminEntry from "./pages/admin/AdminEntry";
import AdminProducts from "./pages/admin/Products";
import AdminProductForm from "./pages/admin/ProductForm";
import AdminCollections from "./pages/admin/Collections";
import AdminCategories from "./pages/admin/Categories";
import AdminOrders from "./pages/admin/Orders";
import AdminOrderDetail from "./pages/admin/OrderDetail";
import AdminCustomers from "./pages/admin/Customers";
import AdminNews from "./pages/admin/News";
import AdminCelebrities from "./pages/admin/Celebrities";
import AdminStory from "./pages/admin/Story";
import AdminInbox from "./pages/admin/Inbox";
import NotFound from "./pages/NotFound";
import RoutesDebug from "./pages/RoutesDebug";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/story" element={<Story />} />
              <Route path="/celebrities" element={<Celebrities />} />
              
              <Route path="/contact" element={<Contact />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/shop/collection/:slug" element={<Collection />} />
              <Route path="/shop/category/:slug" element={<Category />} />
              <Route path="/shop/all/:productSlug" element={<ShopAllRedirect />} />
              <Route path="/shop/all" element={<ShopAllRedirect />} />
              <Route path="/shop/:categorySlug/:productSlug" element={<Product />} />
              <Route path="/product/:slug" element={<ProductRedirect />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/shipping" element={<Returns />} />
            
            {/* Auth routes */}
            <Route path="/account/login" element={<Login />} />
            <Route path="/account/register" element={<Register />} />
            <Route path="/account/forgot-password" element={<ForgotPassword />} />
            <Route path="/account/reset-password" element={<ResetPassword />} />
            
            {/* Protected account routes */}
            <Route path="/account" element={<ProtectedRoute><AccountOverview /></ProtectedRoute>} />
            <Route path="/account/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/account/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
            <Route path="/account/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/account/details" element={<ProtectedRoute><Details /></ProtectedRoute>} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminEntry />} />
            <Route path="/admin/products" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
            <Route path="/admin/products/new" element={<AdminProtectedRoute><AdminProductForm /></AdminProtectedRoute>} />
            <Route path="/admin/products/:id" element={<AdminProtectedRoute><AdminProductForm /></AdminProtectedRoute>} />
            <Route path="/admin/collections" element={<AdminProtectedRoute><AdminCollections /></AdminProtectedRoute>} />
            <Route path="/admin/categories" element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
            <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
            <Route path="/admin/orders/:id" element={<AdminProtectedRoute><AdminOrderDetail /></AdminProtectedRoute>} />
            <Route path="/admin/customers" element={<AdminProtectedRoute><AdminCustomers /></AdminProtectedRoute>} />
            <Route path="/admin/news" element={<AdminProtectedRoute><AdminNews /></AdminProtectedRoute>} />
            <Route path="/admin/celebrities" element={<AdminProtectedRoute><AdminCelebrities /></AdminProtectedRoute>} />
            <Route path="/admin/story" element={<AdminProtectedRoute><AdminStory /></AdminProtectedRoute>} />
            <Route path="/admin/inbox" element={<AdminProtectedRoute><AdminInbox /></AdminProtectedRoute>} />
            {/* Debug route - not linked in navigation */}
            <Route path="/_routes" element={<RoutesDebug />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
