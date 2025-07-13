
import { Button } from "@/components/ui/button";
import { LogIn, User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";
import { User as AuthUser } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface AuthSectionProps {
  user: AuthUser | null;
  logout: () => void;
  setIsLoginOpen: (value: boolean) => void;
  setIsRegisterOpen: (value: boolean) => void;
}

export const AuthSection = ({ user, logout, setIsLoginOpen, setIsRegisterOpen }: AuthSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      <ThemeToggle />
      {user ? (
        <>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 custom-button1 animate-fade-in"
            onClick={() => navigate('/user-profile')}
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Пользователь</span>
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 custom-button1 animate-fade-in" 
            onClick={() => {
              logout();
              toast({
                title: "Успешно",
                description: "Вы успешно вышли из аккаунта",
              });
            }}
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Выйти</span>
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 custom-button animate-fade-in" 
            onClick={() => setIsLoginOpen(true)}
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Войти</span>
          </Button>
          <Button 
            className="flex items-center gap-2 custom-button1 animate-fade-in" 
            onClick={() => setIsRegisterOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Регистрация</span>
          </Button>
        </>
      )}
    </div>
  );
};
