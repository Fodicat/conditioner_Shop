import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Check, Package, Archive, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URL } from "@/config/appConfig";

interface Product {
  id: number;
  name: string;
  price: number;
  discount: number;
  selected: boolean;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
}

interface Order {
  id: number;
  user_id: number;
  total_price: number;
  status: string;
  shipping_address: string;
  contact_phone: string;
  comments?: string;
  created_at: string;
  items: OrderItem[];
  userName?: string;
}

interface OrderStats {
  completed: number;
  cancelled: number;
  totalOrders: number;
  totalRevenue: number;
}

const AdminPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputDiscount, setInputDiscount] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [discountTarget, setDiscountTarget] = useState<'all' | 'selected'>('all');
  const [pricelistDiscount, setPricelistDiscount] = useState('');
  const [activeTab, setActiveTab] = useState("discounts");
  const [orderStats, setOrderStats] = useState<OrderStats>({
    completed: 0,
    cancelled: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  
  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setProducts(data));
    
    if (activeTab === "orders" || activeTab === "history") {
      fetchOrders();
      if (activeTab === "history") {
        fetchCompletedOrders();
      }
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders/all`);
      if (response.ok) {
        const data = await response.json();
        
        const activeOrders = data.filter((order: Order) => 
          !['completed', 'cancelled'].includes(order.status)
        );
        
        setOrders(activeOrders);
        
        const stats: OrderStats = {
          completed: data.filter((order: Order) => order.status === 'completed').length,
          cancelled: data.filter((order: Order) => order.status === 'cancelled').length,
          totalOrders: data.length,
          totalRevenue: data
            .filter((order: Order) => order.status === 'completed')
            .reduce((sum: number, order: Order) => sum + Number(order.total_price), 0)
        };
        
        setOrderStats(stats);
      } else {
        toast({
          title: "Ошибка",
          description: "Ошибка при загрузке заказов",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Ошибка",
        description: "Ошибка при загрузке заказов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders/all`);
      if (response.ok) {
        const data = await response.json();
        
        const finishedOrders = data.filter((order: Order) => 
          ['completed', 'cancelled'].includes(order.status)
        );
        
        setCompletedOrders(finishedOrders);
      } else {
        toast({
          title: "Ошибка",
          description: "Ошибка при загрузке завершенных заказов",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching completed orders:", error);
      toast({
        title: "Ошибка",
        description: "Ошибка при загрузке завершенных заказов",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      setLoading(true);
      console.log(`Attempting to update order ${orderId} to status: ${newStatus}`);
      
      if (newStatus === 'completed') {
        console.log("This is a completion request from the Завершить button");
      }
      
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const responseText = await response.text();
      console.log("Server response:", responseText);
      
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }

      if (response.ok) {
        toast({
          title: "Успех",
          description: "Статус заказа успешно обновлен",
        });
        
        if (newStatus === 'completed' || newStatus === 'cancelled') {
          setOrders(prevOrders => 
            prevOrders.filter(order => order.id !== orderId)
          );
          
          if (activeTab === "history") {
            fetchCompletedOrders();
          } else {
            const completedResponse = await fetch(`${API_URL}/api/orders/all`);
            if (completedResponse.ok) {
              const allOrders = await completedResponse.json();
              const finishedOrders = allOrders.filter((order: Order) => 
                ['completed', 'cancelled'].includes(order.status)
              );
              setCompletedOrders(finishedOrders);
            }
          }
        } else {
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId ? { ...order, status: newStatus } : order
            )
          );
        }
        
        fetchOrders();
      } else {
        toast({
          title: "Ошибка",
          description: `Ошибка при обновлении статуса заказа: ${errorData.message || 'Неизвестная ошибка'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Ошибка",
        description: "Ошибка при обновлении статуса заказа",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputDiscount(event.target.value);
  };

  const handleChangePricelist = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPricelistDiscount(event.target.value);
  };

  const updateDiscount = (id: number, discount: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, discount: parseFloat(discount.toFixed(2)) } : p))
    );
  };

  const toggleSelect = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const applyDiscount = async () => {
    const updatedProducts = products.map((p) => ({
        id: p.id,
        discount: p.discount,
    }));

    console.log("Updated Products:", updatedProducts);

    try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/update-discounts`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: updatedProducts }),
        });

        if (response.ok) {
            toast({
                title: "Успех",
                description: "Скидки успешно обновлены",
            });
        } else {
            toast({
                title: "Ошибка",
                description: "Ошибка при обновлении скидок",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error("Ошибка при отправке данных:", error);
        toast({
            title: "Ошибка",
            description: "Ошибка при отправке данных",
            variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  };

  const updatePriceListDiscount = async () => {
    const numericDiscount = parseInt(pricelistDiscount);
    const response = await fetch(`${API_URL}/api/update-discount-Pricelist`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Discount: numericDiscount }),
    });

    if (response.ok) {
      toast({
        title: "Успех",
        description: `Скидка ${numericDiscount}% успешно применена`,
      });
    } else {
      toast({
        title: "Ошибка",
        description: "Ошибка при обновлении скидок",
        variant: "destructive",
      });
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" } } = {
      processing: { label: "В обработке", variant: "secondary" },
      shipped: { label: "Отправлен", variant: "default" },
      delivered: { label: "Доставлен", variant: "success" },
      cancelled: { label: "Отменен", variant: "destructive" },
      completed: { label: "Завершен", variant: "outline" },
    };

    const statusInfo = statusMap[status] || { label: status, variant: "default" };
    
    return (
      <Badge variant={statusInfo.variant as any}>{statusInfo.label}</Badge>
    );
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrderDetails(order);
    setShowOrderDetails(true);
  };

  const addNewOrder = async (newOrder: Order) => {
    try {
        const response = await fetch(`${API_URL}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newOrder),
        });

        if (response.ok) {
            toast({
                title: "Успех",
                description: "Заказ успешно добавлен",
            });
            // Обновляем заказы после добавления нового
            fetchOrders();
        } else {
            toast({
                title: "Ошибка",
                description: "Ошибка при добавлении заказа",
                variant: "destructive",
            });
        }
    } catch (error) {
        console.error("Ошибка при добавлении заказа:", error);
        toast({
            title: "Ошибка",
            description: "Ошибка при добавлении заказа",
            variant: "destructive",
        });
    }
  };

  const handleDiscountChange = (id, value) => {
    const discountValue = parseFloat(value);
    setProducts((prev) =>
        prev.map((product) =>
            product.id === id ? { ...product, discount: isNaN(discountValue) ? 0 : discountValue } : product
        )
    );
  };

  const applyDiscountToAll = async () => {
    const discountValue = parseFloat(inputDiscount);

    // Проверка на корректность числа
    if (isNaN(discountValue)) {
        alert("Введите корректное число для применения ко всем товарам");
        return;
    }

    const updatedProducts = products.map((product) => {
        if (product.selected) {
            return { ...product, discount: discountValue }; // Применяем скидку только к выбранным
        }
        return product; // Возвращаем товар без изменений
    });

    console.log("Updated Products:", updatedProducts); // Логируем обновленные продукты

    try {
        const response = await fetch(`${API_URL}/api/update-discounts`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: updatedProducts }),
        });

        if (!response.ok) {
            throw new Error("Ошибка при обновлении скидок");
        }

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка при обновлении скидок");
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <BarChart className="h-4 w-4" />
        <span className="hidden sm:inline">Админ панель</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[800px] p-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Панель администратора</DialogTitle>
            <DialogDescription>
              Управление заказами, скидками и аналитика
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="discounts">Управление скидками</TabsTrigger>
              <TabsTrigger value="orders">Активные заказы</TabsTrigger>
              <TabsTrigger value="history">История заказов</TabsTrigger>
            </TabsList>
            
            <TabsContent value="discounts" className="mt-0">
              <div className="flex flex-col sm:flex-row gap-4 overflow-hidden">
                <Card className="w-full sm:max-w-[350px]">
                  <CardContent className="p-3 space-y-2">
                    <h3 className="text-lg font-semibold">Управление скидками</h3>
                    <Input
                      type="number"
                      step="0.01"
                      value={inputDiscount}
                      onChange={handleChange}
                      className="w-full"
                      placeholder="Введите процент скидки..."
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        className={`flex-1 ${discountTarget === 'all' ? 'bg-blue-500 text-white' : ''}`}
                        onClick={() => setDiscountTarget('all')}
                      >
                        Всем товарам
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex-1 ${discountTarget === 'selected' ? 'bg-blue-500 text-white' : ''}`}
                        onClick={() => setDiscountTarget('selected')}
                      >
                        Выбранным
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={applyDiscountToAll}
                      disabled={loading}
                    >
                      Применить скидки ко всем товарам
                    </Button>
                  </CardContent>
                </Card>

                <Card className="w-full sm:max-w-[350px]">
                  <CardContent className="p-3 space-y-2">
                    <h3 className="text-lg font-semibold">Дополнительные настройки скидок</h3>
                    <Input
                      type="number"
                      step="0.01"
                      value={pricelistDiscount}
                      onChange={handleChangePricelist}
                      className="w-full"
                      placeholder="Введите процент скидки..."
                    />
                    <Button
                      variant="outline"
                      className="w-full mt-2"
                      onClick={updatePriceListDiscount}
                      disabled={loading}
                    >
                      Применить скидку
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-lg font-semibold mt-4">Товары</h3>
              <div className="space-y-4">
                {products.map((p) => {
                  const discountedPrice = p.price - (p.price * (p.discount / 100));
                  return (
                    <Card key={p.id} className="p-2">
                      <CardContent className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={`w-6 h-6 flex items-center justify-center border-2 rounded-md cursor-pointer transition-all 
                            ${p.selected ? "bg-blue-500 border-blue-500" : "border-gray-400 hover:border-blue-400"}`}
                            onClick={() => toggleSelect(p.id)}
                          >
                            {p.selected && <Check className="text-white w-4 h-4" />}
                          </div>

                          <div className="flex-1 flex items-center">
                            <span className="text-sm">{p.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm line-through text-gray-500">{p.price}₽</span>
                            <span className="text-sm text-green-500 font-semibold">{discountedPrice.toFixed(2)}₽</span>
                          </div>

                          <Input
                            type="number"
                            step="0.01"
                            value={p.discount}
                            onChange={(e) => handleDiscountChange(p.id, e.target.value)}
                            className="w-16 h-8 text-sm text-center"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={applyDiscount}
                disabled={loading}
              >
                Применить скидки
              </Button>
            </TabsContent>
            
            <TabsContent value="orders" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Управление заказами</h3>
                <Button onClick={fetchOrders} variant="outline" size="sm" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Обновить
                </Button>
              </div>
              
              {loading && <p className="text-center py-4">Загрузка заказов...</p>}
              
              {!loading && orders.length === 0 && (
                <p className="text-center py-4 text-muted-foreground">Заказы не найдены</p>
              )}
              
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="w-full">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold">Заказ #{order.id}</h4>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.created_at && format(new Date(order.created_at), "dd.MM.yyyy, HH:mm")}
                          </p>
                          {order.userName && (
                            <p className="text-sm"><span className="font-medium">Пользователь:</span> {order.userName}</p>
                          )}
                        </div>
                        
                        <div className="mt-2 md:mt-0 flex items-center gap-2">
                          <Select 
                            defaultValue={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Изменить статус" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="processing">В обработке</SelectItem>
                              <SelectItem value="shipped">Отправлен</SelectItem>
                              <SelectItem value="delivered">Доставлен</SelectItem>
                              <SelectItem value="cancelled">Отменен</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            onClick={() => {
                              console.log("Завершить button clicked for order:", order.id);
                              updateOrderStatus(order.id, 'completed');
                            }}
                            variant="outline"
                            className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                            type="button"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Завершить
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium">Товары</h5>
                        <div className="divide-y">
                          {order.items && order.items.map((item) => (
                            <div key={item.id} className="py-2 flex justify-between">
                              <div>
                                <div>{item.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.quantity} × {item.price.toLocaleString()} ₽
                                </div>
                              </div>
                              <div className="font-medium">
                                {(item.price * item.quantity).toLocaleString()} ₽
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex justify-between pt-4 border-t mt-4">
                        <span className="font-medium">Итого:</span>
                        <span className="font-bold">{order.total_price.toLocaleString()} ₽</span>
                      </div>

                      <div className="space-y-2 pt-4 border-t mt-4">
                        <h5 className="font-medium">Информация о доставке</h5>
                        <div className="space-y-1 text-sm">
                          <div><strong>Адрес:</strong> {order.shipping_address}</div>
                          <div><strong>Телефон:</strong> {order.contact_phone}</div>
                          {order.comments && (
                            <div><strong>Комментарий:</strong> {order.comments}</div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">История заказов</h3>
                <Button onClick={fetchCompletedOrders} variant="outline" size="sm" className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Обновить
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-3 rounded-full mr-3">
                        <Check className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Выполненные заказы</div>
                        <div className="text-2xl font-bold">{orderStats.completed}</div>
                      </div>
                    </div>
                    <div className="text-green-500 font-medium">
                      {orderStats.totalOrders > 0 
                        ? `${((orderStats.completed / orderStats.totalOrders) * 100).toFixed(1)}%` 
                        : '0%'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-red-100 p-3 rounded-full mr-3">
                        <Clock className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Отмененные заказы</div>
                        <div className="text-2xl font-bold">{orderStats.cancelled}</div>
                      </div>
                    </div>
                    <div className="text-red-500 font-medium">
                      {orderStats.totalOrders > 0 
                        ? `${((orderStats.cancelled / orderStats.totalOrders) * 100).toFixed(1)}%` 
                        : '0%'}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="mb-4">
                    <h4 className="text-lg font-medium">Общая выручка с выполненных заказов</h4>
                    <div className="text-3xl font-bold mt-2">
                      {Math.round(orderStats.totalRevenue).toLocaleString()} ₽
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {loading && <p className="text-center py-4">Загрузка истории заказов...</p>}
              
              {!loading && completedOrders.length === 0 && (
                <p className="text-center py-4 mt-4 text-muted-foreground">История заказов пуста</p>
              )}
              
              {!loading && completedOrders.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-4">Завершенные заказы</h4>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>№ Заказа</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Сумма</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.id}</TableCell>
                          <TableCell>{order.created_at && format(new Date(order.created_at), "dd.MM.yyyy")}</TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{order.total_price.toLocaleString()} ₽</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8"
                              onClick={() => viewOrderDetails(order)}
                            >
                              Подробнее
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Заказ #{selectedOrderDetails?.id} - {selectedOrderDetails && getStatusBadge(selectedOrderDetails.status)}
            </DialogTitle>
            <DialogDescription>
              Подробная информация о заказе
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrderDetails && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Дата заказа:</span>
                <span>{selectedOrderDetails.created_at && format(new Date(selectedOrderDetails.created_at), "dd.MM.yyyy, HH:mm")}</span>
              </div>
              
              {selectedOrderDetails.userName && (
                <div className="flex justify-between">
                  <span className="font-medium">Пользователь:</span>
                  <span>{selectedOrderDetails.userName}</span>
                </div>
              )}
              
              <div className="space-y-2 border-t pt-4">
                <h3 className="font-semibold">Товары</h3>
                <div className="divide-y">
                  {selectedOrderDetails.items.map((item) => (
                    <div key={item.id} className="py-2 flex justify-between">
                      <div>
                        <div>{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.quantity} × {item.price.toLocaleString()} ₽
                        </div>
                      </div>
                      <div className="font-medium">
                        {(item.price * item.quantity).toLocaleString()} ₽
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between py-4 border-t border-b font-bold">
                <span>Итого:</span>
                <span>{selectedOrderDetails.total_price.toLocaleString()} ₽</span>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Информация о доставке</h3>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Адрес:</span>
                    <span className="text-sm">{selectedOrderDetails.shipping_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Телефон:</span>
                    <span className="text-sm">{selectedOrderDetails.contact_phone}</span>
                  </div>
                  {selectedOrderDetails.comments && (
                    <div>
                      <div className="text-sm font-medium">Комментарий:</div>
                      <div className="text-sm mt-1 bg-muted p-2 rounded">{selectedOrderDetails.comments}</div>
                    </div>
                  )}
                </div>
              </div>

              <Button 
                className="w-full" 
                variant="outline" 
                onClick={() => setShowOrderDetails(false)}
              >
                Закрыть
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPanel;
