
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { API_URL } from "@/config/appConfig";

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
}

export const OrderHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancelOrderId, setCancelOrderId] = useState<number | null>(null);

  const { data: orders, isLoading, isError } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user || !user.id) return [];
      
      const response = await fetch(`${API_URL}/api/orders/user/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
    enabled: !!user?.id
  });

  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel order');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast.success("Заказ успешно отменен");
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
    onError: () => {
      toast.error("Не удалось отменить заказ");
    },
  });

  const handleCancelOrder = (orderId: number) => {
    setCancelOrderId(orderId);
  };

  const confirmCancelOrder = () => {
    if (cancelOrderId) {
      cancelOrderMutation.mutate(cancelOrderId);
      setCancelOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="text-center text-red-500">Произошла ошибка при загрузке истории заказов</div>;
  }

  if (!orders || orders.length === 0) {
    return <div className="text-center text-gray-500">У вас пока нет заказов</div>;
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

  const canCancelOrder = (status: string) => {
    // Allow cancellation only for processing and shipped orders
    return ['processing', 'shipped'].includes(status);
  };

  return (
    <>
      <div className="space-y-6">
        {orders.map((order: Order) => (
          <Card key={order.id} className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Заказ #{order.id}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {order.created_at && format(new Date(order.created_at), "dd.MM.yyyy, HH:mm")}
                </div>
              </div>
              {getStatusBadge(order.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Товары</h4>
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
                
                <div className="flex justify-between pt-4 border-t">
                  <span className="font-medium">Итого:</span>
                  <span className="font-bold">{order.total_price.toLocaleString()} ₽</span>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <h4 className="font-medium">Информация о доставке</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Адрес:</strong> {order.shipping_address}</div>
                    <div><strong>Телефон:</strong> {order.contact_phone}</div>
                    {order.comments && (
                      <div><strong>Комментарий:</strong> {order.comments}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            {canCancelOrder(order.status) && (
              <CardFooter className="flex justify-end pt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => handleCancelOrder(order.id)} 
                  size="sm"
                >
                  Отменить заказ
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <AlertDialog open={cancelOrderId !== null} onOpenChange={(open) => !open && setCancelOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь отменить заказ. Это действие нельзя будет отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelOrder} className="bg-red-500 hover:bg-red-600">
              Да, отменить заказ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
