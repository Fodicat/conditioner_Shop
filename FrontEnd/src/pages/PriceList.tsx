
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import "@/additionally.css";
import { API_URL } from "@/config/appConfig";

const PriceList = () => {
  const navigate = useNavigate();

  const [priceconditioners, setPriceconditioners] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [viewMode, setViewMode] = useState("basic"); // "basic" or "full"

  useEffect(() => {
    const GetPrice = async () => {
      try {
        const response = await fetch(`${API_URL}/api/price`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        console.log(data)
        setDiscount(data[0].Discount);

        data.splice(0, 1);

        console.log(data)
        setPriceconditioners(data);
      } catch (error) {
        console.log("Ошибка", error);
      }
    };

    GetPrice();
  }, []);

  function updatePrices(data, percentage) {
    if (isNaN(percentage) || percentage < 0) {
      console.error("Введите корректное число!");
      return data;
    }

    return data.map(category => ({
      ...category,
      items: category.items.map(item => ({
        ...item,
        oldPrice: item.price,
        price: Math.round(item.price * (1 - percentage / 100))
      }))
    }));
  }

  // Categories to show in the basic view
  const basicCategories = [
    "Монтаж кондиционеров настенного типа",
    "Монтаж мульти сплит-систем до 9 кВт c настенными внутренними блоками",
    "Дополнительные работы (отдельно, без материалов, стоимость установки коробов, прокладки кабеля и т.п. рассчитывается как 50% от стоимости в прайс листе)",
    "Стоимость услуг сервисного обслуживания систем кондиционирования"
  ];

  // Filter categories for basic view
  const getFilteredCategories = () => {
    if (viewMode === "full") {
      return priceconditioners;
    } else {
      return priceconditioners.filter(category => 
        basicCategories.includes(category.category)
      );
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          className="absolute top-4 left-4 custom-button1 hidden lg:flex"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>

        <div className="bg-card rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-foreground mb-4 text-center animate-fade-in">
            Прайс-лист на услуги
          </h1>

          <div className="flex justify-center mb-6">
            <Tabs defaultValue="basic" className="w-full" onValueChange={setViewMode} value={viewMode}>
            <TabsList className="flex justify-center mx-auto mb-6" style={{ width: '19.5rem' }}>
                <TabsTrigger value="basic" className={cn(
                  "py-2 text-sm font-medium transition-all",
                  viewMode === "basic" ? "bg-primary text-primary-foreground" : ""
                )}>
                  Основные услуги
                </TabsTrigger>
                <TabsTrigger value="full" className={cn(
                  "py-2 text-sm font-medium transition-all",
                  viewMode === "full" ? "bg-primary text-primary-foreground" : ""
                )}>
                  Полный прайс-лист
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="mt-2 animate-fade-in">
                <p className="text-center text-muted-foreground mb-4">
                  Наиболее популярные услуги для частных клиентов
                </p>
                {renderPriceList(getFilteredCategories(), discount)}
              </TabsContent>
              
              <TabsContent value="full" className="mt-2 animate-fade-in">
                <p className="text-center text-muted-foreground mb-4">
                  Полный перечень услуг, включая специализированные работы
                </p>
                {renderPriceList(getFilteredCategories(), discount)}
              </TabsContent>
            </Tabs>
          </div>

          <p className="text-sm text-muted-foreground mt-6 text-left animate-fade-in enforce-left" style={{ animationDelay: '0.8s' }}>
            * Цены указаны приблизительно и могут варьироваться в зависимости от сложности работ
          </p>
        </div>
      </div>
    </div>
  );

  function renderPriceList(categories, discount) {
    return (
      <Accordion type="single" collapsible className="w-full">
        {categories.length > 0 && (discount !== 0 ? updatePrices(categories, discount) : categories).map((category, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`} 
            className="animate-fade-in"
          >
            <AccordionTrigger className="text-lg font-semibold text-foreground text-left">
              {category.category}
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70%] text-foreground text-left">Услуга</TableHead>
                    <TableHead className="text-right text-foreground">Стоимость (₽)</TableHead>
                    {discount !== 0 && (
                      <TableHead className="text-right text-foreground">Старая цена (₽)</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.items.map((item, itemIndex) => (
                    <TableRow key={itemIndex} className="animate-fade-in">
                      <TableCell className="font-medium text-foreground text-left">{item.service}</TableCell>
                      <TableCell className="text-right text-foreground">
                        {item.price.toLocaleString()} ₽
                      </TableCell>
                      {discount !== 0 && (
                        <TableCell className="text-right text-foreground">
                          {item.oldPrice} ₽
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Добавляем сноску */}
              {category.note && (
                <p className="text-sm text-muted-foreground mt-4">
                  {category.note.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }
};

export default PriceList;
