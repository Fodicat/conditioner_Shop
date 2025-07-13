
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/config/appConfig";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string | string[];
  discount: number;
}

interface ProductCardProps {
  product: Product;
}

const fetchProduct = async (id: number) => {
  const response = await fetch(`${API_URL}/api/products/${id}`);
  if (!response.ok) {
    throw new Error("Ошибка при получении данных о продукте");
  }
  return response.json();
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ["product", product.id],
    queryFn: () => fetchProduct(product.id),
    initialData: product,
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Ошибка при удалении продукта");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Продукт успешно удален");
    },
    onError: () => {
      toast.error("Ошибка при удалении продукта");
    },
  });

  if (isLoading) return <p>Загрузка...</p>;
  if (isError) {
    toast.error("Не удалось загрузить продукт");
    return <p>Ошибка загрузки</p>;
  }

  // Декодируем изображение
  const images =
    typeof productData.image === "string"
      ? JSON.parse(productData.image)
      : productData.image;
  const imageUrl = Array.isArray(images) ? images[0] : "/placeholder.jpg";

  function calculateDiscountPrice(price: number, percentage: number) {
    if (isNaN(percentage) || percentage < 0) {
      return price;
    }
    return Math.round(price * (1 - percentage / 100));
  }

  return (
    <Card className="animate-scale-in">
      <CardHeader className="space-y-2">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img
            src={`${API_URL}${imageUrl}`}
            alt={productData.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardTitle className="text-xl sm:text-2xl line-clamp-2">
          {productData.name}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {productData.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex gap-2 w-full">
            <Button
              className="w-full sm:w-auto custom-button1"
              onClick={() => navigate(`/shop/${productData.id}`)}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Подробнее
            </Button>
            {user?.isAdmin && (
              <>
                <Button
                  className="custom-button1"
                  variant="outline"
                  onClick={() => navigate(`/shop/${productData.id}`)}
                >
                  Редактировать
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteProductMutation.mutate(productData.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex flex-col items-start">
            {productData.discount > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-500 line-through">
                  {productData.price} ₽
                </span>
                <span className="text-sm text-red-500 font-bold">
                  -{productData.discount}%
                </span>
              </div>
            )}
            <span className="text-lg sm:text-xl font-bold">
              {calculateDiscountPrice(productData.price, productData.discount)} ₽
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
