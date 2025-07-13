
import { Button } from "@/components/ui/button";
import { AirVent, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-test">
          Профессиональные системы кондиционирования
        </h1>
        <p className="text-xl text-ColorP max-w-2xl mx-auto">
          Монтаж, обслуживание и ремонт систем кондиционирования любой сложности
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="custom-button1" onClick={() => navigate("/consultation")}>
            Заказать консультацию <AirVent className="ml-2" />
          </Button>
          <Button 
            size="lg" 
            variant="secondary"
            className="custom-button1"
            onClick={() => navigate("/shop")}
          >
            Магазин кондиционеров <ShoppingCart className="ml-2" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="custom-button"
            onClick={() => navigate("/blog")}
          >
            Блог
          </Button>
        </div>
      </div>
    </section>
  );
};
