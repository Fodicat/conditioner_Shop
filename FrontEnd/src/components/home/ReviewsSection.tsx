
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export const ReviewsSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 animate-fade-in">
      <h2 className="text-3xl font-bold text-center mb-12">Отзывы наших клиентов</h2>
      <Carousel className="max-w-4xl mx-auto">
        <CarouselContent>
          <CarouselItem>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Анна Петрова</h3>
                  <p className="text-ColorP italic">
                    "Отличный сервис! Установили кондиционер быстро и профессионально. 
                    Специалисты очень вежливые и компетентные. Рекомендую!"
                  </p>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>

          <CarouselItem>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Михаил Иванов</h3>
                  <p className="text-ColorP italic">
                    "Заказывал установку кондиционера в офис. Всё сделали очень аккуратно и быстро.
                    Цены адекватные, сервис на высоте. Буду обращаться ещё!"
                  </p>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>

          <CarouselItem>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold">Елена Сидорова</h3>
                  <p className="text-ColorP italic">
                    "Обратилась для установки кондиционера в квартиру. Очень довольна результатом!
                    Мастера работают чисто и аккуратно. Спасибо за отличную работу!"
                  </p>
                  <div className="flex justify-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
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
