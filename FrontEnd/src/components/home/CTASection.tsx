
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 py-20 animate-fade-in">
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Нужна консультация?</h2>
        <p className="text-xl text-ColorP max-w-2xl mx-auto">
          Свяжитесь с нами для получения профессиональной консультации по вашему проекту
        </p>
        <Button size="lg" className="custom-button" variant="secondary" onClick={() => navigate("/consultation")}>
          Оставить заявку
        </Button>
      </div>
    </section>
  );
};
