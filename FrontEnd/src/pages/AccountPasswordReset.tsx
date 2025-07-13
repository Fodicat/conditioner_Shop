import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/config/appConfig";

const AccountPasswordReset = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "ready">("loading");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      setStatus("error");
      toast({
        title: "Ошибка сброса пароля",
        description: "Отсутствует токен подтверждения",
        variant: "destructive",
      });
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${API_URL}/api/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus("ready");
        } else {
          setStatus("error");
          const data = await response.json();
          toast({
            title: "Ошибка проверки токена",
            description: data.error || "Токен недействителен или истек.",
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

    verifyToken();
  }, [location.search, toast]);
  
  const handlePasswordReset = async () => {
    const token = new URLSearchParams(location.search).get("token");
    if (newPassword !== confirmPassword) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus("success");
        toast({
          title: "Пароль изменён",
          description: "Ваш пароль был успешно изменён!",
        });
      } else {
        setStatus("error");
        toast({
          title: "Ошибка сброса пароля",
          description: data.error || "Не удалось изменить пароль",
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
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full animate-scale-in">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Сброс пароля</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-lg">Проверка токена...</p>
            </div>
          )}
          
          {status === "ready" && (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-lg">Токен действителен. Вы можете изменить пароль.</p>
              <input
                type="password"
                placeholder="Новый пароль"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input w-full pl-4 bg-background text-foreground border border-muted rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="password"
                placeholder="Повторите новый пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input w-full pl-4 bg-background text-foreground border border-muted rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg">Ваш пароль был успешно изменён</p>
              <div className="flex space-x-4 mt-4">
                <Button onClick={() => navigate("/")} variant="outline">
                  На главную
                </Button>
              </div>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center space-y-4">
              <XCircle className="h-16 w-16 text-destructive" />
              <p className="text-lg">Ошибка сброса пароля</p>
              <p className="text-center text-muted-foreground">
                Ссылка для сброса пароля недействительна или устарела. Пожалуйста, запросите новую ссылку.
              </p>
              <div className="flex space-x-4 mt-4">
                <Button onClick={() => navigate("/")} variant="outline">
                  На главную
                </Button>
              </div>
            </div>
          )}
          
          {status === "ready" && (
            <Button onClick={handlePasswordReset} disabled={newPassword === "" || confirmPassword === ""} type="submit" className="w-full">
              Сбросить пароль
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPasswordReset;
