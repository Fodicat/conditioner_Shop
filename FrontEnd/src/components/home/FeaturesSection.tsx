
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const FeaturesSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-12">Наши услуги</h2>
      <Carousel className="max-w-3xl mx-auto">
        <CarouselContent>
          <CarouselItem>
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-semibold">Проектирование</h3>
                  <p className="text-ColorP">
                    Профессиональное проектирование мультизональных систем кондиционирования
                  </p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-semibold">Монтаж</h3>
                  <p className="text-ColorP">
                    Качественный монтаж систем кондиционирования с гарантией
                  </p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
          <CarouselItem>
            <Card>
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-semibold">Обслуживание</h3>
                  <p className="text-ColorP">
                    Регулярное техническое обслуживание и чистка кондиционеров
                  </p>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
