
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderHistory } from "@/components/profile/OrderHistory";
import { ConsultationHistory } from "@/components/profile/ConsultationHistory";
import AccountSettings from "@/components/AccountSettings";

const UserProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Требуется авторизация</h1>
          <p className="mb-4">Для доступа к профилю необходимо войти в аккаунт</p>
          <Button onClick={() => navigate("/")}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 p-4 md:p-8">
      <Button
        variant="outline"
        className="absolute top-4 left-4 custom-button1 hidden lg:flex"
        onClick={() => navigate("/")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Назад
      </Button>

      <div className="container mx-auto max-w-6xl pt-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Профиль пользователя</h1>
        
        <div className="bg-card rounded-lg shadow-md p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-semibold text-primary">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.name || "Пользователь"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {user.isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate("/admin")}
              >
                Панель администратора
              </Button>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="account">Настройки аккаунта</TabsTrigger>
              <TabsTrigger value="orders">История заказов</TabsTrigger>
              <TabsTrigger value="consultations">Заявки на консультацию</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-4">
              <div className="max-w-2xl mx-auto">
                <AccountSettings />
              </div>
            </TabsContent>
            
            <TabsContent value="orders" className="space-y-4">
              <OrderHistory />
            </TabsContent>
            
            <TabsContent value="consultations" className="space-y-4">
              <ConsultationHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
