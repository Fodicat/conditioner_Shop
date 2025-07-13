import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { API_URL } from "@/config/appConfig";

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
}

export const AddProductDialog = ({ isOpen, onClose, categories }: AddProductDialogProps) => {
  const queryClient = useQueryClient();
  
  // 🟢 Теперь `image` хранит массив `File[]`
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    description: '',
    fullDescription: '',
    price: '',
    category: '',
    specs: [''],
    image: [] as File[],
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: typeof newProduct) => {
      const formData = new FormData();
      
      formData.append('name', productData.name);
      formData.append('description', productData.description);
      formData.append('fullDescription', productData.fullDescription);
      formData.append('price', productData.price);
      formData.append('category', productData.category);
      productData.specs.forEach((spec, index) => {
        formData.append(`specs[${index}]`, spec);
      });

      // 🟢 Добавляем файлы в `FormData`
      productData.image.forEach((file) => {
        formData.append('image', file);
      });

      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        body: formData, // Браузер сам установит `multipart/form-data`
      });

      if (!response.ok) throw new Error('Failed to add product');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Продукт успешно добавлен');
      setNewProduct({
        name: '',
        description: '',
        fullDescription: '',
        price: '',
        category: '',
        specs: [''],
        image: []
      });
      onClose();
    },
    onError: () => {
      toast.error('Ошибка при добавлении продукта');
    }
  });

  // 🟢 Добавление характеристики
  const handleAddSpec = () => {
    setNewProduct(prev => ({
      ...prev,
      specs: [...prev.specs, '']
    }));
  };

  // 🟢 Обновление характеристики
  const handleSpecChange = (index: number, value: string) => {
    const newSpecs = [...newProduct.specs];
    newSpecs[index] = value;
    setNewProduct(prev => ({
      ...prev,
      specs: newSpecs
    }));
  };

  // 🟢 Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProductMutation.mutate(newProduct);
  };

  // 🟢 Обработчик загрузки файлов (сохраняем `File[]`)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      
      if (files.length > 3) {
        alert("Вы можете загрузить не более 3 изображений.");
        return;
      }

      setNewProduct(prev => ({
        ...prev,
        image: [...prev.image, ...files], // Сохраняем файлы в `File[]`
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить новый товар</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Название продукта"
            value={newProduct.name}
            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <Input
            placeholder="Краткое описание"
            value={newProduct.description}
            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
            required
          />
          <Textarea
            placeholder="Полное описание"
            value={newProduct.fullDescription}
            onChange={(e) => setNewProduct(prev => ({ ...prev, fullDescription: e.target.value }))}
            required
          />
          <Input
            type="number"
            placeholder="Цена"
            value={newProduct.price}
            onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
            required
          />
          <Select
            value={newProduct.category}
            onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Характеристики:</label>
            {newProduct.specs.map((spec, index) => (
              <Input
                key={index}
                placeholder={`Характеристика ${index + 1}`}
                value={spec}
                onChange={(e) => handleSpecChange(index, e.target.value)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddSpec}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить характеристику
            </Button>
          </div>

          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />

          {/* 🟢 Отображение загруженных изображений */}
          <div className="mt-4">
            {newProduct.image.length > 0 && (
              <div className="flex gap-2">
                {newProduct.image.map((file, index) => (
                  <div key={index} className="w-20 h-20 overflow-hidden rounded-md">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Uploaded image ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Добавить продукт
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
