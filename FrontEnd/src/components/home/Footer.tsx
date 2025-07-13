
import { PhoneCall, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Vk_Icon from "@/assets/Icon_Vk.svg";
import Telegram_Icon from "@/assets/Icon_Telegram.svg";
import Whatsapp_Icon from "@/assets/Icon_Whatsapp.svg";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[hsl(var(--card-foregroundF))] text-secondary-foreground py-12 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1 - About */}
          <div>
            <h3 className="text-white font-semibold mb-4">О нас</h3>
            <p className="text-gray-300">
              Мы уже более 15 лет занимаемся профессиональной установкой и обслуживанием систем кондиционирования. 
              Наша команда опытных специалистов обеспечивает высокое качество работ и индивидуальный подход к каждому клиенту.
            </p>
          </div>

          {/* Column 2 - Service Areas */}
          <div>
            <h3 className="text-white font-semibold mb-4">Зона обслуживания</h3>
            <ul className="space-y-2 text-gray-300">
              <li>г. Мариуполь</li>
              <li>Мангуш</li>
              <li>Сартана</li>
              <li>Талаковка</li>
              <li>Гнутово</li>
            </ul>
          </div>

          {/* Column 3 - Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/price-list");
                  }}
                  className="text-gray-300 hover:text-white"
                >
                  Прайс-лист
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/gallery");
                  }}
                  className="text-gray-300 hover:text-white"
                >
                  Галерея
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/contacts");
                  }}
                  className="text-gray-300 hover:text-white"
                >
                  Контактная информация
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Связаться с нами</h3>
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-gray-300">
                <PhoneCall className="h-4 w-4" />
                +7 (999) 123-45-67
              </p>
              <p className="flex items-center gap-2 text-gray-300">
                <Mail className="h-4 w-4" />
                info@aircondition.ru
              </p>
              <div className="flex gap-4 mt-4">
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  <img src={Vk_Icon} alt="VK" className="h-6 w-6 custom-button" />
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  <img src={Whatsapp_Icon} alt="WhatsApp" className="h-6 w-6 custom-button" />
                </a>
                <a 
                  href="#" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white"
                >
                  <img src={Telegram_Icon} alt="Telegram" className="h-6 w-6 custom-button" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
