
import { Button } from "@/components/ui/button";
import { Image, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickAccessSection = () => {
  const navigate = useNavigate();

  return (
    <section className="container mx-auto px-4 py-16 bg-background rounded-lg animate-fade-in">
      <div className="flex flex-col md:flex-row justify-center items-center gap-6">
        <Button 
          size="lg"
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-6 text-lg h-auto transition duration-200 custom-button"
          onClick={() => navigate("/price-list")}
        >
          Прайс-Лист
        </Button>
        
        <Button 
          size="lg"
          variant="secondary"
          className="w-full md:w-auto px-8 py-6 text-lg h-auto custom-button"
          onClick={() => navigate("/gallery")}
        >
          <Image className="h-6 w-6" />
          Галерея
        </Button>
        
        <Button 
          size="lg"
          variant="secondary"
          className="w-full md:w-auto px-8 py-6 text-lg h-auto custom-button"
          onClick={() => navigate("/contacts")}
        >
          <Phone className="h-6 w-6" />
          Контактная информация
        </Button>
      </div>
    </section>
  );
};
