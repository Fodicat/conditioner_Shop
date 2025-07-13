
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { CartDropdown } from "@/components/CartDropdown";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFilters } from "@/components/shop/ProductFilters";
import { AddProductDialog } from "@/components/shop/AddProductDialog";
import { API_URL } from "@/config/appConfig";

const Shop = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    }
  });

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;
    const priceMatch =
      (!minPrice || product.price >= Number(minPrice)) &&
      (!maxPrice || product.price <= Number(maxPrice));
  
    return categoryMatch && priceMatch;
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 custom-button1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {!isMobile && "Назад"}
          </Button>
          <h1 className="text-2xl sm:text-4xl font-bold text-center animate-fade-in">
            Магазин кондиционеров
          </h1>
          <div className="flex items-center gap-2">
            <CartDropdown />
            {user?.isAdmin && (
              <Button 
                variant="outline"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 custom-button1"
              >
                <Plus className="h-4 w-4" />
                {!isMobile && "Добавить товар"}
              </Button>
            )}
          </div>
        </div>

        <ProductFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          categories={categories}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <AddProductDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        categories={categories}
      />
    </div>
  );
};

export default Shop;
