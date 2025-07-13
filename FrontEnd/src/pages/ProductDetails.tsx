
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProductImageCarousel } from "@/components/product/ProductImageCarousel";
import { ProductEditForm } from "@/components/product/ProductEditForm";
import { useCart } from "@/contexts/CartContext";
import { API_URL } from "@/config/appConfig";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { addItem } = useCart();

  const [editProduct, setEditProduct] = useState({
    name: '',
    description: '',
    fullDescription: '',
    price: '',
    category: '',
    specs: [],
    images: [] as string[]
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const data = await response.json();

      console.log("Fetched product data:", data);

      // Правильная обработка спецификаций
      let specs = [];
      if (data.specs) {
        if (typeof data.specs === 'string') {
          try {
            specs = JSON.parse(data.specs);
          } catch (e) {
            console.error("Error parsing specs:", e);
            specs = data.specs.split(',').map((spec: string) => spec.trim());
          }
        } else if (Array.isArray(data.specs)) {
          specs = data.specs;
        }
      }

      // Правильная обработка изображений
      let images = [];
      if (data.images) {
        if (typeof data.images === 'string') {
          try {
            images = JSON.parse(data.images);
          } catch (e) {
            console.error("Error parsing images:", e);
            images = [data.images]; // Если не удалось распарсить, добавляем как одиночное изображение
          }
        } else if (Array.isArray(data.images)) {
          images = data.images;
        }
      } else if (data.image) {
        // Обработка поля image для обратной совместимости
        if (typeof data.image === 'string') {
          try {
            images = JSON.parse(data.image);
            if (!Array.isArray(images)) {
              images = [data.image];
            }
          } catch (e) {
            images = [data.image];
          }
        } else if (Array.isArray(data.image)) {
          images = data.image;
        }
      }

      console.log('Parsed specs:', specs);
      console.log('Parsed images:', images);

      // Обновляем данные для формы редактирования
      setEditProduct({
        name: data.name || '',
        description: data.description || '',
        fullDescription: data.fullDescription || '',
        price: data.price ? data.price.toString() : '0',
        category: data.category || '',
        specs: specs,
        images: images,
      });

      // Возвращаем обработанные данные
      return {
        ...data,
        specs: specs,
        images: images
      };
    }
  });

  const handleAddToCart = () => {
    if (product) {
      const productImage = Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : Array.isArray(product.image) && product.image.length > 0
          ? product.image[0]
          : product.image || '/placeholder.jpg';
          
      addItem({
        id: product.id,
        name: product.name,
        price: calculateDiscountPrice(product.price, product.discount),
        image: productImage
      });
      
      toast({
        title: "Товар добавлен в корзину",
        description: `${product.name} успешно добавлен в корзину`,
      });
    }
  };

  function calculateDiscountPrice(price: number, percentage: number) {
    if (isNaN(percentage) || percentage < 0) {
      console.error("Введите корректное число!");
      return price;
    }
    return Math.round(price * (1 - percentage / 100));
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl animate-pulse">
          <CardHeader>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6 flex items-center justify-center">
        <Card className="w-full max-w-2xl animate-fade-in">
          <CardHeader>
            <CardTitle>Товар не найден</CardTitle>
            <CardDescription>
              К сожалению, запрашиваемый товар не существует.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Вернуться назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Получаем изображения для карусели
  const carouselImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : Array.isArray(product.image) && product.image.length > 0
      ? product.image
      : [product.image || '/placeholder.jpg'];

  // Получаем спецификации для отображения
  const specsToRender = Array.isArray(product.specs) ? product.specs : [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto max-w-6xl">
        <Button 
          variant="outline" 
          className="absolute top-4 left-4 custom-button1 hidden lg:flex"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {!isMobile && "Назад"}
        </Button>

        <Card className="animate-fade-in">
          <CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProductImageCarousel images={carouselImages} productName={product.name} />

              <div className="space-y-4">
                <CardTitle className="text-2xl sm:text-3xl">{product.name}</CardTitle>
                <CardDescription className="text-base sm:text-lg">
                  {product.fullDescription}
                </CardDescription>
                <p className="text-lg font-semibold text-gray-500">
                  Категория: {product.category}
                </p>
                <div className="flex flex-col gap-4">
                  {product.discount > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500 line-through">{product.price} ₽</span>
                      <span className="text-sm text-red-500 font-bold">-{product.discount}%</span>
                    </div>
                  )}
                  <p className="text-xl sm:text-2xl font-bold">{calculateDiscountPrice(product.price, product.discount)} ₽</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    className="w-full sm:w-auto custom-button1" 
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    В корзину
                  </Button>
                    {user?.isAdmin && (
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto custom-button1"
                        onClick={() => setIsEditOpen(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Редактировать
                      </Button>
                    )}
                  </div>
                </div>
              </div>
          
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="text-xl font-semibold">Характеристики</h4>
              {specsToRender.length > 0 ? (
                <ul className="list-disc pl-6 space-y-2">
                  {specsToRender.map((spec: string, index: number) => (
                    <li key={index} className="text-muted-foreground">{spec}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic">Характеристики не указаны</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <ProductEditForm
              id={id || ''}
              editProduct={editProduct}
              setEditProduct={setEditProduct}
              onClose={() => setIsEditOpen(false)}
              product={product}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProductDetails;
