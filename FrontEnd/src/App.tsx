
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import PriceList from "./pages/PriceList";
import Gallery from "./pages/Gallery";
import Contacts from "./pages/Contacts";
import Consultation from "./pages/Consultation";
import AdminPanel from "./pages/AdminPanel";
import AdminNotifications from "./pages/AdminNotifications";
import AccountSettings from "./components/AccountSettings";
import UserProfile from "./pages/UserProfile";
import Blog from "./pages/Blog";
import AccountVerification from "./pages/AccountVerification";
import AccountResetPassword from "./pages/AccountPasswordReset"
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/toaster";
import { CartProvider } from "./contexts/CartContext";
import { CookieConsent } from "./components/common/CookieConsent";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetails />} />
              <Route path="/price-list" element={<PriceList />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/consultation" element={<Consultation />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/notifications" element={<AdminNotifications />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/verify-account" element={<AccountVerification />} />
              <Route path="/reset-password" element={<AccountResetPassword />} />
            </Routes>
          </Router>
          <Toaster />
          <CookieConsent />
        </CartProvider>
      </ThemeProvider>
    </QueryClientProvider> 
  );
}

export default App;
