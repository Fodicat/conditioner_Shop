import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bell, Package, Phone, Mail, Calendar, MapPin, ChevronDown, ShoppingBag, Tag, DollarSign, MessageSquare, Info, Link, User, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { API_URL } from "@/config/appConfig";

const AdminNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState<{ [key: number]: boolean }>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOrder, setIsOrder] = useState(false);

  // Fetch notifications
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/api/notifications`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Классифицируем уведомления
        const classifiedData = data.map((notification: any) => ({
          ...notification,
          isOrder: isOrderNotification(notification)
        }));
        
        console.log("Получены и классифицированы уведомления:", classifiedData);
        return classifiedData;
      } catch (error) {
        console.error("Ошибка при получении уведомлений:", error);
        return [];
      }
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Ошибка при отметке уведомления как прочитанное:', error);
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/api/notifications/${id}/delete`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Удалено",
        description: "Уведомление успешно удалено",
      });
    },
    onError: (error) => {
      console.error('Ошибка при удалении уведомления:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить уведомление",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Mark notifications as read when expanded
    Object.entries(expandedNotifications).forEach(([id, isExpanded]) => {
      if (isExpanded) {
        const notification = notifications?.find(n => n.id === parseInt(id));
        if (notification && !notification.isRead) {
          markAsReadMutation.mutate(parseInt(id));
        }
      }
    });
  }, [expandedNotifications, notifications]);

  useEffect(() => {
    const eventSource = new EventSource(`${API_URL}/api/notifications/stream`);

    eventSource.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      queryClient.setQueryData(['notifications'], (old: any) => [
        ...(old || []),
        {
          ...newNotification,
          isOrder: isOrderNotification(newNotification)
        }
      ]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleDeleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  const toggleExpand = (id: number) => {
    setExpandedNotifications((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      return newState;
    });
  };

  // Проверка является ли уведомление заказом
  const isOrderNotification = (notification: any) => {
    return notification.type === 'purchase' || 
           (notification.description && notification.description.includes('###### НОВЫЙ ЗАКАЗ ######'));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <>
      <Button 
        variant="outline" 
        className="flex items-center gap-2 hover-scale" 
        onClick={() => {
          setIsOpen(true);
          refetch();
        }}
      >
        <Bell className="h-4 w-4" />
        <span className="hidden sm:inline">Уведомления</span>
        {notifications?.some(n => !n.isRead) && (
          <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
            {notifications.filter(n => !n.isRead).length}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl bg-background dark:bg-gray-800 text-foreground dark:text-white animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Уведомления о консультациях и заказах
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="min-h-[200px] max-h-[80vh] rounded-md border p-4 dark:border-gray-700">
            <div className="space-y-4">
              {!notifications || notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Нет уведомлений
                </div>
              ) : (
                notifications.map((notification) => {
                  const isExpanded = expandedNotifications[notification.id] || false;
                  const isOrder = isOrderNotification(notification);
                  
                  return (
                    <Card 
                      key={notification.id} 
                      className={`${notification.isRead ? 'bg-gray-100 dark:bg-gray-700/60' : 'bg-white dark:bg-gray-700 border-l-4 border-l-blue-500'} 
                        transition-all duration-300 transform ${isExpanded ? 'scale-[1.01] shadow-lg' : 'hover:shadow-sm'}
                        ease-in-out`}
                    >
                      <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleExpand(notification.id)}>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {isOrder ? (
                              <ShoppingBag className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Bell className="h-5 w-5 text-blue-500" />
                            )}
                            <div className="flex flex-col">
                              <span>
                                {isOrder ? "Новый заказ" : `Заявка от ${notification.name || "нового клиента"}`} 
                                {isOrder ? " (Тип: Заказ)" : " (Тип: Консультация)"}
                              </span>
                              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                {new Date(notification.createdAt).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {!notification.isRead && (
                              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse">
                                Новое
                              </Badge>
                            )}
                          </CardTitle>
                          <ChevronDown className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                      <CardContent className={`pt-0 transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-90'}`}>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                                <User className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                                Клиент:
                              </span>{" "}
                              <span>{notification.name || "Имя не указано"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                                <Phone className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                                Телефон:
                              </span>{" "}
                              <a href={`tel:${notification.phone}`} className="text-blue-500 hover:underline">
                                {notification.phone || "Не указан"}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                                <Mail className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                                Email:
                              </span>{" "}
                              <a href={`mailto:${notification.email}`} className="text-blue-500 hover:underline">
                                {notification.email || "Не указан"}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                                Дата:
                              </span>{" "}
                              <span>
                                {new Date(notification.createdAt).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-md border dark:border-gray-600 overflow-hidden transition-all duration-500 ease-in-out animate-accordion-down">
                              <DetailedNotificationView notification={notification} />
                            </div>
                          )}

                          {!isExpanded && (
                            <div onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(notification.id);
                            }} className="text-gray-600 dark:text-gray-400 italic text-center py-2 transition-opacity duration-300 ease-in-out hover:text-blue-500 dark:hover:text-blue-400">
                              Нажмите для просмотра подробной информации...
                            </div>
                          )}
                        </div>
                      </CardContent>

                      <div className="flex justify-between p-4">
                        <Button 
                          variant="outline" 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(notification.id);
                          }}
                          className="dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition-all duration-300 ease-in-out hover:scale-105"
                        >
                          {isExpanded ? "Свернуть" : "Подробнее"}
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          className="transition-all duration-300 ease-in-out hover:bg-red-600 hover:scale-105"
                        >
                          Удалить
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Компонент для отображения детальной информации уведомления
const DetailedNotificationView = ({ notification }: { notification: any }) => {
  const [showAllFields, setShowAllFields] = useState(false);
  
  // Обработка данных о товарах для отображения
  const renderProductData = () => {
    try {
      if (notification.itemsproduct) {
        return <ProductDetails itemsString={notification.itemsproduct} />;
      } 
      else if (notification.items) {
        try {
          let itemsData;
          
          if (typeof notification.items === 'string') {
            itemsData = JSON.parse(notification.items);
          } else {
            itemsData = notification.items;
          }
          
          if (Array.isArray(itemsData)) {
            return <ProductsFromJson items={itemsData} />;
          } else {
            return (
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md animate-fade-in">
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{JSON.stringify(itemsData, null, 2)}</pre>
              </div>
            );
          }
        } catch (e) {
          return (
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md animate-fade-in">
              <p className="whitespace-pre-wrap">{notification.items}</p>
            </div>
          );
        }
      }
      
      return <p className="text-gray-500 italic animate-fade-in">Информация о товарах отсутствует</p>;
    } catch (error) {
      console.error("Ошибка при обработке данных о товарах:", error);
      return <p className="text-red-500 animate-fade-in">Ошибка обработки данных о товарах</p>;
    }
  };
  
  return (
    <div className="space-y-4 animate-accordion-down transition-all duration-300 ease-in-out">
      {/* Адрес доставки для purchase уведомления */}
      {notification.type === 'purchase' && notification.adress && (
        <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 animate-slide-in-from-left" style={{ animationDelay: '100ms' }}>
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Адрес доставки:</h4>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{notification.adress}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Заказанные товары для purchase уведомления */}
      {notification.type === 'purchase' && (
        <div className="border-t dark:border-gray-700 pt-3 animate-slide-in-from-left" style={{ animationDelay: '200ms' }}>
          <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center mb-2">
            <ShoppingBag className="h-5 w-5 text-blue-500 mr-2" />
            Заказанные товары:
          </h4>
          <div className="mt-2 transition-all duration-500 ease-in-out">
            {renderProductData()}
          </div>
        </div>
      )}

      {/* Комментарии для обоих типов уведомлений */}
      {notification.comments && (
        <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 animate-slide-in-from-left" style={{ animationDelay: '300ms' }}>
          <div className="flex items-start gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Комментарии:</h4>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{notification.comments}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Общая стоимость для purchase уведомления */}
      {notification.type === 'purchase' && notification.totalprice && (
        <div className="border-t dark:border-gray-700 pt-3 animate-slide-in-from-left" style={{ animationDelay: '400ms' }}>
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 flex justify-between items-center">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center">
              <DollarSign className="h-5 w-5 text-green-500 mr-2" />
              Итого:
            </h4>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">{notification.totalprice} ₽</span>
          </div>
        </div>
      )}

      {/* Дополнительная информация для consultation уведомления */}
      {notification.type === 'consultation' && notification.description && (
        <div className="border-t dark:border-gray-700 pt-3 animate-slide-in-from-left" style={{ animationDelay: '500ms' }}>
          <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center mb-2">
              <Info className="h-5 w-5 text-blue-500 mr-2" />
              Дополнительная информация:
            </h4>
            <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {notification.description}
            </p>
          </div>
        </div>
      )}
      
      {/* Технические данные */}
      <div className="border-t dark:border-gray-700 pt-3">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="tech-data" className="border-none">
            <AccordionTrigger className="py-2 px-3 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
              <div className="flex items-center">
                <Info className="h-4 w-4 mr-2" />
                {showAllFields ? "Скрыть технические данные" : "Показать все поля уведомления"}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 animate-accordion-down">
              <div className="grid grid-cols-1 gap-2 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                {Object.entries(notification)
                  .filter(([key]) => !['id', 'isRead', 'createdAt', 'name', 'phone', 'email', 'adress', 'itemsproduct', 'items', 'totalprice', 'comments', 'description'].includes(key))
                  .map(([key, value]) => (
                    <div key={key} className="flex flex-col p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                      <span className="ml-2 text-sm bg-white dark:bg-gray-900 p-1 mt-1 rounded-md overflow-x-auto">
                        {typeof value === 'object' 
                          ? JSON.stringify(value, null, 2) 
                          : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
};

// Компонент для отображения товаров из строки
const ProductDetails = ({ itemsString }: { itemsString: string }) => {
  try {
    const regex = /\[Товар \d+\]([\s\S]*?)(?=\[Товар \d+\]|$)/g;
    const matches = [...itemsString.matchAll(regex)];
    
    if (matches.length === 0) {
      console.log('Исходная строка:', itemsString); // Отладочная информация
      return (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
          <p className="whitespace-pre-wrap text-sm">{itemsString}</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {matches.map((match, index) => {
          const itemText = match[1].trim();
          console.log(`Текст товара ${index + 1}:`, itemText); // Отладочная информация
          
          // Обновленные регулярные выражения с более гибким форматом
          const nameMatch = itemText.match(/(?:►|■|•)?\s*(?:Наименование|Название|Товар):\s*(.*?)(?:\n|$)/i);
          const quantityMatch = itemText.match(/(?:►|■|•)?\s*Количество:\s*(.*?)(?:\n|$)/i);
          const priceMatch = itemText.match(/(?:►|■|•)?\s*(?:Цена за шт|Цена):\s*(.*?)(?:\n|$)/i);
          const totalMatch = itemText.match(/(?:►|■|•)?\s*(?:Сумма|Итого):\s*(.*?)(?:\n|$)/i);
          const linkMatch = itemText.match(/(?:►|■|•)?\s*(?:Ссылка на товар|Ссылка):\s*(.*?)(?:\n|$)/i);
          console.log(linkMatch);
          
          return (
            <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-md animate-fade-in bg-[#1e2837] border-[#2a3547]">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value={`item-${index}`} className="border-none">
                  <div className="flex justify-between items-center px-3 py-2 border-b border-[#2a3547]">
                    <AccordionTrigger className="hover:no-underline flex-1">
                      <CardTitle className="text-base flex items-center text-white">
                        <Package className="mr-1.5 h-4 w-4 text-blue-400" />
                        Товар {index + 1}
                      </CardTitle>
                    </AccordionTrigger>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors duration-200 h-7 px-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(linkMatch[1]);
                      }}
                    >
                      <Link className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <AccordionContent className="transition-all duration-500 ease-in-out data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                    <CardContent className="bg-[#1e2837] p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {nameMatch && (
                          <div className="col-span-2 space-y-2">
                            <span className="text-gray-400 flex items-center text-base">
                              <Tag className="mr-2 h-4 w-4 text-blue-400" />
                              Наименование:
                            </span>
                            <p className="text-white font-semibold text-lg ml-6">{nameMatch[1]}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4 col-span-2">
                          {quantityMatch && (
                            <div className="space-y-2">
                              <span className="text-gray-400 flex items-center text-base">
                                <Package className="mr-2 h-4 w-4 text-blue-400" />
                                Количество:
                              </span>
                              <p className="text-white text-lg ml-6">{quantityMatch[1]}</p>
                            </div>
                          )}
                          {priceMatch && (
                            <div className="space-y-2">
                              <span className="text-gray-400 flex items-center text-base">
                                <DollarSign className="mr-2 h-4 w-4 text-blue-400" />
                                Цена:
                              </span>
                              <p className="text-white text-lg ml-6">{priceMatch[1]}</p>
                            </div>
                          )}
                        </div>
                        {totalMatch && (
                          <div className="col-span-2 pt-4 mt-2 border-t border-[#2a3547] space-y-2">
                            <span className="text-gray-400 flex items-center text-base">
                              <DollarSign className="mr-2 h-4 w-4 text-blue-400" />
                              Сумма:
                            </span>
                            <p className="text-white font-bold text-xl ml-6">{totalMatch[1]}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          );
        })}
      </div>
    );
  } catch (error) {
    console.error("Ошибка при обработке данных о товарах:", error);
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-100">
        <p className="text-red-500">Ошибка при обработке данных о товарах</p>
        <pre className="mt-2 text-xs whitespace-pre-wrap overflow-x-auto bg-white dark:bg-gray-900 p-2 rounded">
          {itemsString}
        </pre>
      </div>
    );
  }
};

// Компонент для отображения товаров из JSON
const ProductsFromJson = ({ items }: { items: any[] }) => {
  if (!items || items.length === 0) {
    return <p className="text-gray-500 italic">Товары не указаны</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Card key={index} className="overflow-hidden transition-all duration-300 hover:shadow-md animate-fade-in bg-[#1e2837] border-[#2a3547]">
          <CardHeader className="pb-2 border-b border-[#2a3547]">
            <CardTitle className="text-base flex items-center text-white">
              <Package className="mr-2 h-4 w-4 text-blue-400" />
              Товар {index + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="bg-[#1e2837]">
            <div className="grid grid-cols-2 gap-2">
              {item.id && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">ID:</span>
                  <p className="text-gray-800 dark:text-gray-200">{item.id}</p>
                </div>
              )}
              {item.quantity && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Tag className="mr-1 h-3 w-3 text-blue-400" />
                    Количество:
                  </span>
                  <p className="text-gray-800 dark:text-gray-200">{item.quantity}</p>
                </div>
              )}
              {item.price && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <DollarSign className="mr-1 h-3 w-3 text-blue-400" />
                    Цена:
                  </span>
                  <p className="text-gray-800 dark:text-gray-200">{typeof item.price === 'number' ? `${item.price} ₽` : item.price}</p>
                </div>
              )}
              {item.total && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Сумма:</span>
                  <p className="text-gray-800 dark:text-gray-200 font-bold">{typeof item.total === 'number' ? `${item.total} ₽` : item.total}</p>
                </div>
              )}
            </div>
            
            {/* Отображаем дополнительные поля товара */}
            {Object.entries(item)
              .filter(([key]) => !['id', 'name', 'quantity', 'price', 'total'].includes(key))
              .length > 0 && (
                <div className="mt-2 pt-2 border-t dark:border-gray-700">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value={`details-${index}`} className="border-none">
                      <AccordionTrigger className="py-1 text-sm">
                        Дополнительная информация
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 gap-1 text-sm">
                          {Object.entries(item)
                            .filter(([key]) => !['id', 'name', 'quantity', 'price', 'total'].includes(key))
                            .map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                                <span className="ml-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-md overflow-x-auto">
                                  {typeof value === 'object' 
                                    ? JSON.stringify(value, null, 2) 
                                    : String(value)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminNotifications;
