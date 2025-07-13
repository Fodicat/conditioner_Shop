
import { useState } from "react";
import { AuthDialogs } from "@/components/auth/AuthDialogs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { AdminSection } from "@/components/home/AdminSection";
import { AuthSection } from "@/components/home/AuthSection";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { QuickAccessSection } from "@/components/home/QuickAccessSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { CTASection } from "@/components/home/CTASection";
import { Footer } from "@/components/home/Footer";

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <AdminSection user={user} />
      
      <AuthSection 
        user={user}
        logout={logout}
        setIsLoginOpen={setIsLoginOpen}
        setIsRegisterOpen={setIsRegisterOpen}
      />

      <AuthDialogs
        isLoginOpen={isLoginOpen}
        isRegisterOpen={isRegisterOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onRegisterClose={() => setIsRegisterOpen(false)}
        isResetPasswordOpen={false}
        onResetPasswordClose={() => {}}
      />

      <HeroSection />
      <ServicesSection />
      
      <Separator className="h-px bg-border w-full my-8" />
      
      <FeaturesSection />
      
      <Separator className="h-px bg-border w-full my-8" />
      
      <QuickAccessSection />
      <ReviewsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
