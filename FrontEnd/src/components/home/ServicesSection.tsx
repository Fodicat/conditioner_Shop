
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AirVent, Settings, Wrench } from "lucide-react";

export const ServicesSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AirVent className="h-6 w-6" />
              Монтаж и установка
            </CardTitle>
            <CardDescription>Профессиональная установка</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-ColorP">
              Установка кондиционеров и монтаж мультизональных систем любой сложности
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Техническое обслуживание
            </CardTitle>
            <CardDescription>Регулярный сервис</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-ColorP">
              Чистка, дезинфекция и профилактическое обслуживание систем кондиционирования
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-6 w-6" />
              Ремонт и диагностика
            </CardTitle>
            <CardDescription>Оперативный ремонт</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-ColorP">
              Диагностика неисправностей и ремонт систем кондиционирования всех типов
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
