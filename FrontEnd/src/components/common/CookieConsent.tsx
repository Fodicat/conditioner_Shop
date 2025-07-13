
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже получено согласие на использование cookie
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (cookieConsent === null) {
      // Если согласие не было получено, показываем баннер
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    // Сохраняем согласие пользователя
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const declineCookies = () => {
    // Сохраняем отказ пользователя
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    
    // Здесь можно добавить логику для отключения ненужных cookie
    // Например, отключить аналитику и т.д.
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto p-4 shadow-lg border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            <h3 className="text-lg font-semibold mb-1">🍪 Использование cookie</h3>
            <p>
              Этот сайт использует cookie для улучшения вашего пользовательского опыта. 
              Продолжая использовать сайт, вы соглашаетесь с использованием cookie.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" onClick={declineCookies}>
              Отклонить
            </Button>
            <Button onClick={acceptCookies}>
              Принять
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
