
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { API_URL } from "@/config/appConfig";

interface ProductEditFormProps {
  id: string;
  editProduct: {
    name: string;
    description: string;
    fullDescription: string;
    price: string;
    category: string;
    specs: string[];
    images: string[];
  };
  setEditProduct: (product: any) => void;
  onClose: () => void;
  product: any;
}

export const ProductEditForm = ({ 
  id, 
  editProduct, 
  setEditProduct, 
  onClose,
  product 
}: ProductEditFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const categories = [
    "Бытовые сплит-системы",
    "Мобильные кондиционеры",
    "Мульти сплит-системы",
    "Полупромышленные сплит-системы",
    "Системы фанкойл-чиллер",
    "Прецизионные кондиционеры",
    "Комплектующие и расходные материалы",
    "Системы для прокладки трасс"
  ];

  const handleSpecChange = (index: number, value: string) => {
    const newSpecs = [...editProduct.specs];
    newSpecs[index] = value;
    setEditProduct((prev: any) => ({
      ...prev,
      specs: newSpecs
    }));
  };

  const handleAddSpec = () => {
    setEditProduct((prev: any) => ({
      ...prev,
      specs: [...prev.specs, '']
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('index', String(index));
  
      try {
        const response = await fetch(`${API_URL}/api/products/${id}/image`, {
          method: 'PUT',
          body: formData, // Используем FormData
        });
  
        if (!response.ok) {
          throw new Error('Failed to update image');
        }
  
        const data = await response.json();
        queryClient.invalidateQueries({ queryKey: ['product', id] });
        toast({
          title: "Успешно",
          description: "Изображение обновлено",
        });
      } catch (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить изображение",
          variant: "destructive",
        });
      }
    }
  };
  

  const updateProductMutation = useMutation({
    mutationFn: async (productData: typeof editProduct) => {
      const response = await fetch(`${API_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productData,
          price: parseFloat(productData.price),
          images: productData.images,
        }),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      toast({
        title: "Успешно",
        description: "Товар успешно обновлен",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить товар",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProductMutation.mutate(editProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Редактировать товар</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Input
            placeholder="Название продукта"
            value={editProduct.name}
            onChange={(e) => setEditProduct((prev: any) => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            placeholder="Краткое описание"
            value={editProduct.description}
            onChange={(e) => setEditProduct((prev: any) => ({ ...prev, description: e.target.value }))}
            required
          />
          <Input
            type="number"
            placeholder="Цена"
            value={editProduct.price}
            onChange={(e) => setEditProduct((prev: any) => ({ ...prev, price: e.target.value }))}
            required
          />
          <Select
            value={editProduct.category}
            onValueChange={(value) => setEditProduct((prev: any) => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Textarea
            placeholder="Полное описание"
            value={editProduct.fullDescription}
            onChange={(e) => setEditProduct((prev: any) => ({ ...prev, fullDescription: e.target.value }))}
            required
            className="h-[120px]"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Характеристики:</label>
            <div className="max-h-[150px] overflow-y-auto space-y-2">
              {editProduct.specs.map((spec: string, index: number) => (
                <Input
                  key={index}
                  placeholder={`Характеристика ${index + 1}`}
                  value={spec}
                  onChange={(e) => handleSpecChange(index, e.target.value)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSpec}
              className="w-full"
            >
              Добавить характеристику
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Изображения товара:</label>
        <div className="grid grid-cols-2 gap-4">
          {product.image.map((_: string, index: number) => (
            <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
              <img
                src={`${API_URL}${product.image[index]}`}
                alt={`Image ${index + 1}`}
                className="w-16 h-16 object-cover rounded"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, index)}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Сохранить изменения
      </Button>
    </form>
  );
};
