
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config/appConfig";

const AccountVerification = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Получаем токен из URL параметров
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get("token");
        
        if (!token) {
          setStatus("error");
          toast({
            title: "Ошибка проверки",
            description: "Отсутствует токен подтверждения",
            variant: "destructive",
          });
          return;
        }
        
        // Отправляем запрос на сервер для подтверждения
        const response = await fetch(`${API_URL}/api/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
        
        console.log("token" + token)
        const data = await response.json();
        
        if (response.ok) {
          setStatus("success");
          toast({
            title: "Аккаунт подтвержден",
            description: "Вы успешно активировали свой аккаунт!",
          });
        } else {
          setStatus("error");
          toast({
            title: "Ошибка подтверждения",
            description: data.error || "Не удалось подтвердить аккаунт",
            variant: "destructive",
          });
        }
      } catch (error) {
        setStatus("error");
        toast({
          title: "Ошибка",
          description: "Произошла непредвиденная ошибка",
          variant: "destructive",
        });
      }
    };
    
    verifyAccount();
  }, [location.search, toast]);
  
  const goToHome = () => {
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Подтверждение аккаунта</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-lg">Проверка вашего аккаунта...</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg">Ваш аккаунт успешно подтвержден!</p>
              <p className="text-center text-muted-foreground">
                Теперь вы можете войти в систему, используя свои учетные данные.
              </p>
              <div className="flex space-x-4 mt-4">
                <Button onClick={goToHome} variant="outline">
                  На главную
                </Button>
              </div>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-lg">Ошибка подтверждения аккаунта</p>
              <p className="text-center text-muted-foreground">
                Ссылка для подтверждения недействительна или устарела. Пожалуйста, запросите новую ссылку.
              </p>
              <div className="flex space-x-4 mt-4">
                <Button onClick={goToHome} variant="outline">
                  На главную
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountVerification;
